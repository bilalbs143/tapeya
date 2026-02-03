'use client';

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';

import CommonLoader from '@/components/CommonLoader/CommonLoader.jsx';
import { useTranslations } from '@/hooks/useTranslations.js';

// Default blur placeholder - smaller and more efficient
const DEFAULT_BLUR_DATA_URL =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';

// Transition classes constant
const LOADING_TRANSITION = 'transition-opacity duration-500 ease-in-out';

const LazyImage = ({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  placeholder = 'blur',
  blurDataURL,
  quality = 90,
  rootMargin = '100px',
  threshold = 0.1,
  showLoadingIndicator = false,
  fill,
  sizes,
  ...props
}) => {
  const { t } = useTranslations();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Use callback ref to avoid dependencies issues
  const imgRef = useCallback(
    (node) => {
      if (priority || !node) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            setIsLoading(true);
            observer.disconnect();
          }
        },
        {
          rootMargin,
          threshold,
        },
      );

      observer.observe(node);

      // Cleanup function
      return () => observer.disconnect();
    },
    [priority, rootMargin, threshold],
  );

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    setIsLoading(false);
  }, []);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoaded(false);
    setIsLoading(false);
  }, []);

  // Reset states when src changes
  useEffect(() => {
    setHasError(false);
    setIsLoaded(false);
    setIsLoading(false);
    if (!priority) {
      setIsInView(false);
    }
  }, [src, priority]);

  // Generate blur placeholder
  const getBlurDataURL = useCallback(() => {
    return blurDataURL || DEFAULT_BLUR_DATA_URL;
  }, [blurDataURL]);

  // Error placeholder component - takes full available space
  const ErrorPlaceholder = () => {
    const containerClass = fill
      ? 'absolute inset-0 w-full h-full'
      : 'w-full h-full';

    return (
      <div
        className={`flex items-center justify-center bg-[#1a1a1a] text-gray-400 ${containerClass} ${className}`}
        role="img"
        aria-label={alt || t('image_unavailable')}
        style={
          width && height && !fill
            ? { width: `${width}px`, height: `${height}px` }
            : undefined
        }
      >
        <div className="flex max-w-full flex-col items-center gap-2 p-4">
          <svg
            className="h-10 w-10 text-gray-500 sm:h-12 sm:w-12"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="px-2 text-center text-xs text-gray-500 sm:text-sm">
            {t('image_unavailable', 'Image Not Available')}
          </span>
        </div>
      </div>
    );
  };

  // Loading placeholder component
  const LoadingPlaceholder = () => (
    <div
      className={`flex items-center justify-center ${className}`}
      role="img"
      aria-label={`Loading ${alt || ''}`}
    >
      {showLoadingIndicator && (
        <CommonLoader size="sm" centered={false} border="border-[#D3AF37]" />
      )}
    </div>
  );

  // Show error placeholder if image failed to load
  if (hasError) {
    return <ErrorPlaceholder />;
  }

  // For priority images, render immediately
  if (priority) {
    const imageProps = fill ? { fill: true, sizes } : { width, height };

    return (
      <Image
        src={src}
        alt={alt}
        className={`${LOADING_TRANSITION} ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={getBlurDataURL()}
        onLoad={handleLoad}
        onError={handleError}
        priority
        loading="eager"
        {...imageProps}
        {...props}
      />
    );
  }

  // Show placeholder until image comes into view
  if (!isInView) {
    return (
      <div
        ref={imgRef}
        className={`flex items-center justify-center ${className} ${fill ? 'absolute inset-0 h-full w-full' : ''}`}
        aria-hidden="true"
      >
        <CommonLoader size="sm" centered={false} border="border-[#D3AF37]" />
      </div>
    );
  }

  // Show loading state if enabled
  if (isLoading && !isLoaded && showLoadingIndicator) {
    return <LoadingPlaceholder />;
  }

  // Render the actual image when in view
  const imageProps = fill ? { fill: true, sizes } : { width, height };

  return (
    <Image
      src={src}
      alt={alt}
      quality={quality}
      placeholder={placeholder}
      blurDataURL={getBlurDataURL()}
      className={`${LOADING_TRANSITION} ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
      onLoad={handleLoad}
      onError={handleError}
      loading="lazy"
      {...imageProps}
      {...props}
    />
  );
};

export default LazyImage;
