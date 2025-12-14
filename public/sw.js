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
                    // Cache successful responses
                    if (response.ok) {
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
                    if (response.ok) {
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
                if (response.ok) {
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
 * Build the correct URL for a notification based on its type.
 * @param {Object} data - The notification data from push payload
 * @returns {string} The URL to navigate to
 */
function buildNotificationUrl(data) {
    const type = data.notification_type || data.type;

    // Status-related notifications → go to status page
    if (['mention', 'reply', 'favourite', 'reblog', 'poll', 'status', 'update', 'emoji_reaction'].includes(type)) {
        const statusId = data.status_id || data.status?.id;
        if (statusId) {
            return `/statuses/${statusId}`;
        }
    }

    // Account-related notifications → go to profile page
    if (['follow', 'follow_request', 'admin.sign_up'].includes(type)) {
        const acct = data.account_acct || data.account?.acct;
        if (acct) {
            return `/@${acct}`;
        }
    }

    // Report notifications → admin page
    if (type === 'admin.report') {
        return '/notifications';
    }

    // Severed relationships notification
    if (type === 'severed_relationships') {
        return '/notifications';
    }

    // If a direct URL was provided, use it
    if (data.url || data.notification_url) {
        return data.url || data.notification_url;
    }

    // Default fallback
    return '/notifications';
}

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
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // Skip notification if app is already focused (user will see it in-app)
            const isAppFocused = clientList.some(client => client.focused);
            if (isAppFocused) {
                return;
            }

            try {
                const data = event.data.json();

                // Build the correct URL based on notification type
                const targetUrl = buildNotificationUrl(data);

                // Format body text (strip HTML if present)
                let body = data.body || data.message || 'New notification';
                if (data.status && data.status.content) {
                    body = htmlToPlainText(data.status.content);
                }

                // Mastodon sends notifications in a specific format
                const options = {
                    body: body,
                    icon: data.icon || data.account?.avatar_static || '/icons/icon-192.png',
                    badge: '/icons/icon-192.png',
                    tag: data.notification_id || data.tag || 'mastodon-notification',
                    data: {
                        url: targetUrl,
                        notification_id: data.notification_id,
                        type: data.notification_type || data.type,
                        // Store additional data for potential future use
                        status_id: data.status_id || data.status?.id,
                        account_id: data.account_id || data.account?.id,
                        account_acct: data.account_acct || data.account?.acct,
                    },
                    vibrate: [100, 50, 100],
                    requireInteraction: false,
                };

                // Add image if available (e.g. from media attachments)
                if (data.status && data.status.media_attachments && data.status.media_attachments.length > 0) {
                    options.image = data.status.media_attachments[0].preview_url;
                }

                const title = data.title || 'Mastodon';

                return self.registration.showNotification(title, options);
            } catch (error) {
                // If JSON parsing fails, try to show a generic notification
                console.error('[SW] Error parsing push data:', error);
                return self.registration.showNotification('Mastodon', {
                    body: 'You have a new notification',
                    icon: '/icons/icon-192.png',
                    badge: '/icons/icon-192.png',
                    data: { url: '/notifications' },
                });
            }
        })
    );
});

// Notification click event - handle user clicks on notifications
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const notificationData = event.notification.data || {};

    // Use stored URL, or rebuild from stored data if needed
    let url = notificationData.url;
    if (!url || url === '/') {
        // Try to rebuild URL from stored notification data
        url = buildNotificationUrl(notificationData);
    }

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // Try to focus an existing window
            for (const client of clientList) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    client.focus();
                    client.navigate(url);
                    return;
                }
            }

            // If no existing window, open a new one
            if (clients.openWindow) {
                return clients.openWindow(url);
            }
        })
    );
});

