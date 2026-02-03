import { getTemplateConfig } from '@/lib/templateConstants';

// Version management for cache invalidation
const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0';
const VERSION_KEY = 'app_version';

/**
 * Gets the template default language
 * This is used to set preferred-locale after cache clearing
 */
const getTemplateDefaultLanguage = () => {
  try {
    const templateConfig = getTemplateConfig();
    return templateConfig.defaultLanguage || 'id';
  } catch (error) {
    console.warn(
      '[versionManager] Could not get template config, defaulting to "id"',
      error,
    );
    return 'id';
  }
};

/**
 * Runs cache clear when the app version changes.
 * Returns a promise so callers can await if they need to block on cleanup.
 */
export const checkAndClearCache = async () => {
  if (typeof window === 'undefined') return;

  const storedVersion = localStorage.getItem(VERSION_KEY);

  if (storedVersion !== APP_VERSION) {
    // Clear all caches when version changes
    await clearAllCaches();

    // Update stored version
    localStorage.setItem(VERSION_KEY, APP_VERSION);

    // Set preferred-locale to template default after clearing cache
    // This ensures it's set even if LanguageProvider already ran
    const defaultLanguage = getTemplateDefaultLanguage();
    localStorage.setItem('preferred-locale', defaultLanguage);

    // Dispatch custom event to notify LanguageProvider to update state
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('locale-reset', {
          detail: { locale: defaultLanguage },
        }),
      );
    }

    console.log(
      `App updated from ${storedVersion || 'unknown'} to ${APP_VERSION}`,
    );
  }
};

/**
 * Best-effort clearing of origin-scoped storage:
 * - localStorage / sessionStorage
 * - IndexedDB
 * - Cache Storage (includes PWA/runtime caches)
 * - Registered service workers (then a second cache sweep)
 *
 * Note: HTTP cache and cross-origin caches cannot be cleared from JS.
 */
export const clearAllCaches = async () => {
  try {
    const estimate = async (label) => {
      if (navigator?.storage?.estimate) {
        const { usage, quota } = await navigator.storage.estimate();
        console.log(
          `[cache-clear] ${label} usage=${Math.round(
            (usage || 0) / 1024 / 1024,
          )}MB quota=${Math.round((quota || 0) / 1024 / 1024)}MB`,
        );
      }
    };

    await estimate('before');

    // Clear local/session storage (preferred-locale will be reset to template default by LanguageProvider)
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (err) {
      console.warn('[cache-clear] storage clear failed', err);
    }

    // Clear IndexedDB (guard for browsers without indexedDB.databases)
    if ('indexedDB' in window) {
      try {
        const databases =
          typeof indexedDB.databases === 'function'
            ? await indexedDB.databases()
            : [];
        await Promise.all(
          (databases || []).map((db) => {
            if (!db?.name) return Promise.resolve();
            return new Promise((resolve, reject) => {
              const deleteReq = indexedDB.deleteDatabase(db.name);
              deleteReq.onsuccess = () => resolve();
              deleteReq.onerror = () => reject(deleteReq.error);
              deleteReq.onblocked = () => resolve(); // don't hang
            });
          }),
        );
      } catch (err) {
        console.warn('[cache-clear] indexedDB clear failed', err);
      }
    }

    // Clear Cache Storage (all cache names for this origin)
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName)),
        );
      } catch (err) {
        console.warn('[cache-clear] cache storage clear failed', err);
      }
    }

    // Unregister service workers, then sweep caches again in case they re-added
    if ('serviceWorker' in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(
          registrations.map((registration) => registration.unregister()),
        );
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          await Promise.all(
            cacheNames.map((cacheName) => caches.delete(cacheName)),
          );
        }
      } catch (err) {
        console.warn('[cache-clear] service worker unregister failed', err);
      }
    }

    await estimate('after');
    console.log('[cache-clear] All origin caches cleared (best effort)');
  } catch (error) {
    console.error('Error clearing caches:', error);
  }
};

export const forceReload = () => {
  if (typeof window !== 'undefined') {
    window.location.reload(true);
  }
};
