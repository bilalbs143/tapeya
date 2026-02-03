'use client';

import Image from 'next/image';
import React from 'react';
import { useDispatch } from 'react-redux';

import { useTranslations } from '@/hooks/useTranslations';
import { closeModal } from '@/slices/common/commonSlice';

export default function ApkDownload() {
  const dispatch = useDispatch();
  const { t } = useTranslations();

  const mobileMockupUrl =
    'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/apk-mockup-6.png';
  const qrCodeUrl =
    'https://d3emlo5tm9es2f.cloudfront.net/next/icons/user06.png';
  const apkUrl = 'https://thestaticfile.com/uploads/user06.apk';

  return (
    <div className="relative mx-auto w-full max-w-[720px] overflow-hidden rounded-[5px] bg-[#000000] text-white shadow-xl">
      <div className="p-6 sm:p-8">
        {/* Header (keep consistent with other modals) */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white sm:text-2xl">
            {t('download_apk')}
          </h2>
          <button
            onClick={() => dispatch(closeModal('apkDownload'))}
            aria-label={t('close')}
            className="group flex h-[33px] w-[33px] flex-shrink-0 cursor-pointer items-center justify-center rounded-[5px] bg-[#D61324] transition-all duration-300 sm:h-[44px] sm:w-[44px]"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              className="transition-all duration-300 group-hover:rotate-180 sm:h-5 sm:w-5"
            >
              <path
                d="M6 6L18 18M18 6L6 18"
                stroke="#FFFFFF"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Main Container with Border */}
        <div
          className="relative rounded-[5px]"
          style={{
            border: '1px solid rgba(251, 99, 33, 0.30)',
          }}
        >
          {/* Content Area */}
          <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2 sm:gap-8 sm:p-8">
            {/* Left: Scan QR */}
            <div className="flex flex-col items-center justify-center space-y-6 pb-10">
              <h3 className="text-2xl font-bold text-white">
                {t('scan_qr') || 'Scan QR'}
              </h3>

              <div className="flex items-center justify-center">
                <div
                  className="rounded-[5px] border p-4"
                  style={{ borderColor: 'rgba(251, 99, 33, 0.30)' }}
                >
                  <Image
                    src={qrCodeUrl}
                    alt="QR Code"
                    width={200}
                    height={200}
                    className="h-[200px] w-[200px] object-contain"
                    unoptimized
                  />
                </div>
              </div>
            </div>

            {/* Right: Mobile Mockup */}
            <div className="flex items-end justify-center">
              <Image
                src={mobileMockupUrl}
                alt="Mobile App Mockup"
                width={300}
                height={500}
                className="h-auto w-full max-w-[250px] object-contain"
                priority
              />
            </div>
          </div>

          {/* Download Button - Attached to Bottom */}
          <a
            href={apkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute inset-x-0 bottom-0 w-full rounded-b-[5px] bg-[#D61324] px-6 py-3 text-center text-sm font-bold text-white transition-colors hover:bg-[#D61324]/90"
          >
            {t('direct_download')}
          </a>
        </div>
      </div>
    </div>
  );
}
