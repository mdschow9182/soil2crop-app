/**
 * Offline Mode Service
 * Manages offline functionality, caching, and data synchronization
 */

class OfflineService {
  private isOnline: boolean;
  private cacheVersion: string;
  private cacheName: string;

  constructor() {
    this.isOnline = navigator.onLine;
    this.cacheVersion = 'v1';
    this.cacheName = `soil2crop-cache-${this.cacheVersion}`;
    
    // Listen for online/offline events
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline.bind(this));
      window.addEventListener('offline', this.handleOffline.bind(this));
    }
  }

  /**
   * Check if app is online
   */
  checkOnlineStatus() {
    return navigator.onLine;
  }

  /**
   * Handle online event
   */
  handleOnline() {
    this.isOnline = true;
    console.log('[Offline] App is back online');
    this.syncCachedData();
    this.clearOfflineIndicator();
  }

  /**
   * Handle offline event
   */
  handleOffline() {
    this.isOnline = false;
    console.log('[Offline] App went offline');
    this.showOfflineIndicator();
  }

  /**
   * Show offline indicator in UI
   */
  showOfflineIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'offline-indicator';
    indicator.innerHTML = `
      <div class="fixed top-0 left-0 right-0 bg-orange-500 text-white px-4 py-2 text-center text-sm font-medium z-50">
        📡 Offline Mode - Showing cached data
      </div>
    `;
    document.body.insertBefore(indicator, document.body.firstChild);
  }

  /**
   * Clear offline indicator
   */
  clearOfflineIndicator() {
    const indicator = document.getElementById('offline-indicator');
    if (indicator) {
      indicator.remove();
    }
  }

  /**
   * Cache soil report data
   */
  async cacheSoilReport(soilData) {
    try {
      const cache = await caches.open(this.cacheName);
      const response = new Response(JSON.stringify(soilData), {
        headers: { 'Content-Type': 'application/json' }
      });
      
      await cache.put('last-soil-report', response);
      
      // Also store in localStorage for quick access
      localStorage.setItem('lastSoilReport', JSON.stringify(soilData));
      localStorage.setItem('lastSoilReportTime', Date.now().toString());
      
      console.log('[Offline] Soil report cached');
    } catch (error) {
      console.error('[Offline] Failed to cache soil report:', error);
    }
  }

  /**
   * Get cached soil report
   */
  async getCachedSoilReport() {
    try {
      // Try localStorage first (faster)
      const cached = localStorage.getItem('lastSoilReport');
      if (cached) {
        const data = JSON.parse(cached);
        const cacheTime = localStorage.getItem('lastSoilReportTime');
        
        // Check if cache is less than 24 hours old
        const age = Date.now() - parseInt(cacheTime || '0');
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours
        
        if (age < maxAge) {
          console.log('[Offline] Retrieved fresh cached soil report');
          return { data, fromCache: true };
        }
      }
      
      // Try cache storage
      const cache = await caches.open(this.cacheName);
      const response = await cache.match('last-soil-report');
      
      if (response) {
        const data = await response.json();
        console.log('[Offline] Retrieved cached soil report from cache storage');
        return { data, fromCache: true };
      }
      
      return null;
    } catch (error) {
      console.error('[Offline] Failed to get cached soil report:', error);
      return null;
    }
  }

  /**
   * Cache crop recommendations
   */
  async cacheRecommendations(recommendations) {
    try {
      localStorage.setItem('lastRecommendations', JSON.stringify(recommendations));
      localStorage.setItem('lastRecommendationsTime', Date.now().toString());
      console.log('[Offline] Recommendations cached');
    } catch (error) {
      console.error('[Offline] Failed to cache recommendations:', error);
    }
  }

  /**
   * Get cached recommendations
   */
  async getCachedRecommendations() {
    try {
      const cached = localStorage.getItem('lastRecommendations');
      if (!cached) return null;
      
      const data = JSON.parse(cached);
      const cacheTime = localStorage.getItem('lastRecommendationsTime');
      
      // Check if cache is less than 24 hours old
      const age = Date.now() - parseInt(cacheTime || '0');
      const maxAge = 24 * 60 * 60 * 1000;
      
      if (age < maxAge) {
        console.log('[Offline] Retrieved fresh cached recommendations');
        return { data, fromCache: true };
      }
      
      return null;
    } catch (error) {
      console.error('[Offline] Failed to get cached recommendations:', error);
      return null;
    }
  }

  /**
   * Sync cached data when back online
   */
  async syncCachedData() {
    try {
      const pendingActions = localStorage.getItem('pendingActions');
      if (!pendingActions) return;
      
      const actions = JSON.parse(pendingActions);
      console.log(`[Offline] Syncing ${actions.length} pending actions`);
      
      // Process each pending action
      for (const action of actions) {
        // TODO: Implement actual sync logic based on action type
        console.log('[Offline] Synced action:', action.type);
      }
      
      // Clear pending actions after sync
      localStorage.removeItem('pendingActions');
    } catch (error) {
      console.error('[Offline] Sync failed:', error);
    }
  }

  /**
   * Queue action for later sync
   */
  queueAction(action) {
    try {
      const pendingActions = JSON.parse(localStorage.getItem('pendingActions') || '[]');
      pendingActions.push({
        ...action,
        queuedAt: Date.now()
      });
      
      localStorage.setItem('pendingActions', JSON.stringify(pendingActions));
      console.log('[Offline] Action queued:', action.type);
    } catch (error) {
      console.error('[Offline] Failed to queue action:', error);
    }
  }

  /**
   * Register service worker
   */
  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });
        
        console.log('[Offline] Service Worker registered:', registration.scope);
        
        // Handle updates
        registration.addEventListener('updatefound', () => {
          console.log('[Offline] Service Worker update found');
        });
        
        return registration;
      } catch (error) {
        console.error('[Offline] Service Worker registration failed:', error);
      }
    }
    return null;
  }

  /**
   * Clear all caches
   */
  async clearCache() {
    try {
      localStorage.removeItem('lastSoilReport');
      localStorage.removeItem('lastSoilReportTime');
      localStorage.removeItem('lastRecommendations');
      localStorage.removeItem('lastRecommendationsTime');
      localStorage.removeItem('pendingActions');
      
      const cache = await caches.open(this.cacheName);
      await cache.delete('last-soil-report');
      
      console.log('[Offline] Cache cleared');
    } catch (error) {
      console.error('[Offline] Failed to clear cache:', error);
    }
  }

  /**
   * Get cache status
   */
  getCacheStatus() {
    const soilReport = localStorage.getItem('lastSoilReport');
    const recommendations = localStorage.getItem('lastRecommendations');
    const pendingActions = localStorage.getItem('pendingActions');
    
    return {
      isOnline: this.isOnline,
      hasSoilReport: !!soilReport,
      hasRecommendations: !!recommendations,
      pendingActionsCount: pendingActions ? JSON.parse(pendingActions).length : 0,
      cacheVersion: this.cacheVersion
    };
  }
}

// Export singleton instance
const offlineService = new OfflineService();

// Auto-register service worker if in browser
if (typeof window !== 'undefined') {
  offlineService.registerServiceWorker();
}

module.exports = offlineService;
