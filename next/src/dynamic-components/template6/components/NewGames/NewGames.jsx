'use client';

import useEmblaCarousel from 'embla-carousel-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import CommonLoader from '@/components/CommonLoader/CommonLoader';
import GameCard from '@/dynamic-components/template6/components/GameCard/GameCard';
import { useGameData } from '@/hooks/useGameData';
import { useTranslations } from '@/hooks/useTranslations';

function NewGames() {
  const { t } = useTranslations();
  const { games, loading } = useGameData({ is_new: true }, { perPage: 20 });

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    loop: true,
    skipSnaps: false,
    dragFree: true,
    containScroll: 'trimSnaps',
    slidesToScroll: 1,
  });

  const [canScrollPrev, setCanScrollPrev] = useState(true);
  const [canScrollNext, setCanScrollNext] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [letterSpacing, setLetterSpacing] = useState('0.1em');
  const textRef = useRef(null);
  const textContainerRef = useRef(null);

  // Update scroll buttons state - for infinite slider, always enabled
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    // For infinite slider, scroll buttons are always enabled
    setCanScrollPrev(true);
    setCanScrollNext(true);
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  // Validate games data
  const validGames =
    games && Array.isArray(games)
      ? games.filter(
        (game) => game && typeof game === 'object' && game.id && game.name,
      )
      : [];

  // Autoplay - continuous scroll
  useEffect(() => {
    if (!emblaApi || isHovered || validGames.length === 0) return;

    const id = setInterval(() => {
      if (!emblaApi) return;
      emblaApi.scrollNext(); // Scroll to next
    }, 3000);

    return () => clearInterval(id);
  }, [emblaApi, isHovered, validGames.length]);

  // Calculate letter spacing based on text container width
  useEffect(() => {
    const calculateLetterSpacing = () => {
      if (!textContainerRef.current || !textRef.current) return;

      // Use requestAnimationFrame to ensure DOM is updated
      requestAnimationFrame(() => {
        if (!textContainerRef.current || !textRef.current) return;

        const containerWidth = textContainerRef.current.offsetWidth;
        const text = textRef.current.textContent || '';
        const textLength = text.length;

        if (textLength === 0) return;

        // Get computed styles to match the actual rendered font size
        const computedStyle = window.getComputedStyle(textRef.current);
        const fontSize = parseFloat(computedStyle.fontSize) || 100;
        const fontFamily = computedStyle.fontFamily || 'inherit';
        const fontWeight = computedStyle.fontWeight || 'bold';

        // Create a temporary element to measure text width without letter spacing
        const tempElement = document.createElement('span');
        tempElement.style.position = 'absolute';
        tempElement.style.visibility = 'hidden';
        tempElement.style.whiteSpace = 'nowrap';
        tempElement.style.fontSize = `${fontSize}px`;
        tempElement.style.fontWeight = fontWeight;
        tempElement.style.fontFamily = fontFamily;
        tempElement.style.letterSpacing = '0';
        tempElement.textContent = text;
        document.body.appendChild(tempElement);

        const textWidth = tempElement.offsetWidth;
        document.body.removeChild(tempElement);

        // Calculate required letter spacing to fill the container width
        // Formula: (containerWidth - textWidth) / (textLength - 1)
        if (textLength > 1 && containerWidth > textWidth) {
          const requiredSpacing =
            (containerWidth - textWidth) / (textLength - 1);
          // Convert to em units based on current font size
          const spacingInEm = requiredSpacing / fontSize;
          // Clamp between reasonable values for mobile and desktop
          const clampedSpacing = Math.max(0.05, Math.min(spacingInEm, 2));
          setLetterSpacing(`${clampedSpacing}em`);
        } else {
          setLetterSpacing('0.1em');
        }
      });
    };

    // Wait for DOM to be ready, then calculate
    const timeoutId = setTimeout(() => {
      calculateLetterSpacing();
    }, 100);

    // Recalculate on resize
    const resizeObserver = new ResizeObserver(() => {
      calculateLetterSpacing();
    });

    if (textContainerRef.current) {
      resizeObserver.observe(textContainerRef.current);
    }

    // Also listen to window resize as fallback
    window.addEventListener('resize', calculateLetterSpacing);

    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', calculateLetterSpacing);
    };
  }, [games, loading]);

  // Navigation handlers
  const handlePrev = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollPrev(); // Scroll backward
  }, [emblaApi]);

  const handleNext = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollNext(); // Scroll forward
  }, [emblaApi]);

  // Loading state
  if (loading) {
    return (
      <section className="pt-6 md:pt-10">
        <div className="container mx-auto">
          {/* Header - matching the loaded state design */}
          <div className="mb-6 w-full">
            <div className="flex items-center justify-between gap-3 px-0 py-0 md:px-2 md:py-1">
              {/* Left side - Icon and Title */}
              <div className="flex items-center gap-3">
                <h3
                  className="text-[22px] font-semibold tracking-wide text-white uppercase md:text-[30px]"
                  style={{ fontFamily: 'var(--font-alatsi)' }}
                >
                  {t('new_games')}
                </h3>
              </div>
            </div>
          </div>
          <CommonLoader border="border-[#F45E2A]" />
        </div>
      </section>
    );
  }

  // Empty state
  if (validGames.length === 0) {
    return null;
  }

  // Duplicate games for infinite loop effect
  const duplicatedGames =
    validGames.length > 0
      ? [...validGames, ...validGames, ...validGames]
      : validGames;

  return (
    <section
      className="relative mt-6 px-4 py-4 pb-4 md:mt-10 md:px-4"
      style={{
        border: '1px solid rgba(251, 99, 33, 0.30)',
        borderRadius: '5px',
      }}
    >
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-6 w-full">
          <div className="flex items-center justify-between gap-3 px-0 py-0 md:px-2 md:py-1">
            {/* Left side - Icon and Title */}
            <div className="flex items-center gap-3">
              <h3
                className="text-[22px] font-semibold tracking-wide text-white uppercase md:text-[30px]"
                style={{ fontFamily: 'var(--font-alatsi)' }}
              >
                {t('new_games')}
              </h3>
            </div>

            {/* Right side - Navigation Buttons */}
            {validGames.length > 5 && (
              <div className="flex shrink-0 gap-2">
                <button
                  className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-[5px] border transition-all duration-200 hover:scale-110 sm:h-8 sm:w-8"
                  style={{
                    backgroundColor: '#D613244D',
                    borderColor: '#D61324',
                  }}
                  onClick={handlePrev}
                  aria-label="Previous slide"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="9"
                    viewBox="0 0 20 15"
                    fill="none"
                  >
                    <path
                      d="M18.4269 8.11168C18.9626 8.11168 19.3968 7.67747 19.3968 7.14185C19.3968 6.60622 18.9626 6.17201 18.4269 6.17201V7.14185V8.11168ZM0.28407 6.45607C-0.0946753 6.83481 -0.0946753 7.44888 0.28407 7.82762L6.45608 13.9996C6.83482 14.3784 7.44889 14.3784 7.82764 13.9996C8.20638 13.6209 8.20638 13.0068 7.82764 12.6281L2.34141 7.14185L7.82764 1.65562C8.20638 1.27687 8.20638 0.662803 7.82764 0.284058C7.44889 -0.094687 6.83482 -0.094687 6.45608 0.284058L0.28407 6.45607ZM18.4269 7.14185V6.17201H0.969849V7.14185V8.11168H18.4269V7.14185Z"
                      fill="white"
                    />
                  </svg>
                </button>
                <button
                  className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-[5px] border transition-all duration-200 hover:scale-110 sm:h-8 sm:w-8"
                  style={{
                    backgroundColor: '#D613244D',
                    borderColor: '#D61324',
                  }}
                  onClick={handleNext}
                  aria-label="Next slide"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="9"
                    viewBox="0 0 20 15"
                    fill="none"
                  >
                    <path
                      d="M0.969864 6.17201C0.434237 6.17201 2.67029e-05 6.60622 2.67029e-05 7.14185C2.67029e-05 7.67747 0.434237 8.11168 0.969864 8.11168V7.14185V6.17201ZM19.1127 7.82762C19.4915 7.44888 19.4915 6.83481 19.1127 6.45607L12.9407 0.284058C12.562 -0.094687 11.9479 -0.094687 11.5692 0.284058C11.1904 0.662803 11.1904 1.27687 11.5692 1.65562L17.0554 7.14185L11.5692 12.6281C11.1904 13.0068 11.1904 13.6209 11.5692 13.9996C11.9479 14.3784 12.562 14.3784 12.9407 13.9996L19.1127 7.82762ZM0.969864 7.14185V8.11168L18.4269 8.11168V7.14185V6.17201L0.969864 6.17201V7.14185Z"
                      fill="white"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content with Cards */}
        <div>
          {/* Infinite Slider Area - Single Row */}
          <div
            className="w-full min-w-0"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div
              className="template6-game-slider h-full overflow-hidden"
              ref={emblaRef}
            >
              <div className="flex h-full">
                {/* Single row layout */}
                {duplicatedGames.map((game, index) => (
                  <div
                    key={`game-${index}`}
                    className="flex h-full w-[calc((100%-1.5rem)/3)] flex-shrink-0 sm:w-[calc((100%-1.5rem)/3)] md:w-[calc((100%-2.25rem)/4)] lg:w-[calc((100%-1.5rem)/3)] xl:w-[calc((100%-2.25rem)/4)] 2xl:w-[calc((100%-3rem)/5)]"
                    style={{ marginRight: '0.75rem' }}
                  >
                    <GameCard
                      game={game}
                      className="h-full w-full"
                      imageClassName="h-full w-full"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Large "NEW GAMES" Text - spans full section width */}
      <div ref={textContainerRef} className="relative w-full overflow-hidden">
        <h2
          ref={textRef}
          className="w-full text-center leading-none font-bold uppercase"
          style={{
            background:
              'linear-gradient(180deg, rgba(251, 99, 33, 0.00) 28.67%, rgba(251, 99, 33, 0.70) 87.67%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: 'clamp(40px, 8vw, 100px)',
            letterSpacing: letterSpacing,
            width: '100%',
            whiteSpace: 'nowrap',
            padding: '0',
            boxSizing: 'border-box',
            fontWeight: '900',
          }}
        >
          NEW GAMES
        </h2>
      </div>
    </section>
  );
}

export default NewGames;
