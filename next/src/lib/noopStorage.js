'use client';

// Use redux-persist's ES module version (better compatibility with Next.js 16)
// This is the recommended approach and matches redux-persist's official implementation
import createWebStorage from 'redux-persist/es/storage/createWebStorage';

// Fallback: Custom implementation matching redux-persist's behavior exactly
// Only used if the import fails
function createCustomWebStorage() {
  const noopStorage = {
    getItem: () => Promise.resolve(null),
    setItem: () => Promise.resolve(),
    removeItem: () => Promise.resolve(),
  };

  // Test if storage is available (matches redux-persist's hasStorage function)
  function hasStorage(storageType) {
    if (typeof window === 'undefined' || typeof self === 'undefined') {
      return false;
    }

    try {
      const storage = self[storageType];
      if (!storage) return false;

      const testKey = `redux-persist ${storageType} test`;
      storage.setItem(testKey, 'test');
      storage.getItem(testKey);
      storage.removeItem(testKey);
      return true;
    } catch (e) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(
          `redux-persist ${storageType} test failed, persistence will be disabled.`,
        );
      }
      return false;
    }
  }

  // Get storage instance (matches redux-persist's getStorage function)
  function getStorage(type) {
    const storageType = `${type}Storage`;
    if (hasStorage(storageType)) {
      return self[storageType];
    }

    if (process.env.NODE_ENV !== 'production') {
      console.error(
        'redux-persist failed to create sync storage. falling back to noop storage.',
      );
    }

    return noopStorage;
  }

  // Create web storage implementation (matches redux-persist's createWebStorage)
  return (type) => {
    const storage = getStorage(type);

    return {
      getItem(key) {
        return new Promise((resolve) => {
          try {
            const item = storage.getItem(key);
            resolve(item);
          } catch (error) {
            if (process.env.NODE_ENV !== 'production') {
              console.warn('storage.getItem error:', error);
            }
            resolve(null);
          }
        });
      },
      setItem(key, item) {
        return new Promise((resolve) => {
          try {
            storage.setItem(key, item);
            resolve(item);
          } catch (error) {
            if (process.env.NODE_ENV !== 'production') {
              console.warn('storage.setItem error:', error);
            }
            resolve(item);
          }
        });
      },
      removeItem(key) {
        return new Promise((resolve) => {
          try {
            storage.removeItem(key);
            resolve();
          } catch (error) {
            if (process.env.NODE_ENV !== 'production') {
              console.warn('storage.removeItem error:', error);
            }
            resolve();
          }
        });
      },
    };
  };
}

// Try to use the official redux-persist implementation
// If it fails (shouldn't with ES module), fallback to custom
let storage;
try {
  if (typeof createWebStorage === 'function') {
    storage =
      typeof window !== 'undefined'
        ? createWebStorage('local')
        : {
          getItem: () => Promise.resolve(null),
          setItem: () => Promise.resolve(),
          removeItem: () => Promise.resolve(),
        };
  } else {
    throw new Error('createWebStorage is not a function');
  }
} catch (error) {
  console.warn(
    'Failed to use redux-persist storage, using custom implementation:',
    error,
  );
  const customCreateWebStorage = createCustomWebStorage();
  storage =
    typeof window !== 'undefined'
      ? customCreateWebStorage('local')
      : {
        getItem: () => Promise.resolve(null),
        setItem: () => Promise.resolve(),
        removeItem: () => Promise.resolve(),
      };
}

export default storage;
