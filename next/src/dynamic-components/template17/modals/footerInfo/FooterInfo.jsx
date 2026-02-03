'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import { useTemplate } from '@/hooks/useTemplate.js';
import { useTranslations } from '@/hooks/useTranslations';
import { closeModal } from '@/slices/common/commonSlice';

export default function FooterInfo({ defaultSection }) {
  const dispatch = useDispatch();
  const { t } = useTranslations();
  const { headerLogo } = useTemplate();
  const [isVisible, setIsVisible] = useState(false);

  // Navigation sections: key and translation key for label
  const sections = [
    { key: 'about', labelKey: 'footer_link_about_us' },
    { key: 'help', labelKey: 'footer_link_help' },
    { key: 'rules', labelKey: 'footer_link_terms' },
    { key: 'bank', labelKey: 'footer_link_bank_info' },
    { key: 'contact', labelKey: 'footer_link_contact_us' },
    { key: 'privacy', labelKey: 'footer_link_privacy_policy' },
    { key: 'cookies', labelKey: 'footer_link_cookie_consent' },
  ];

  const validSections = sections.map((s) => s.key);
  const initialSection = validSections.includes(defaultSection)
    ? defaultSection
    : 'about';
  const [activeSection, setActiveSection] = useState(initialSection);

  useEffect(() => {
    const id = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Handle defaultSection prop changes
  useEffect(() => {
    if (defaultSection && validSections.includes(defaultSection)) {
      setActiveSection(defaultSection);
    }
  }, [defaultSection]);

  const handleCloseModal = () => {
    setIsVisible(false);
    setTimeout(() => dispatch(closeModal()), 250);
  };

  const renderContent = () => {
    const contentMap = {
      about: {
        title: t('footer_about_title'),
        content: t('footer_about_content'),
      },
      help: {
        title: t('footer_help_title'),
        content: t('footer_help_content'),
      },
      rules: {
        title: t('footer_terms_title'),
        content: t('footer_terms_content'),
      },
      bank: {
        title: t('footer_bank_title'),
        content: t('footer_bank_content'),
      },
      contact: {
        title: t('footer_contact_title'),
        content: t('footer_contact_content'),
      },
      privacy: {
        title: t('footer_privacy_title'),
        content: t('footer_privacy_content'),
      },
      cookies: {
        title: t('footer_cookies_title'),
        content: t('footer_cookies_content'),
      },
    };

    const currentContent = contentMap[activeSection] || contentMap.about;

    const isHelpSection = activeSection === 'help';

    // Special formatting for Help: title heading plus questions bold on one line, answers on next line
    if (isHelpSection) {
      const lines = (currentContent.content || '').split('\n');
      return (
        <>
          {currentContent.title && (
            <h2
              className="mb-4 text-2xl font-bold text-white md:border-b md:pb-4 md:text-3xl lg:text-4xl"
              style={{ borderColor: 'rgba(232, 210, 94, 0.3)' }}
            >
              {currentContent.title}
            </h2>
          )}
          <div className="space-y-2 text-sm leading-relaxed text-[#B0B0B0] md:text-base">
            {lines.map((line, index) => {
              const trimmed = line.trim();
              if (!trimmed) {
                // Preserve spacing between Q&A blocks
                return <p key={index}>&nbsp;</p>;
              }

              const isQuestion =
                trimmed.startsWith('Q:') || trimmed.startsWith('T:');

              return (
                <p
                  key={index}
                  className={isQuestion ? 'font-semibold text-white' : ''}
                >
                  {trimmed}
                </p>
              );
            })}
          </div>
        </>
      );
    }
    return (
      <>
        {currentContent.title && (
          <h2
            className="mb-4 text-2xl font-bold text-white md:border-b md:pb-4 md:text-3xl lg:text-4xl"
            style={{ borderColor: 'rgba(232, 210, 94, 0.3)' }}
          >
            {currentContent.title}
          </h2>
        )}
        <div className="space-y-4 text-sm leading-relaxed text-[#B0B0B0] md:text-base">
          {currentContent.content.split('\n\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </>
    );
  };

  return (
    <div
      className={`relative mx-auto flex h-[80vh] w-full max-w-6xl flex-col overflow-hidden rounded-[12px] bg-[#1A1A1A] text-white shadow-xl transition-opacity duration-250 md:flex-row ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Close Button */}
      <div className="absolute top-4 right-4 z-10 md:top-4 md:right-4">
        <button
          onClick={handleCloseModal}
          aria-label={t('close') || 'Close'}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md transition-all duration-300 hover:bg-white/10 sm:h-10 sm:w-10"
          style={{ color: '#E8D25E' }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className="h-5 w-5 sm:h-6 sm:w-6"
          >
            <path
              d="M6 6L18 18M18 6L6 18"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      <div className="relative block border-b bg-[#1E1E1E] px-4 py-3 pr-14 md:hidden" style={{ borderColor: '#E8D25E4D' }}>
        <select
          value={activeSection}
          onChange={(e) => setActiveSection(e.target.value)}
          className="w-full rounded bg-black/50 px-3 pr-8 py-2 text-sm font-normal uppercase text-white focus:outline-none focus:ring-2 focus:ring-[#E8D25E]"
        >
          {sections.map((section) => (
            <option key={section.key} value={section.key}>
              {t(section.labelKey)}
            </option>
          ))}
        </select>
      </div>

      {/* Sidebar - Hidden on mobile, visible on desktop */}
      <div className="hidden w-full flex-col bg-[#1E1E1E] pt-4 pb-4 md:flex md:w-1/4">
        {/* Logo Section */}
        <div className="border-b pb-4" style={{ borderColor: '#E8D25E4D' }}>
          <div className="flex items-center justify-center px-4">
            <Image
              src={headerLogo}
              alt="Logo"
              width={150}
              height={35}
              priority
              className="h-auto w-full max-w-[150px] object-contain"
            />
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="space-y-1">
            {sections.map((section) => (
              <button
                key={section.key}
                onClick={() => setActiveSection(section.key)}
                className={`group flex w-full items-center justify-between rounded px-3 py-3 text-left transition-all duration-200 ${
                  activeSection === section.key
                    ? 'bg-black/50 text-white'
                    : 'text-[#7B7B7B] hover:bg-black/30 hover:text-white'
                }`}
              >
                <span className="text-sm font-normal uppercase md:text-base">
                  {t(section.labelKey)}
                </span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={`transition-transform duration-200 ${
                    activeSection === section.key
                      ? 'text-white'
                      : 'text-[#7B7B7B] group-hover:text-white'
                  }`}
                >
                  <path
                    d="M4.5 2L8.5 6L4.5 10"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Separator */}
        <div
          className="h-px"
          style={{ backgroundColor: '#E8D25E4D' }}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden bg-[#111111]">
        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
