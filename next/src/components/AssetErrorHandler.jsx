'use client';

import { useEffect } from 'react';

import { initializeAssetErrorHandling } from '@/utils/assetRetry';

/**
 * AssetErrorHandler Component
 * Initializes error handling and retry logic for S3 assets
 * This component should be included in the root layout
 */
export default function AssetErrorHandler() {
  useEffect(() => {
    // Initialize asset error handling when component mounts
    initializeAssetErrorHandling({
      maxRetries: 3,
      // You can add fallback URLs here if needed
      // fallbackSrc: '/images/placeholder.png',
    });
  }, []);

  return null; // This component doesn't render anything
}
