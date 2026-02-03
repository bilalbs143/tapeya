'use client';

import React, { useState } from 'react';

import { clearAllCaches, forceReload } from '@/utils/versionManager';

const CacheManager = () => {
  const [isClearing, setIsClearing] = useState(false);

  const handleClearCache = async () => {
    setIsClearing(true);
    try {
      await clearAllCaches();
      // Show success message or reload
      setTimeout(() => {
        forceReload();
      }, 1000);
    } catch (error) {
      console.error('Failed to clear cache:', error);
      setIsClearing(false);
    }
  };

  // for apk
  return null;

  // Only show in development or add a special key combination
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed right-4 bottom-4 z-50">
      <button
        onClick={handleClearCache}
        disabled={isClearing}
        className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:bg-gray-400"
      >
        {isClearing ? 'Clearing...' : 'Clear Cache'}
      </button>
    </div>
  );
};

export default CacheManager;
