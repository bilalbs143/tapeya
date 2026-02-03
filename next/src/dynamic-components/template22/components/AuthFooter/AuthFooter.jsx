'use client';
import React from 'react';
import { useDispatch } from 'react-redux';

import { openModal } from '@/slices/common/commonSlice';

function AuthFooter() {
  const dispatch = useDispatch();

  const linkToSectionMap = {
    'ABOUT US': 'about',
    'HELP': 'help',
    'REGULATION': 'rules',
    'BANK INFORMATION': 'bank',
    'CONTACT US': 'contact',
    'PRIVACY POLICY': 'privacy',
    'COOKIES CONSENT': 'cookies',
  };

  const handleLinkClick = (e, linkLabel) => {
    e.preventDefault();
    const section = linkToSectionMap[linkLabel];
    if (section) {
      dispatch(
        openModal({
          modal: 'footerInfo',
          props: { defaultSection: section },
        }),
      );
    }
  };

  return (
    <footer 
      className="relative min-h-[20px] bg-[#1c1e22] border border-[#0c0d0e] py-2 sm:py-4 !pt-0"
      style={{ boxShadow: 'inset 0 1px 1px rgba(0, 0, 0, 0.05)' }}
    >
      {/* Footer Info Links - Full width */}
      <div
        className="flex w-full flex-wrap items-center justify-center gap-x-2 gap-y-2 px-3 py-3 sm:gap-x-3"
        style={{ backgroundColor: '#272b30' }}
      >
        {[
          'ABOUT US',
          'HELP',
          'REGULATION',
          'BANK INFORMATION',
          'CONTACT US',
          'PRIVACY POLICY',
          'COOKIES CONSENT',
        ].map((item, index, array) => (
          <React.Fragment key={item}>
            <button
              onClick={(e) => handleLinkClick(e, item)}
              className="px-2 text-xs font-normal uppercase leading-normal text-white transition-colors hover:text-white sm:px-3 sm:text-sm"
            >
              {item}
            </button>
            {index < array.length - 1 && (
              <div className="h-2.5 w-px bg-white/60 sm:h-3" />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="container mx-auto px-2 sm:px-4">
        {/* Copyright Text */}
        <div className="text-center pt-3">
          <p className="text-sm text-white">
            © {new Date().getFullYear()} Copyright{' '}
            <span style={{ color: '#ec4d49', fontWeight: 'bold' }}>
              MPONUSA188
            </span>
            . All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default AuthFooter;
