const CACHE_NAME = 'mastodon-pwa-v1';

// Static assets to cache on install
const STATIC_ASSETS = [
    '/',
    '/icons/icon-192.png',
    '/icons/icon-512.png',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
    // Activate immediately
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        })
    );
    // Take control immediately
    self.clients.claim();
});

// Helper: Clear all Next.js chunk caches and notify clients to reload
async function handleStaleDeployment() {
    const cache = await caches.open(CACHE_NAME);
    const keys = await cache.keys();

    // Delete all cached _next assets
    await Promise.all(
        keys
            .filter((req) => req.url.includes('/_next/'))
            .map((req) => cache.delete(req))
    );

    // Notify all clients to reload
    const clients = await self.clients.matchAll({ type: 'window' });
    clients.forEach((client) => {
        client.postMessage({ type: 'RELOAD_PAGE' });
    });
}

// Fetch event - network first, fall back to cache
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip cross-origin requests
    if (url.origin !== location.origin) {
        return;
    }

    // Skip API requests - always network
    if (url.pathname.startsWith('/api/')) {
        return;
    }

    // For navigation requests (HTML pages) - network first
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // Cache successful responses (exclude partial responses 206)
                    if (response.status === 200) {
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(request, responseClone);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    // Fallback to cache
                    return caches.match(request).then((cached) => {
                        if (cached) return cached;
                        // Ultimate fallback to homepage
                        return caches.match('/');
                    });
                })
        );
        return;
    }

    // For Next.js chunks - network first, no stale cache fallback
    // These have content hashes and return 404 after new deployments
    if (url.pathname.startsWith('/_next/')) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // Cache only complete responses (exclude partial 206)
                    if (response.status === 200) {
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(request, responseClone);
                        });
                        return response;
                    }

                    // If chunk returns 404, deployment happened - clear stale caches
                    if (response.status === 404) {
                        handleStaleDeployment();
                    }

                    return response;
                })
                .catch(() => {
                    // Network failed - try cache but it might be stale
                    return caches.match(request);
                })
        );
        return;
    }

    // For other requests (static assets) - stale while revalidate
    event.respondWith(
        caches.match(request).then((cached) => {
            const fetchPromise = fetch(request).then((response) => {
                // Only cache complete responses (exclude partial 206)
                if (response.status === 200) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, responseClone);
                    });
                }
                return response;
            });
            return cached || fetchPromise;
        })
    );
});

/**
 * Fetch notification details from Mastodon API.
 * @param {string} notificationId - The notification ID
 * @param {string} accessToken - The access token
 * @returns {Promise<Object>} The notification object
 */
const fetchNotification = (notificationId, accessToken) => {
    return fetch(`/api/v1/notifications/${notificationId}`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    }).then(res => {
        if (!res.ok) throw new Error(res.status);
        return res.json();
    });
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

const openUrl = url => self.clients.claim()
    .then(() => self.clients.matchAll({ type: 'window' }))
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

