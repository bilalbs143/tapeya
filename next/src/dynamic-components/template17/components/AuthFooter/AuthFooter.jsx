'use client';

import React from 'react';
import { useDispatch } from 'react-redux';

import { useTranslations } from '@/hooks/useTranslations';
import { openModal } from '@/slices/common/commonSlice';

function AuthFooter() {
  const { t } = useTranslations();
  const dispatch = useDispatch();

  // Same footer info links as main Footer – open modal on click
  const footerLinks = [
    { sectionKey: 'about', labelKey: 'footer_link_about_us' },
    { sectionKey: 'help', labelKey: 'footer_link_help' },
    { sectionKey: 'rules', labelKey: 'footer_link_terms' },
    { sectionKey: 'bank', labelKey: 'footer_link_bank_info' },
    { sectionKey: 'contact', labelKey: 'footer_link_contact_us' },
    { sectionKey: 'privacy', labelKey: 'footer_link_privacy_policy' },
    { sectionKey: 'cookies', labelKey: 'footer_link_cookie_consent' },
  ];

  const handleLinkClick = (e, sectionKey) => {
    e.preventDefault();
    dispatch(
      openModal({
        modal: 'footerInfo',
        props: { defaultSection: sectionKey },
      }),
    );
  };

  return (
    <footer className="relative">
      {/* Footer info links – outside section, transparent background */}
      <div className="py-4 bg-[#1E1E1E]">
        <div className="flex flex-wrap items-center justify-center">
          {footerLinks.map((link, index, array) => (
            <React.Fragment key={link.sectionKey}>
              <button
                type="button"
                onClick={(e) => handleLinkClick(e, link.sectionKey)}
                className="px-3 text-sm font-normal uppercase leading-normal text-[#7B7B7B] transition-colors hover:text-white md:px-4 md:text-base"
              >
                {t(link.labelKey)}
              </button>
              {index < array.length - 1 && (
                <div
                  className="h-3 w-px md:h-5"
                  style={{ backgroundColor: '#E8D25E4D' }}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Copyright section – background and border only here */}
      <div
        className=" py-4"
        style={{
          backgroundColor: '#161616',
          borderTop: '1px solid #2F2F2F',
        }}
      >
        <div className="text-center">
          <p className="text-sm text-white">
            © {new Date().getFullYear()}{' '}
            <span style={{ color: '#E8D25E', fontWeight: 'bold' }}>
              ONECA188
            </span>
            . All Right Reserved
          </p>
        </div>
      </div>
    </footer>
  );
}

export default AuthFooter;
