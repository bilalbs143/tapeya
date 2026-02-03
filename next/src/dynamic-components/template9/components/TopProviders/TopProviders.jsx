'use client';
import Image from 'next/image';
import React from 'react';

import { useMarquee } from '@/hooks/useMarquee';
import { useTranslations } from '@/hooks/useTranslations';

function TopProviders() {
  const { t } = useTranslations();

  // Generate array of provider logo URLs (tp-1-5.png to tp-53-5.png)
  const generateProviderLogos = () => {
    const logos = [];
    for (let i = 1; i <= 53; i++) {
      logos.push(
        `https://d3emlo5tm9es2f.cloudfront.net/next/logos/tp-${i}-5.png`,
      );
    }
    return logos;
  };

  const providerLogos = generateProviderLogos();

  // Duplicate logos for seamless infinite scroll
  const duplicatedLogos = [
    ...providerLogos,
    ...providerLogos,
    ...providerLogos,
  ];

  // Use custom marquee hook for continuous scrolling
  const marquee = useMarquee({
    speed: 15,
    pauseOnHover: true,
    direction: 'left',
  });

  const marqueeContainerStyle = {
    display: 'flex',
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
  };

  const marqueeContentStyle = {
    display: 'flex',
    gap: '0px',
    paddingRight: '20px',
    alignItems: 'center',
    transform: `translateX(${marquee.position}px)`,
    transition: 'none',
    willChange: 'transform',
  };

  const logoContainerStyle = {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.5, // Muted/grey color effect
    transition: 'opacity 0.3s ease',
  };

  return (
    <section className="pt-6 md:pt-10">
      <div className="z-[1] rounded-[10px] border border-[#00374A] bg-[#00111A] px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Title on the left */}
          <div className="flex flex-shrink-0 items-center gap-4">
            <h3 className="text-[14px] font-bold whitespace-nowrap text-white md:text-lg">
              {t('top_providers')}
            </h3>
            <div className="h-8 w-px flex-shrink-0 bg-[#0D1E41]" />
          </div>

          {/* Scrolling logos on the right */}
          <div
            className="relative min-w-0 flex-1 overflow-hidden"
            ref={marquee.containerRef}
            onMouseEnter={marquee.handleMouseEnter}
            onMouseLeave={marquee.handleMouseLeave}
          >
            <div style={marqueeContainerStyle}>
              <div
                ref={marquee.contentRef}
                style={marqueeContentStyle}
                className="group"
              >
                {duplicatedLogos.map((logoUrl, index) => (
                  <div
                    key={`logo-${index}`}
                    style={{
                      ...logoContainerStyle,
                      width: '120px',
                      height: '40px',
                    }}
                    className="group-hover:opacity-100 md:h-[60px] md:w-[180px]"
                  >
                    <Image
                      src={logoUrl}
                      alt={`Provider ${index + 1}`}
                      width={180}
                      height={60}
                      className="h-full w-auto object-contain"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default TopProviders;
