'use client';

import Image from 'next/image';
import React from 'react';

import GameProviders from '@/dynamic-components/template1/components/GameProviders/GameProviders';
import SlotCategories from '@/dynamic-components/template1/components/SlotCategories/SlotCategories';
import { useTranslations } from '@/hooks/useTranslations';

export default function SlotsPage() {
  const { t } = useTranslations();

  const bannerImage =
    'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/koko-slot-1.webp';

  const subBannerImage =
    'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/koko-slot-sub.webp';

  // Get banner text from translations
  const bannerText = {
    mainText: [t('slots_banner_line_1'), t('slots_banner_line_2')],
    subText: t('slots_banner_sub_text'),
  };

  // Get sub banner text from translations
  const subBannerText = {
    mainText: t('slots_sub_banner_line_1'),
    buttonText: t('casino_sub_banner_button_text'),
    bottomText: t('casino_sub_banner_bottom_text'),
  };

  return (
    <>
      <div className="relative">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <img
            src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/lines-pattern.svg"
            alt="Lines Pattern"
            className="h-full w-full object-cover"
          />
        </div>

        {/* Single Banner with Text Overlay */}
        <section className="relative">
          <div className="relative overflow-hidden">
            <div className="relative">
              <Image
                src={bannerImage}
                alt={t('slots_banner')}
                width={1920}
                height={700}
                className="h-auto max-h-[250px] min-h-[130px] w-full max-w-full object-contain object-center sm:max-h-[100%]"
                priority
                sizes="100vw"
                quality={95}
              />
              {/* Text Overlay */}
              <div className="absolute inset-0 z-10 flex flex-col items-start justify-center pl-8 sm:pl-16 md:pl-24 lg:pl-32">
                <div className="max-w-[45%] px-2 text-left sm:max-w-[50%] sm:px-4 md:px-6 lg:px-8">
                  <h1
                    className="mb-2 text-[18px] text-white italic sm:mb-4 sm:text-[40px] md:text-[60px] lg:text-[80px]"
                    style={{
                      textShadow: '2px 10px 6px #370089',
                      fontWeight: 'bold',
                      lineHeight: '1.1',
                    }}
                  >
                    {bannerText.mainText.map((line, lineIndex) => (
                      <React.Fragment key={lineIndex}>
                        {line}
                        {lineIndex < bannerText.mainText.length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </h1>
                  <p className="text-[8px] font-bold text-white italic sm:text-lg md:text-xl">
                    {bannerText.subText}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <GameProviders />
        <SlotCategories />

        {/* Sub Banner with Text Overlay */}
        <div className="container mx-auto px-4 py-8">
          <section className="relative mt-8">
            <div className="relative overflow-hidden">
              <div className="relative">
                <Image
                  src={subBannerImage}
                  alt={t('casino_sub_banner')}
                  width={1920}
                  height={700}
                  className="h-auto max-h-[250px] min-h-[130px] w-full max-w-full object-contain object-center sm:max-h-[100%]"
                  priority={false}
                  sizes="100vw"
                  quality={95}
                />
                {/* Text Overlay - Right Aligned */}
                <div className="absolute inset-0 z-10 flex flex-col items-end justify-center pr-8 sm:pr-16 md:pr-24 lg:pr-32">
                  <div className="max-w-[45%] px-2 text-center sm:max-w-[50%] sm:px-4 md:px-6 lg:px-8">
                    <h1
                      className="mb-2 text-[12px] italic sm:mb-4 sm:text-[20px] md:text-[25px] lg:text-[25px]"
                      style={{
                        color: '#FFFFFFCC',
                        fontWeight: 'bold',
                        lineHeight: '1.1',
                      }}
                    >
                      {subBannerText.mainText}
                    </h1>

                    {/* SVG Button */}
                    <div className="mt-4 mb-2 w-full max-w-[885px]">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="885"
                        height="130"
                        viewBox="0 0 885 130"
                        fill="none"
                        className="h-auto w-full"
                      >
                        <path
                          d="M65.5398 0H855.443L819.889 129.366H29.5573L65.5398 0Z"
                          fill="url(#paint0_linear_slots_405_618)"
                          fillOpacity="0.7"
                        />
                        <path
                          d="M37.696 2.18119e-05H59.5426L23.3556 129.366H0L37.696 2.18119e-05Z"
                          fill="url(#paint1_linear_slots_405_618)"
                        />
                        <path
                          d="M863.153 0H885L848.813 129.366H825.457L863.153 0Z"
                          fill="url(#paint2_linear_slots_405_618)"
                        />
                        <defs>
                          <linearGradient
                            id="paint0_linear_slots_405_618"
                            x1="-64.3637"
                            y1="-5.88027"
                            x2="-24.7062"
                            y2="280.734"
                            gradientUnits="userSpaceOnUse"
                          >
                            <stop stopColor="#51A2FF" />
                            <stop offset="0.433806" stopColor="#1C398E" />
                            <stop offset="0.898108" stopColor="#51A2FF" />
                          </linearGradient>
                          <linearGradient
                            id="paint1_linear_slots_405_618"
                            x1="825.457"
                            y1="64.683"
                            x2="885"
                            y2="64.683"
                            gradientUnits="userSpaceOnUse"
                          >
                            <stop stopColor="#FF6900" />
                            <stop offset="1" stopColor="#983F00" />
                          </linearGradient>
                          <linearGradient
                            id="paint2_linear_slots_405_618"
                            x1="825.457"
                            y1="64.683"
                            x2="885"
                            y2="64.683"
                            gradientUnits="userSpaceOnUse"
                          >
                            <stop stopColor="#FF6900" />
                            <stop offset="1" stopColor="#983F00" />
                          </linearGradient>
                        </defs>
                        <foreignObject
                          x="75"
                          y="0"
                          width="770"
                          height="130"
                          style={{ overflow: 'hidden' }}
                        >
                          <div
                            xmlns="http://www.w3.org/1999/xhtml"
                            style={{
                              width: '100%',
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '0 30px',
                              boxSizing: 'border-box',
                            }}
                          >
                            <span
                              style={{
                                fontFamily: 'Arial, sans-serif',
                                fontSize: 'clamp(12px, 10vw, 45px)',
                                fontWeight: 'bold',
                                fontStyle: 'italic',
                                color: 'white',
                                textAlign: 'center',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                display: 'block',
                                width: '100%',
                                maxWidth: '100%',
                              }}
                            >
                              {subBannerText.buttonText}
                            </span>
                          </div>
                        </foreignObject>
                      </svg>
                    </div>

                    {/* Bottom Text */}
                    <p className="text-[10px] font-bold text-[#FFFFFFCC] italic sm:text-lg md:text-xl">
                      {subBannerText.bottomText}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Bottom Curved Pattern above footer (positioned, no layout shift) */}
        <div
          className="pointer-events-none absolute right-0 bottom-0 left-0 -z-10 h-[420px]"
          aria-hidden
        >
          <img
            src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/curved-pattern.svg"
            alt="Curved Pattern"
            className="h-full w-full object-cover opacity-30"
          />
        </div>
      </div>
    </>
  );
}
