import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useLanguageSwitcher } from '@/hooks/useLanguageSwitcher';

export const LanguageSwitcher = ({
  variant = 'dropdown',
  appearance = 'filled',
}) => {
  const {
    currentLocale,
    switchLanguage,
    isLoading,
    locales,
    localeNames,
    isSavingToBackend,
  } = useLanguageSwitcher();

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Base URL used across the site for static assets
  const baseUrl = 'https://d3emlo5tm9es2f.cloudfront.net/next';

  const localeFlags = {
    en: 'https://d3emlo5tm9es2f.cloudfront.net/next/icons/uk-flag.svg',
    id: 'https://d3emlo5tm9es2f.cloudfront.net/next/icons/id-flag.svg',
    ko: 'https://d3emlo5tm9es2f.cloudfront.net/next/icons/korea-flag.svg',
    jp: 'https://d3emlo5tm9es2f.cloudfront.net/next/icons/japan-flag.svg',
    my: 'https://d3emlo5tm9es2f.cloudfront.net/next/icons/malaysia-flag.svg',
    th: 'https://d3emlo5tm9es2f.cloudfront.net/next/icons/thailand-flag.svg',
    tw: 'https://d3emlo5tm9es2f.cloudfront.net/next/icons/taiwan-flag.svg',
    vn: 'https://d3emlo5tm9es2f.cloudfront.net/next/icons/vietnam-flag.svg',
  };

  const shortLocaleLabels = {
    en: 'ENG',
    ko: 'KOR',
    id: 'IND',
    jp: 'JPN',
    my: 'MYS',
    th: 'THA',
    tw: 'TWN',
    vn: 'VIE',
  };

  const handleLanguageSwitch = useCallback(
    async (locale) => {
      if (locale !== currentLocale && !isSavingToBackend) {
        await switchLanguage(locale);
        if (variant === 'dropdown') {
          setOpen(false);
        }
      }
    },
    [currentLocale, isSavingToBackend, switchLanguage, variant],
  );

  const toggleDropdown = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [open]);

  if (isLoading) return null;

  if (variant === 'dropdown') {
    return (
      <div ref={dropdownRef} className="relative z-[1001] inline-block">
        <button
          onClick={toggleDropdown}
          disabled={isSavingToBackend}
          className={`group inline-flex h-full w-full items-center justify-center gap-2 border-0 bg-transparent py-2 pr-2 pl-1 transition-all duration-300 ${
            appearance === 'outline' ? 'text-white' : 'text-white'
          } ${isSavingToBackend ? 'cursor-not-allowed opacity-50' : ''}`}
          aria-label="Select language"
          aria-expanded={open}
          aria-haspopup="listbox"
        >
          <div
            className="flex items-center justify-center rounded-[3px]"
            style={{
              backgroundColor: '#D61324',
              width: '41px',
              height: '41px',
            }}
          >
            <Image
              src={localeFlags[currentLocale] || localeFlags.en}
              alt={localeNames[currentLocale] || 'English'}
              width={20}
              height={14}
              className="rounded-[3px]"
            />
          </div>
          <span className="text-sm font-semibold text-white">
            {shortLocaleLabels[currentLocale] || 'ENG'}
          </span>
          {isSavingToBackend ? (
            <div
              className="h-5 w-5 animate-spin rounded-full border border-white border-t-transparent"
              aria-hidden="true"
            />
          ) : (
            <Image
              src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/drop-6-red.svg"
              alt="Open languages"
              width={11}
              height={9}
              className="h-2 w-auto"
            />
          )}
        </button>

        {open && !isSavingToBackend && (
          <div className="absolute right-0 z-[1002] mt-2 w-34">
            <div
              className="rounded-[10px] border shadow-xl"
              style={{ borderColor: 'rgba(251, 99, 33, 0.30)' }}
            >
              <div className="rounded-[10px]">
                <div className="rounded-[10px]">
                  <div
                    className="overflow-hidden rounded-[10px] bg-[#000304]"
                    role="listbox"
                    aria-label="Language options"
                  >
                    {locales.map((locale, idx) => (
                      <button
                        key={locale}
                        onClick={() => handleLanguageSwitch(locale)}
                        disabled={locale === currentLocale || isSavingToBackend}
                        className={`group flex w-full items-center justify-between px-3 py-2 text-left text-white transition-all hover:bg-[#F45E2A] ${
                          idx < locales.length - 1 ? 'border-b' : ''
                        } ${currentLocale === locale ? 'font-medium' : ''} ${
                          locale === currentLocale || isSavingToBackend
                            ? 'cursor-not-allowed opacity-50'
                            : ''
                        }`}
                        style={
                          idx < locales.length - 1
                            ? { borderBottomColor: 'rgba(251, 99, 33, 0.30)' }
                            : {}
                        }
                        role="option"
                        aria-selected={currentLocale === locale}
                      >
                        <span className="flex items-center gap-2 text-white group-hover:text-black">
                          <Image
                            src={localeFlags[locale]}
                            alt={localeNames[locale]}
                            width={20}
                            height={14}
                            className="transition-transform duration-200 group-hover:scale-110"
                          />
                          <span className="text-[10px] font-medium">
                            {localeNames[locale]}
                          </span>
                        </span>
                        <span className="pl-2 text-[12px] text-white/80 group-hover:text-black">
                          &nbsp;
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className="space-y-2">
        {locales.map((locale) => (
          <button
            key={locale}
            onClick={() => handleLanguageSwitch(locale)}
            disabled={locale === currentLocale || isSavingToBackend}
            className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 transition-all duration-200 ${
              currentLocale === locale
                ? 'border-[#FC9405] bg-[#FC9405]/20 text-white'
                : 'border-[#FC9405]/30 bg-[#141943]/50 text-white/80 hover:border-[#FC9405]/50 hover:bg-[#FC9405]/10'
            } ${locale === currentLocale || isSavingToBackend ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            <Image
              src={localeFlags[locale]}
              alt={localeNames[locale]}
              width={20}
              height={14}
            />
            <span className="text-sm font-medium">{localeNames[locale]}</span>
            {currentLocale === locale && (
              <div className="ml-auto">
                <svg
                  className="h-4 w-4 text-[#FC9405]"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
    );
  }

  // Alternative list/button variant
  return (
    <div className="flex gap-2">
      {locales.map((locale) => (
        <button
          key={locale}
          onClick={() => handleLanguageSwitch(locale)}
          disabled={locale === currentLocale || isSavingToBackend}
          className={`flex items-center gap-2 rounded-full border px-3 py-2 transition-colors ${
            currentLocale === locale
              ? 'border-[#FC9405] bg-[#141943] text-white'
              : 'border-[#FC9405] bg-transparent text-white hover:bg-[#141943]/20'
          } ${locale === currentLocale || isSavingToBackend ? 'cursor-not-allowed opacity-50' : ''}`}
        >
          <Image
            src={localeFlags[locale]}
            alt={localeNames[locale]}
            width={18}
            height={12}
          />
          <span className="text-sm">{localeNames[locale]}</span>
        </button>
      ))}
    </div>
  );
};
