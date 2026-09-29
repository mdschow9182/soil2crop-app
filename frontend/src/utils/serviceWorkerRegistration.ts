/**
 * Service Worker Registration Utility
 * Registers service worker for offline support
 */

export function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then((registration) => {
                    console.log('[SW] Service Worker registered successfully:', registration.scope);

                    // Check for updates periodically
                    setInterval(() => {
                        registration.update();
                    }, 60 * 60 * 1000); // Check every hour

                    // Listen for updates
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;

                        if (newWorker) {
                            newWorker.addEventListener('statechange', () => {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    // New content available
                                    console.log('[SW] New content available, refresh to update');

                                    // Show notification to user
                                    showUpdateNotification();
                                }
                            });
                        }
                    });
                })
                .catch((error) => {
                    console.error('[SW] Service Worker registration failed:', error);
                });
        });
    }
}

// Show update notification
function showUpdateNotification() {
    // Create custom event that components can listen to
    const event = new CustomEvent('sw-update-available', {
        detail: { message: 'New version available! Refresh to update.' }
    });
    window.dispatchEvent(event);

    // Optional: Show browser notification if permission granted
    if ('Notification' in navigator && Notification.permission === 'granted') {
        new Notification('Soil2Crop Update', {
            body: 'New version available! Refresh the page to get the latest features.',
            icon: '/logo192.png'
        });
    }
}

// Request notification permission
export function requestNotificationPermission() {
    if ('Notification' in navigator) {
        Notification.requestPermission().then((permission) => {
            console.log('[SW] Notification permission:', permission);
        });
    }
}

// Queue a request for later sync when online
export async function queueRequest(url: string, data: any) {
    if ('serviceWorker' in navigator && 'IndexedDB' in window) {
        try {
            // Open IndexedDB
            const db = await openDatabase();
            const transaction = db.transaction(['pendingRequests'], 'readwrite');
            const store = transaction.objectStore('pendingRequests');

            // Store the request
            await store.add({
                url,
                method: 'POST',
                body: JSON.stringify(data),
                timestamp: Date.now(),
                synced: false
            });

            console.log('[SW] Request queued for sync:', url);

            // Trigger background sync if available (check with type assertion)
            if ('syncManager' in window) {
                try {
                    const registration = await navigator.serviceWorker.ready;
                    await (registration as any).sync.register('sync-pending-requests');
                } catch (syncError) {
                    console.warn('[SW] Background sync not available:', syncError);
                }
            }

            return { success: true, queued: true };
        } catch (error) {
            console.error('[SW] Failed to queue request:', error);
            return { success: false, error: error.message };
        }
    }

    return { success: false, error: 'Service Worker not available' };
}

// Get cached predictions from IndexedDB
export async function getCachedPredictions() {
    try {
        const db = await openDatabase();
        const transaction = db.transaction(['cachedPredictions'], 'readwrite');
        const store = transaction.objectStore('cachedPredictions');

        return await new Promise((resolve) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
        });
    } catch (error) {
        console.error('[SW] Failed to get cached predictions:', error);
        return [];
    }
}

// Cache a prediction for offline access
export async function cachePrediction(prediction: any) {
    try {
        const db = await openDatabase();
        const transaction = db.transaction(['cachedPredictions'], 'readwrite');
        const store = transaction.objectStore('cachedPredictions');

        await store.add({
            ...prediction,
            cachedAt: Date.now()
        });

        console.log('[SW] Prediction cached');
        return { success: true };
    } catch (error) {
        console.error('[SW] Failed to cache prediction:', error);
        return { success: false, error: error.message };
    }
}

// IndexedDB helper
function openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('Soil2CropSyncDB', 1);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event: any) => {
            const db = event.target.result;

            // Create object stores if they don't exist
            if (!db.objectStoreNames.contains('pendingRequests')) {
                db.createObjectStore('pendingRequests', { keyPath: 'id', autoIncrement: true });
            }

            if (!db.objectStoreNames.contains('cachedPredictions')) {
                db.createObjectStore('cachedPredictions', { keyPath: 'id', autoIncrement: true });
            }
        };
    });
}

// Check if app is online
export function isOnline() {
    return navigator.onLine;
}

// Listen for online/offline events
export function onConnectionChange(callback: (online: boolean) => void) {
    window.addEventListener('online', () => callback(true));
    window.addEventListener('offline', () => callback(false));

    // Return cleanup function
    return () => {
        window.removeEventListener('online', () => callback(true));
        window.removeEventListener('offline', () => callback(false));
    };
}
