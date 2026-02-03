/**
 * Asset Retry Handler for HTML Templates
 * Standalone script that can be included in HTML files
 * Handles retrying failed S3 asset loads
 */

(function () {
  'use strict';

  const MAX_RETRIES = 3;
  const INITIAL_RETRY_DELAY = 1000;
  const MAX_RETRY_DELAY = 10000;
  const REQUEST_TIMEOUT = 15000;

  function getRetryDelay(attempt) {
    const delay = Math.min(
      INITIAL_RETRY_DELAY * Math.pow(2, attempt),
      MAX_RETRY_DELAY,
    );
    return delay + Math.random() * 1000;
  }

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

  function handleImageError(imgElement, originalSrc, options) {
    const { maxRetries = MAX_RETRIES, fallbackSrc } = options || {};

    if (imgElement.dataset.retryAttempt) {
      const attempt = parseInt(imgElement.dataset.retryAttempt, 10);
      if (attempt >= maxRetries) {
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
        '_retry=' +
        Date.now();
    }, delay);
  }

  function initializeImageErrorHandling(options) {
    const { maxRetries = MAX_RETRIES, fallbackSrc } = options || {};

    function attachErrorHandler(img) {
      if (
        !img.dataset.errorHandlerAttached &&
        img.src &&
        img.src.includes('s3')
      ) {
        img.dataset.errorHandlerAttached = 'true';
        const originalSrc = img.src;

        img.addEventListener('error', function () {
          handleImageError(img, originalSrc, { maxRetries, fallbackSrc });
        });
      }
    }

    // Handle existing images
    const images = document.querySelectorAll('img');
    images.forEach(attachErrorHandler);

    // Handle dynamically added images
    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        mutation.addedNodes.forEach(function (node) {
          if (node.nodeType === 1) {
            if (node.tagName === 'IMG') {
              attachErrorHandler(node);
            }
            const s3Images =
              node.querySelectorAll && node.querySelectorAll('img');
            if (s3Images) {
              s3Images.forEach(attachErrorHandler);
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

  function handleBackgroundImageError(element, originalUrl, options) {
    const { maxRetries = MAX_RETRIES, fallbackUrl } = options || {};

    if (element.dataset.bgRetryAttempt) {
      const attempt = parseInt(element.dataset.bgRetryAttempt, 10);
      if (attempt >= maxRetries) {
        if (fallbackUrl) {
          element.style.backgroundImage = 'url(' + fallbackUrl + ')';
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

    setTimeout(function () {
      checkAssetAccessibility(originalUrl).then(function (isAccessible) {
        if (isAccessible) {
          element.style.backgroundImage = 'url(' + originalUrl + ')';
          element.dataset.bgRetryAttempt = '';
        } else {
          handleBackgroundImageError(element, originalUrl, options);
        }
      });
    }, delay);
  }

  function initializeBackgroundImageErrorHandling(options) {
    const { maxRetries = MAX_RETRIES, fallbackUrl } = options || {};

    function checkBackgroundImages() {
      const allElements = document.querySelectorAll('*');
      allElements.forEach(function (element) {
        const bgImage = window.getComputedStyle(element).backgroundImage;
        if (bgImage && bgImage.includes('s3') && bgImage !== 'none') {
          const urlMatch = bgImage.match(/url\(["']?([^"']+)["']?\)/);
          if (urlMatch && !element.dataset.bgErrorHandlerAttached) {
            element.dataset.bgErrorHandlerAttached = 'true';
            const originalUrl = urlMatch[1];

            const testImg = new Image();
            testImg.onerror = function () {
              handleBackgroundImageError(element, originalUrl, {
                maxRetries,
                fallbackUrl,
              });
            };
            testImg.src = originalUrl;
          }
        }
      });
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', checkBackgroundImages);
    } else {
      checkBackgroundImages();
    }

    setTimeout(checkBackgroundImages, 2000);
  }

  function initializeAssetErrorHandling(options) {
    initializeImageErrorHandling(options);
    initializeBackgroundImageErrorHandling(options);
  }

  // Auto-initialize when script loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initializeAssetErrorHandling();
    });
  } else {
    initializeAssetErrorHandling();
  }

  // Export for manual initialization if needed
  window.initializeAssetErrorHandling = initializeAssetErrorHandling;
})();
