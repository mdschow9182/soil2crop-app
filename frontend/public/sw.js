/// <reference lib="webworker" />

// Service Worker for Soil2Crop - Offline Support
const CACHE_NAME = 'soil2crop-v1';
const STATIC_CACHE = 'soil2crop-static-v1';
const DATA_CACHE = 'soil2crop-data-v1';

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
];

// API endpoints to cache (when successful)
const CACHEABLE_ENDPOINTS = [
  '/api/farmers/',
  '/api/crop-calendar',
  '/soil2crop',
  '/api/market-prices',
  '/api/weather'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Install');
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[ServiceWorker] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  // Force activation even if old service worker is still active
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activate');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete old caches that don't match current version
          if (cacheName !== STATIC_CACHE && cacheName !== DATA_CACHE) {
            console.log('[ServiceWorker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Claim all clients immediately
  return self.clients.claim();
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Handle GET requests
  if (request.method === 'GET') {
    // Check if it's an API request
    if (url.pathname.startsWith('/api/') ||
      url.pathname === '/soil2crop' ||
      url.pathname === '/system/stats' ||
      url.pathname === '/impact/report') {

      event.respondWith(networkFirstStrategy(request));
    } else {
      // Static assets - cache first strategy
      event.respondWith(cacheFirstStrategy(request));
    }
  }

  // Handle POST requests (store in IndexedDB for sync when online)
  if (request.method === 'POST') {
    event.respondWith(handlePostRequest(request));
  }
});

// Network First Strategy for API calls
async function networkFirstStrategy(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);

    // If successful, clone and cache the response
    if (networkResponse.ok) {
      const cache = await caches.open(DATA_CACHE);
      cache.put(request, networkResponse.clone());
      console.log('[ServiceWorker] Cached API response:', request.url);
    }

    return networkResponse;
  } catch (error) {
    // Network failed, try cache
    console.log('[ServiceWorker] Network failed, trying cache:', request.url);
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      console.log('[ServiceWorker] Serving from cache:', request.url);
      return cachedResponse;
    }

    // Return offline error page for navigation requests
    if (request.headers.get('accept')?.includes('text/html')) {
      return caches.match('/offline.html');
    }

    // Return error response
    return new Response(
      JSON.stringify({
        success: false,
        message: 'You are offline. Some features may not work.',
        offline: true
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Cache First Strategy for static assets
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    console.log('[ServiceWorker] Serving static asset from cache:', request.url);

    // Update cache in background (stale-while-revalidate)
    fetch(request).then((networkResponse) => {
      if (networkResponse && networkResponse.ok) {
        caches.open(STATIC_CACHE).then((cache) => {
          cache.put(request, networkResponse);
        });
      }
    }).catch(() => {
      // Network error, ignore - we already have cached version
    });

    return cachedResponse;
  }

  // Not in cache, fetch from network
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
      console.log('[ServiceWorker] Cached static asset:', request.url);
    }

    return networkResponse;
  } catch (error) {
    console.error('[ServiceWorker] Fetch failed:', request.url, error);

    // Return offline page for HTML requests
    if (request.headers.get('accept')?.includes('text/html')) {
      return caches.match('/offline.html');
    }

    throw error;
  }
}

// Handle POST requests when offline
async function handlePostRequest(request) {
  try {
    // Try to send to server
    return await fetch(request);
  } catch (error) {
    console.log('[ServiceWorker] Offline - storing POST request for later sync');

    // Store request in IndexedDB for background sync
    const requestData = await request.clone().text();

    // Open IndexedDB
    const db = await openDatabase();
    const transaction = db.transaction(['pendingRequests'], 'readwrite');
    const store = transaction.objectStore('pendingRequests');

    // Store the request
    await store.add({
      url: request.url,
      method: 'POST',
      body: requestData,
      timestamp: Date.now(),
      synced: false
    });

    console.log('[ServiceWorker] Stored pending request:', request.url);

    // Return queued response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Request queued. Will sync when online.',
        queued: true
      }),
      {
        status: 202,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// IndexedDB helpers
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('Soil2CropSyncDB', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Create object store for pending requests
      if (!db.objectStoreNames.contains('pendingRequests')) {
        db.createObjectStore('pendingRequests', { keyPath: 'id', autoIncrement: true });
      }

      // Create object store for cached predictions
      if (!db.objectStoreNames.contains('cachedPredictions')) {
        db.createObjectStore('cachedPredictions', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

// Background sync for queued requests
async function syncPendingRequests() {
  console.log('[ServiceWorker] Syncing pending requests...');

  try {
    const db = await openDatabase();
    const transaction = db.transaction(['pendingRequests'], 'readwrite');
    const store = transaction.objectStore('pendingRequests');

    const pendingRequests = await new Promise((resolve) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
    });

    for (const pending of pendingRequests) {
      try {
        await fetch(pending.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: pending.body
        });

        // Remove from pending after successful sync
        await store.delete(pending.id);
        console.log('[ServiceWorker] Synced request:', pending.url);
      } catch (error) {
        console.error('[ServiceWorker] Failed to sync:', pending.url, error);
      }
    }
  } catch (error) {
    console.error('[ServiceWorker] Sync error:', error);
  }
}

// Listen for sync events
self.addEventListener('sync', (event) => {
  console.log('[ServiceWorker] Sync event:', event.tag);

  if (event.tag === 'sync-pending-requests') {
    event.waitUntil(syncPendingRequests());
  }
});

// Listen for messages from main app
self.addEventListener('message', (event) => {
  console.log('[ServiceWorker] Message received:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'SYNC_REQUESTS') {
    event.waitUntil(syncPendingRequests());
  }
});

console.log('[ServiceWorker] Service Worker initialized');
