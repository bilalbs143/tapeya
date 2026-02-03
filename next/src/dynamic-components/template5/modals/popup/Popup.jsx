'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import LazyImage from '@/dynamic-components/template5/components/LazyImage/LazyImage';
import { useTranslations } from '@/hooks/useTranslations';
import { closeModal } from '@/slices/common/commonSlice';

export default function Popup() {
  const dispatch = useDispatch();
  const { t } = useTranslations();
  const { activePopups } = useSelector((state) => state.common);
  const [visibleImages, setVisibleImages] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const containerRefs = useRef({});
  const naturalSizeMap = useRef({});
  const [offsetMap, setOffsetMap] = useState({});

  // Initialize visible images when active popups are available
  useEffect(() => {
    if (activePopups && activePopups.length > 0) {
      setVisibleImages(activePopups);
      setIsInitialized(true);
    }
  }, [activePopups]);

  const handleCloseModal = () => {
    dispatch(closeModal('popup'));
  };

  const handleCloseImage = (imageId) => {
    setVisibleImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  const handleDontShowFor24Hours = (imageId) => {
    const hideUntil = Date.now() + 24 * 60 * 60 * 1000;
    localStorage.setItem(`popup_hide_${imageId}`, hideUntil.toString());
    handleCloseImage(imageId);
    try {
      window.dispatchEvent(new Event('popup:hide-updated'));
    } catch (_) {}
  };

  const computeOffsets = (id) => {
    const container = containerRefs.current[id];
    const natural = naturalSizeMap.current[id];
    if (!container || !natural) return;
    requestAnimationFrame(() => {
      const containerRect = container.getBoundingClientRect();
      const containerWidth = containerRect.width;
      const containerHeight = containerRect.height;
      const imageNaturalWidth = natural.width || 1;
      const imageNaturalHeight = natural.height || 1;
      const scale = Math.min(
        containerWidth / imageNaturalWidth,
        containerHeight / imageNaturalHeight,
      );
      const displayedWidth = imageNaturalWidth * scale;
      const displayedHeight = imageNaturalHeight * scale;
      const topOffset = Math.max(0, (containerHeight - displayedHeight) / 2);
      const sideOffset = Math.max(0, (containerWidth - displayedWidth) / 2);
      setOffsetMap((prev) => ({
        ...prev,
        [id]: { top: topOffset, right: sideOffset, width: displayedWidth },
      }));
    });
  };

  useEffect(() => {
    let timeoutId;
    const onResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        visibleImages.forEach((img) => {
          setOffsetMap((prev) => ({
            ...prev,
            [img.id]: { top: 0, right: 0 },
          }));
          setTimeout(() => computeOffsets(img.id), 10);
        });
      }, 100);
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      clearTimeout(timeoutId);
    };
  }, [visibleImages]);

  useEffect(() => {
    if (!visibleImages.length) return;
    const resizeObserver = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        const container = entry.target;
        const imageId = Object.keys(containerRefs.current).find(
          (id) => containerRefs.current[id] === container,
        );
        if (imageId) {
          computeOffsets(imageId);
        }
      });
    });
    visibleImages.forEach((img) => {
      const container = containerRefs.current[img.id];
      if (container) {
        resizeObserver.observe(container);
      }
    });
    return () => {
      resizeObserver.disconnect();
    };
  }, [visibleImages]);

  useEffect(() => {
    if (isInitialized && visibleImages.length === 0) {
      handleCloseModal();
    }
  }, [visibleImages, isInitialized]);

  if (!activePopups || activePopups.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex h-full w-full items-center justify-center overflow-hidden">
      <div className="flex h-full w-full items-center justify-center px-4">
        {visibleImages.map((image, index) => (
          <div
            key={image.id}
            className={`group relative flex h-[80vh] w-full max-w-md flex-col items-center justify-center transition-all duration-500 ${index === 0 ? 'flex' : 'hidden lg:flex'} ${index > 0 ? 'ml-4' : ''}`}
          >
            <div
              className="relative flex h-[calc(100%-60px)] w-full items-center justify-center overflow-hidden rounded-lg bg-transparent"
              ref={(el) => {
                if (el) {
                  containerRefs.current[image.id] = el;
                }
              }}
            >
              <LazyImage
                src={image.image}
                alt={image.title || 'Popup image'}
                className="object-contain transition-transform duration-300"
                fill
                sizes="(max-width: 1024px) 100vw, (max-width: 1200px) 50vw, 33vw"
                placeholder="blur"
                priority={true}
                onLoadingComplete={(i) => {
                  naturalSizeMap.current[image.id] = {
                    width: i.naturalWidth,
                    height: i.naturalHeight,
                  };
                  computeOffsets(image.id);
                }}
              />
              <button
                onClick={() => handleCloseImage(image.id)}
                aria-label={t('close')}
                className="bg-opacity-50 hover:bg-opacity-75 flex h-8 w-8 flex-shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-[#03C72C4D] bg-black leading-none font-bold text-white transition-all duration-300 hover:scale-110"
                style={{
                  position: 'absolute',
                  top: `${(offsetMap[image.id]?.top || 0) + 15}px`,
                  right: `${(offsetMap[image.id]?.right || 0) + 25}px`,
                  zIndex: 10,
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:rotate-180"
                >
                  <path
                    d="M6 6L18 18M18 6L6 18"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
            <div
              className="flex justify-center"
              style={{
                width:
                  offsetMap[image.id]?.width != null
                    ? `${offsetMap[image.id].width}px`
                    : undefined,
                marginTop: `-${offsetMap[image.id]?.top || 0}px`,
              }}
            >
              <button
                onClick={() => handleDontShowFor24Hours(image.id)}
                className="flex w-full cursor-pointer items-center justify-center rounded-b-lg bg-[#20C5FE] px-4 pt-3 pb-4 text-sm font-semibold text-black active:scale-95"
              >
                {t('dont_show_until_24_hours')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
