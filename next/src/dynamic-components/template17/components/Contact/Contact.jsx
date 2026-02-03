'use client';
import React from 'react';

import { useTranslations } from '@/hooks/useTranslations';

const contactMethods = [
  {
    name: 'Instagram',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
      >
        <rect
          x="2"
          y="2"
          width="20"
          height="20"
          rx="5"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
        <circle
          cx="12"
          cy="12"
          r="4"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
        <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" />
      </svg>
    ),
    contact: '@Mponusa',
  },
  {
    name: 'Whatsapp',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
      </svg>
    ),
    contact: '+11 222 33445',
  },
  {
    name: 'Facebook',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
        <text
          x="12"
          y="17"
          textAnchor="middle"
          fontSize="16"
          fill="currentColor"
          fontWeight="bold"
          fontFamily="Arial, sans-serif"
        >
          f
        </text>
      </svg>
    ),
    contact: '@Mponusa',
  },
  {
    name: 'Telegram',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
      >
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.13-.31-1.09-.66.02-.18.27-.37.74-.56 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
      </svg>
    ),
    contact: '@Mponusa',
  },
];

function Contact() {
  const { t } = useTranslations();

  return (
    <section className="w-full bg-[#000304] py-4 md:py-6">
      <div className="container mx-auto px-4 md:px-0">
        {/* Title */}
        <h2
          className="mb-6 text-left text-2xl font-bold md:text-3xl lg:text-4xl"
          style={{ color: '#E8D25E' }}
        >
          {t('contact') || 'Contact'}
        </h2>

        {/* Contact Cards Container */}
        <div
          className="rounded-lg p-3 md:p-6"
          style={{
            backgroundColor: 'transparent',
            border: '1px solid #E8D25E4D',
          }}
        >
          <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
            {contactMethods.map((method, index) => (
              <div
                key={index}
                className="flex w-full overflow-hidden rounded-lg"
              >
                {/* Left Section - Yellow Background with Icon */}
                <div
                  className="flex w-[35%] items-center justify-center px-2 py-4 md:px-4 md:py-6"
                  style={{
                    backgroundColor: '#E8D25E',
                  }}
                >
                  <div className="h-6 w-6 text-black md:h-10 md:w-10">
                    {method.icon}
                  </div>
                </div>

                {/* Right Section - Dark Background with Text */}
                <div className="flex w-[65%] flex-col justify-center bg-[#1a1a1a] px-3 py-4 md:px-6 md:py-6">
                  <p className="mb-1 text-[10px] leading-tight font-light text-white opacity-70 md:text-sm">
                    {t(method.name.toLowerCase()) || method.name}
                  </p>
                  <p className="text-sm leading-tight font-bold text-white md:text-lg lg:text-xl">
                    {method.contact}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Contact;
