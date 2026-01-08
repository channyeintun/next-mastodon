/**
 * Service Worker for Push Notifications
 * This service worker handles push notifications from Mastodon.
 * Caching functionality has been removed to avoid page reload issues.
 */

// Activate immediately and take control
self.addEventListener('install', () => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    // Clean up any old caches from previous PWA implementation
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((name) => caches.delete(name))
            );
        })
    );
    self.clients.claim();
});

/**
 * Fetch notification details from Mastodon API.
 * @param {string} notificationId - The notification ID
 * @param {string} accessToken - The access token
 * @returns {Promise<Object>} The notification object
 */
const fetchNotification = async (notificationId, accessToken) => {
    // Get instance URL from cookie
    const cookie = await cookieStore.get('instanceURL');
    const instanceURL = cookie?.value;

    if (!instanceURL) {
        throw new Error('No instance URL found');
    }

    const res = await fetch(`${instanceURL}/api/v1/notifications/${notificationId}`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    });

    if (!res.ok) throw new Error(res.status);
    return res.json();
};

/**
 * Build the correct URL for a notification based on fetched notification data.
 * Matches Mastodon's approach: status notifications go to /@acct/statusId, others go to /@acct
 * @param {Object} notification - The fetched notification object
 * @returns {string} The URL to navigate to
 */
const buildNotificationUrl = (notification) => {
    if (notification.status) {
        return `/status/${notification.status.id}`;
    }
    return `/@${notification.account.acct}`;
};

/**
 * Find the best client to focus (focused > visible > any).
 * @param {Array} clients - List of window clients
 * @returns {WindowClient|undefined}
 */
const findBestClient = (clients) => {
    const focusedClient = clients.find(client => client.focused);
    const visibleClient = clients.find(client => client.visibilityState === 'visible');
    return focusedClient || visibleClient || clients[0];
};

/**
 * Strip HTML tags from a string.
 * @param {string} html 
 * @returns {string}
 */
const htmlToPlainText = (html) => {
    if (!html) return '';
    return html.replace(/<br\s*\/?>/g, '\n').replace(/<\/p><p>/g, '\n\n').replace(/<[^>]*>/g, '');
};

// Push notification event - handle incoming push messages from Mastodon
self.addEventListener('push', (event) => {
    if (!event.data) return;

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(async (clientList) => {
            // Skip notification if app is already focused (user will see it in-app)
            const isAppFocused = clientList.some(client => client.focused);
            if (isAppFocused) {
                return;
            }

            try {
                // Push payload only contains: access_token, notification_id, preferred_locale, title, body, icon
                const { access_token, notification_id, preferred_locale, title, body, icon } = event.data.json();

                // Fetch full notification details from API (like Mastodon does)
                const notification = await fetchNotification(notification_id, access_token);

                // Build URL from fetched notification
                const targetUrl = buildNotificationUrl(notification);

                // Build notification options
                const options = {
                    body: notification.status ? htmlToPlainText(notification.status.content) : body,
                    icon: notification.account?.avatar_static || icon || '/icons/icon-192.png',
                    badge: '/icons/icon-192.png',
                    tag: notification.id || notification_id,
                    timestamp: notification.created_at && new Date(notification.created_at),
                    data: {
                        url: targetUrl,
                        access_token,
                        preferred_locale,
                        id: notification.status ? notification.status.id : notification.account.id,
                    },
                    vibrate: [100, 50, 100],
                    requireInteraction: false,
                };

                // Add image if available (e.g. from media attachments)
                if (notification.status?.media_attachments?.length > 0) {
                    options.image = notification.status.media_attachments[0].preview_url;
                }

                return self.registration.showNotification(title || 'Mastodon', options);
            } catch (error) {
                // If fetching fails, show a generic notification with fallback data
                console.error('[SW] Error fetching notification:', error);
                try {
                    const { title, body, icon } = event.data.json();
                    return self.registration.showNotification(title || 'Mastodon', {
                        body: body || 'You have a new notification',
                        icon: icon || '/icons/icon-192.png',
                        badge: '/icons/icon-192.png',
                        data: { url: '/notifications' },
                    });
                } catch {
                    return self.registration.showNotification('Mastodon', {
                        body: 'You have a new notification',
                        icon: '/icons/icon-192.png',
                        badge: '/icons/icon-192.png',
                        data: { url: '/notifications' },
                    });
                }
            }
        })
    );
});

const openUrl = url => self.clients.matchAll({ type: 'window' })
    .then(clientList => {
        if (clientList.length !== 0 && 'navigate' in clientList[0]) { // Chrome 42-48 does not support navigate
            const client = findBestClient(clientList);
            'focus' in client && client.focus();
            return client.navigate(url);
        }

        return self.clients.openWindow(url);
    });

// Notification click event - handle user clicks on notifications
self.addEventListener('notificationclick', (event) => {
    const reactToNotificationClick = new Promise((resolve, reject) => {
        event.notification.close();
        resolve(openUrl(event.notification.data?.url || '/'));
    });

    event.waitUntil(reactToNotificationClick);
});

// Dummy fetch listener to satisfy PWA installability requirements
// We don't cache anything to avoid Next.js caching issues
self.addEventListener('fetch', (event) => {
    // Just perform a normal network request
    event.respondWith(fetch(event.request));
});
