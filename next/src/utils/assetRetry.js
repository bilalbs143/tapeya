/**
 * Asset Retry Utility
 * Handles retrying failed S3 asset loads with exponential backoff
 * and provides fallback mechanisms for broken assets
 */

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second
const MAX_RETRY_DELAY = 10000; // 10 seconds
const REQUEST_TIMEOUT = 15000; // 15 seconds

/**
 * Calculate exponential backoff delay
 */
function getRetryDelay(attempt) {
  const delay = Math.min(
    INITIAL_RETRY_DELAY * Math.pow(2, attempt),
    MAX_RETRY_DELAY,
  );
  // Add jitter to prevent thundering herd
  return delay + Math.random() * 1000;
}

/**
 * Check if an asset URL is accessible
 */
async function checkAssetAccessibility(url) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    const response = await fetch(url, {
      method: 'HEAD',
      mode: 'cors',
      signal: controller.signal,
      cache: 'no-cache',
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Retry loading an asset with exponential backoff
 */
export async function retryAssetLoad(url, options = {}) {
  const { maxRetries = MAX_RETRIES, onRetry, onSuccess, onFailure } = options;

  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        const delay = getRetryDelay(attempt - 1);
        if (onRetry) {
          onRetry(attempt, delay);
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
      }

      const isAccessible = await checkAssetAccessibility(url);
      if (isAccessible) {
        if (onSuccess) {
          onSuccess(url);
        }
        return { success: true, url };
      }

      throw new Error(`Asset not accessible: ${url}`);
    } catch (error) {
      lastError = error;
      if (attempt === maxRetries) {
        if (onFailure) {
          onFailure(url, error);
        }
        return { success: false, url, error: lastError };
      }
    }
  }

  return { success: false, url, error: lastError };
}

/**
 * Handle image load error with retry
 */
export function handleImageError(imgElement, originalSrc, options = {}) {
  const { maxRetries = MAX_RETRIES, fallbackSrc } = options;

  // Prevent infinite loop
  if (imgElement.dataset.retryAttempt) {
    const attempt = parseInt(imgElement.dataset.retryAttempt, 10);
    if (attempt >= maxRetries) {
      // All retries failed, use fallback or hide
      if (fallbackSrc) {
        imgElement.src = fallbackSrc;
        imgElement.dataset.retryAttempt = '';
      } else {
        imgElement.style.display = 'none';
      }
      return;
    }
  }

  const attempt = parseInt(imgElement.dataset.retryAttempt || '0', 10) + 1;
  imgElement.dataset.retryAttempt = attempt.toString();

  const delay = getRetryDelay(attempt - 1);

  setTimeout(() => {
    // Create new image to test if asset is now available
    const testImg = new Image();
    testImg.onload = () => {
      imgElement.src = originalSrc;
      imgElement.dataset.retryAttempt = '';
    };
    testImg.onerror = () => {
      handleImageError(imgElement, originalSrc, options);
    };
    testImg.src =
      originalSrc +
      (originalSrc.includes('?') ? '&' : '?') +
      `_retry=${Date.now()}`;
  }, delay);
}

/**
 * Initialize error handling for all images on the page
 */
export function initializeImageErrorHandling(options = {}) {
  if (typeof window === 'undefined') return;

  const { maxRetries = MAX_RETRIES, fallbackSrc } = options;

  // Handle existing images
  const images = document.querySelectorAll('img[src*="s3"]');
  images.forEach((img) => {
    if (!img.dataset.errorHandlerAttached) {
      img.dataset.errorHandlerAttached = 'true';
      const originalSrc = img.src;

      img.addEventListener('error', () => {
        handleImageError(img, originalSrc, { maxRetries, fallbackSrc });
      });
    }
  });

  // Handle dynamically added images
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) {
          // Element node
          if (node.tagName === 'IMG' && node.src?.includes('s3')) {
            if (!node.dataset.errorHandlerAttached) {
              node.dataset.errorHandlerAttached = 'true';
              const originalSrc = node.src;
              node.addEventListener('error', () => {
                handleImageError(node, originalSrc, {
                  maxRetries,
                  fallbackSrc,
                });
              });
            }
          }
          // Check for images within the added node
          const s3Images = node.querySelectorAll?.('img[src*="s3"]');
          if (s3Images) {
            s3Images.forEach((img) => {
              if (!img.dataset.errorHandlerAttached) {
                img.dataset.errorHandlerAttached = 'true';
                const originalSrc = img.src;
                img.addEventListener('error', () => {
                  handleImageError(img, originalSrc, {
                    maxRetries,
                    fallbackSrc,
                  });
                });
              }
            });
          }
        }
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

/**
 * Handle CSS background image errors
 */
export function handleBackgroundImageError(element, originalUrl, options = {}) {
  const { maxRetries = MAX_RETRIES, fallbackUrl } = options;

  if (element.dataset.bgRetryAttempt) {
    const attempt = parseInt(element.dataset.bgRetryAttempt, 10);
    if (attempt >= maxRetries) {
      if (fallbackUrl) {
        element.style.backgroundImage = `url(${fallbackUrl})`;
      } else {
        element.style.backgroundImage = 'none';
      }
      element.dataset.bgRetryAttempt = '';
      return;
    }
  }

  const attempt = parseInt(element.dataset.bgRetryAttempt || '0', 10) + 1;
  element.dataset.bgRetryAttempt = attempt.toString();

  const delay = getRetryDelay(attempt - 1);

  setTimeout(async () => {
    const isAccessible = await checkAssetAccessibility(originalUrl);
    if (isAccessible) {
      element.style.backgroundImage = `url(${originalUrl})`;
      element.dataset.bgRetryAttempt = '';
    } else {
      handleBackgroundImageError(element, originalUrl, options);
    }
  }, delay);
}

/**
 * Initialize background image error handling
 */
export function initializeBackgroundImageErrorHandling(options = {}) {
  if (typeof window === 'undefined') return;

  const { maxRetries = MAX_RETRIES, fallbackUrl } = options;

  // Check all elements with background images from S3
  const checkBackgroundImages = () => {
    const allElements = document.querySelectorAll('*');
    allElements.forEach((element) => {
      const bgImage = window.getComputedStyle(element).backgroundImage;
      if (bgImage && bgImage.includes('s3') && bgImage !== 'none') {
        const urlMatch = bgImage.match(/url\(["']?([^"']+)["']?\)/);
        if (urlMatch && !element.dataset.bgErrorHandlerAttached) {
          element.dataset.bgErrorHandlerAttached = 'true';
          const originalUrl = urlMatch[1];

          // Test if background image loads
          const testImg = new Image();
          testImg.onerror = () => {
            handleBackgroundImageError(element, originalUrl, {
              maxRetries,
              fallbackUrl,
            });
          };
          testImg.src = originalUrl;
        }
      }
    });
  };

  // Check on load and periodically
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkBackgroundImages);
  } else {
    checkBackgroundImages();
  }

  // Recheck after a delay to catch dynamically added elements
  setTimeout(checkBackgroundImages, 2000);
}

/**
 * Initialize all asset error handling
 */
export function initializeAssetErrorHandling(options = {}) {
  initializeImageErrorHandling(options);
  initializeBackgroundImageErrorHandling(options);
}
