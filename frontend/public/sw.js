// Service Worker for Soil2Crop PWA
const CACHE_NAME = 'soil2crop-v1';
const OFFLINE_PAGE = '/offline.html';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Installation complete, skipping waiting');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Cache failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[SW] Activation complete, claiming clients');
        return self.clients.claim();
      })
  );
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip chrome-extension and other non-http requests
  if (!event.request.url.startsWith('http')) return;
  
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Network request succeeded
        // Clone the response and cache it
        const responseClone = response.clone();
        
        caches.open(CACHE_NAME).then((cache) => {
          // Only cache successful responses
          if (response.status === 200) {
            cache.put(event.request, responseClone);
          }
        });
        
        return response;
      })
      .catch(async () => {
        // Network failed, try cache
        const cachedResponse = await caches.match(event.request);
        
        if (cachedResponse) {
          console.log('[SW] Serving from cache:', event.request.url);
          return cachedResponse;
        }
        
        // If not in cache and it's a page request, serve offline page
        if (event.request.destination === 'document') {
          console.log('[SW] Serving offline page');
          return caches.match(OFFLINE_PAGE);
        }
        
        // Return error response for other requests
        return new Response('Offline - Resource not available', {
          status: 503,
          statusText: 'Service Unavailable'
        });
      })
  );
});

// Message event - handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Skipping waiting on client request');
    return self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_SOIL_REPORT') {
    // Cache soil report data
    const soilData = event.data.payload;
    
    caches.open(CACHE_NAME).then((cache) => {
      const response = new Response(JSON.stringify(soilData), {
        headers: { 'Content-Type': 'application/json' }
      });
      
      cache.put('offline-soil-report', response);
      console.log('[SW] Cached soil report for offline use');
    });
  }
});

console.log('[SW] Service Worker loaded');
