/**
 * Service Worker for Offline Support and Caching
 */

const CACHE_NAME = 'dernek-cache-v1';
const OFFLINE_URL = '/offline.html';

// Resources to cache immediately
const PRECACHE_RESOURCES = [
  '/',
  '/offline.html',
  '/manifest.json',
];

// Resources to cache on first request
const RUNTIME_RESOURCES = [
  '/api/',
  '/_next/',
  '/static/',
];

// Install event - cache precache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Pre-caching resources');
      return cache.addAll(PRECACHE_RESOURCES);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match(OFFLINE_URL);
      })
    );
    return;
  }

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful GET requests
          if (request.method === 'GET' && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fall back to cache
          return caches.match(request);
        })
    );
    return;
  }

  // Handle static resources
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then((response) => {
        // Cache GET requests for static resources
        if (request.method === 'GET' && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      });
    })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-offline-actions') {
    event.waitUntil(syncOfflineActions());
  }
});

// Sync offline actions when back online
async function syncOfflineActions() {
  try {
    const db = await openDB();
    const transaction = db.transaction(['offlineActions'], 'readonly');
    const store = transaction.objectStore('offlineActions');
    const actions = await store.getAll();

    for (const action of actions) {
      try {
        await fetch('/api/sync', {
          method: 'POST',
          body: JSON.stringify(action),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        // Remove successful action from queue
        const deleteTransaction = db.transaction(['offlineActions'], 'readwrite');
        const deleteStore = deleteTransaction.objectStore('offlineActions');
        await deleteStore.delete(action.id);
      } catch (error) {
        console.error('Failed to sync action', action, error);
      }
    }
  } catch (error) {
    console.error('Failed to sync offline actions', error);
  }
}

// IndexedDB for offline storage
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('DernekDB', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains('offlineActions')) {
        db.createObjectStore('offlineActions', { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains('cache')) {
        db.createObjectStore('cache', { keyPath: 'key' });
      }
    };
  });
}

// Push notification support
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};

  const options = {
    body: data.body || 'Yeni bildirim',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    data: data,
    actions: [
      {
        action: 'view',
        title: 'Görüntüle',
      },
      {
        action: 'dismiss',
        title: 'Kapat',
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Dernek Yönetim Sistemi', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'view') {
    const urlToOpen = event.notification.data?.url || '/';
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
    );
  }
});

// Periodic background sync for data updates
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  try {
    // Sync pending changes
    await syncOfflineActions();

    // Refresh cache
    const cache = await caches.open(CACHE_NAME);
    const requests = await cache.keys();

    await Promise.all(
      requests.map(async (request) => {
        try {
          await fetch(request);
        } catch (error) {
          console.error('Failed to refresh cache for', request.url, error);
        }
      })
    );
  } catch (error) {
    console.error('Failed to sync data', error);
  }
}

export {};
