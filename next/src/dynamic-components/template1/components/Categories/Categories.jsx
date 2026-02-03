import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';

import LazyImage from '@/dynamic-components/template1/components/LazyImage/LazyImage.jsx';
import { useTranslations } from '@/hooks/useTranslations';

// Static categories data - moved outside component to prevent recreation
const getCategories = (t) => [
  {
    id: 1,
    icon: 'https://d3emlo5tm9es2f.cloudfront.net/next/icons/cat-1.png',
    href: '/slots',
    label: t('slots'),
  },
  {
    id: 2,
    icon: 'https://d3emlo5tm9es2f.cloudfront.net/next/icons/cat-3.png',
    href: '/live-casino',
    label: t('casino'),
  },
  {
    id: 3,
    icon: 'https://d3emlo5tm9es2f.cloudfront.net/next/icons/cat-2.png',
    href: '/live-casino',
    label: t('live_games'),
  },
  {
    id: 4,
    icon: 'https://d3emlo5tm9es2f.cloudfront.net/next/icons/cat-4.png',
    href: '/sports',
    label: t('sports'),
    disabled: true,
  },
  {
    id: 5,
    icon: 'https://d3emlo5tm9es2f.cloudfront.net/next/icons/cat-5.png',
    href: '/p2p',
    label: t('p2p'),
    disabled: true,
  },
  {
    id: 6,
    icon: 'https://d3emlo5tm9es2f.cloudfront.net/next/icons/cat-6.png',
    href: '/fish-hunting',
    label: t('fish_hunting'),
    disabled: true,
  },
  {
    id: 7,
    icon: 'https://d3emlo5tm9es2f.cloudfront.net/next/icons/cat-7.png',
    href: '/lottery',
    label: t('lottery'),
    disabled: true,
  },
  {
    id: 8,
    icon: 'https://d3emlo5tm9es2f.cloudfront.net/next/icons/cat-8.png',
    href: '/e-games',
    label: t('e_games'),
    disabled: true,
  },
  {
    id: 9,
    icon: 'https://d3emlo5tm9es2f.cloudfront.net/next/icons/cat-9.png',
    href: '/promos',
    label: t('promos'),
    disabled: true,
  },
  {
    id: 10,
    icon: 'https://d3emlo5tm9es2f.cloudfront.net/next/icons/cat-10.png',
    href: '/rtp',
    label: t('rtp'),
    disabled: true,
  },
];

function Categories() {
  const { t } = useTranslations();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showSlider, setShowSlider] = useState(false);
  const [itemsPerView, setItemsPerView] = useState(10);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [calculatedItemWidth, setCalculatedItemWidth] = useState(115); // icon+padding width used for slider math
  const sliderRef = useRef(null);
  const containerRef = useRef(null);
  const autoPlayRef = useRef(null);
  const isPointerDownRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragOffsetRef = useRef(0);
  const startTransformRef = useRef(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Get categories from static function
  const categories = getCategories(t);

  // Check if slider is needed based on screen width (<=1200px)
  useEffect(() => {
    const checkSliderNeeded = () => {
      if (containerRef.current) {
        const windowWidth = window.innerWidth;
        const containerWidth = containerRef.current.offsetWidth;
        // Determine icon/base width responsively (<=1024 uses smaller icon to also affect 768px)
        const iconWidth = windowWidth >= 1024 ? 100 : 70;
        const baseItemWidth = iconWidth + 15; // approximate padding/margins around icon
        const fullItemWidth = baseItemWidth + 16; // add flex gap
        setCalculatedItemWidth(baseItemWidth);

        // Show slider when screen width is < 1200px
        if (windowWidth < 1200) {
          const maxItems = Math.floor(containerWidth / fullItemWidth);
          setItemsPerView(Math.max(1, maxItems));
          setShowSlider(true);
        } else {
          setItemsPerView(categories.length);
          setShowSlider(false);
          setCurrentIndex(0);
        }
      }
    };

    checkSliderNeeded();
    window.addEventListener('resize', checkSliderNeeded);

    return () => window.removeEventListener('resize', checkSliderNeeded);
  }, [categories.length]);

  // Autoplay functionality
  useEffect(() => {
    if (showSlider && isAutoPlaying) {
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          const maxIndex = Math.max(0, categories.length - itemsPerView);
          return prev >= maxIndex ? 0 : prev + 1;
        });
      }, 2000);
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [showSlider, isAutoPlaying, categories.length, itemsPerView]);

  // Pause autoplay on hover - use refs to avoid recreation
  const handleMouseEnterRef = useRef(() => {
    setIsAutoPlaying(false);
  });

  const handleMouseLeaveRef = useRef(() => {
    setIsAutoPlaying(false);
  });

  const maxIndex = Math.max(0, categories.length - itemsPerView);

  // Calculate transform for smooth sliding
  const getTransformValue = () => {
    if (!showSlider) return 0;
    const fullItemWidth = calculatedItemWidth + 16; // base width + gap
    return -currentIndex * fullItemWidth;
  };

  // Drag handlers (pointer events) - use refs to avoid recreation
  const handlePointerDownRef = useRef((e) => {
    if (!showSlider) return;
    isPointerDownRef.current = true;
    dragStartXRef.current =
      e.clientX ?? (e.touches && e.touches[0]?.clientX) ?? 0;
    startTransformRef.current = getTransformValue();
    dragOffsetRef.current = 0;
    setDragOffset(0);
    setIsDragging(true);
    setIsAutoPlaying(false);
    // Prevent image drag ghost
    if (sliderRef.current) {
      sliderRef.current.setPointerCapture?.(e.pointerId);
    }
  });

  const handlePointerMoveRef = useRef((e) => {
    if (!isPointerDownRef.current) return;
    const currentX = e.clientX ?? (e.touches && e.touches[0]?.clientX) ?? 0;
    dragOffsetRef.current = currentX - dragStartXRef.current;
    setDragOffset(dragOffsetRef.current);
    if (sliderRef.current) {
      e.preventDefault?.();
    }
  });

  const clampRef = useRef((val, min, max) => Math.max(min, Math.min(max, val)));

  const handlePointerUpRef = useRef(() => {
    if (!isPointerDownRef.current) return;
    const fullItemWidth = calculatedItemWidth + 16;
    const offset = dragOffsetRef.current || 0;
    let steps = 0;
    if (Math.abs(offset) > fullItemWidth * 0.3) {
      steps = Math.round(-offset / fullItemWidth);
    }
    if (steps !== 0) {
      setCurrentIndex((prev) => clampRef.current(prev + steps, 0, maxIndex));
    }
    // reset drag
    isPointerDownRef.current = false;
    dragOffsetRef.current = 0;
    setDragOffset(0);
    setIsDragging(false);
    setIsAutoPlaying(false);
  });

  return (
    <section className="border-b-6 border-[#FC9405] bg-[#42339F]">
      <div className="container mx-auto px-4 py-2">
        {/* Categories Slider */}
        <div
          className="relative"
          ref={containerRef}
          onMouseEnter={handleMouseEnterRef.current}
          onMouseLeave={handleMouseLeaveRef.current}
        >
          {/* Slider Container with Overflow Hidden */}
          <div className="overflow-hidden">
            {/* Slider Track with Smooth Transform */}
            <div
              ref={sliderRef}
              className={`flex items-center justify-between gap-4 ${isDragging ? '' : 'transition-transform duration-500 ease-in-out'}`}
              style={{
                transform: showSlider
                  ? `translateX(${getTransformValue() + (isDragging ? dragOffset : 0)}px)`
                  : 'translateX(0)',
                width: showSlider
                  ? `${categories.length * (calculatedItemWidth + 16)}px`
                  : 'auto',
                touchAction: 'pan-y',
              }}
              onPointerDown={handlePointerDownRef.current}
              onPointerMove={handlePointerMoveRef.current}
              onPointerUp={handlePointerUpRef.current}
              onPointerCancel={handlePointerUpRef.current}
              onPointerLeave={handlePointerUpRef.current}
            >
              {categories.map((category) => {
                const itemContent = (
                  <div className="flex flex-col items-center justify-center gap-2">
                    {/* Icon */}
                    <div className="rounded-xl p-1 transition-shadow duration-300 group-hover:shadow-[inset_0_0_10px_0_#FC7E09] hover:shadow-[inset_0_0_10px_0_#FC7E09]">
                      <LazyImage
                        src={category.icon}
                        alt={
                          category.label || t('category') + ' ' + category.id
                        }
                        width={100}
                        height={100}
                        className="h-auto w-[70px] md:w-[70px] lg:w-[100px]"
                      />
                    </div>
                    {/* Label */}
                    <div className="text-center text-[14px] leading-tight font-bold text-white md:text-[14px] lg:text-[16px]">
                      {category.label.toUpperCase()}
                    </div>
                  </div>
                );

                if (category.disabled) {
                  return (
                    <div
                      key={category.id}
                      aria-disabled="true"
                      tabIndex={-1}
                      className="group pointer-events-none flex-shrink-0 cursor-not-allowed opacity-50 transition-transform duration-300"
                    >
                      {itemContent}
                    </div>
                  );
                }

                return (
                  <Link
                    key={category.id}
                    href={category.href}
                    className="group flex-shrink-0 cursor-pointer transition-transform duration-300 hover:scale-105"
                  >
                    {itemContent}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Categories;
