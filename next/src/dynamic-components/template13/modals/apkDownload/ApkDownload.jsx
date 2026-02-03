'use client';

import Image from 'next/image';
import React from 'react';
import { useDispatch } from 'react-redux';

import { useTranslations } from '@/hooks/useTranslations';
import { closeModal } from '@/slices/common/commonSlice';

export default function ApkDownload() {
  const dispatch = useDispatch();
  const { t } = useTranslations();

  const handImageUrl =
    'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/apk-modal-image-5.png';
  const qrCodeUrl =
    'https://d3emlo5tm9es2f.cloudfront.net/next/icons/Sumobet188.png';
  const apkUrl = 'https://thestaticfile.com/uploads/Sumobet188.apk';

  return (
    <div className="relative mx-auto w-full max-w-[720px] overflow-hidden rounded-[5px] bg-[#001724] text-white shadow-xl">
      <div className="p-6 sm:p-8">
        {/* Header (keep consistent with other modals) */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white sm:text-2xl">
            {t('download_apk')}
          </h2>
          <button
            onClick={() => dispatch(closeModal('apkDownload'))}
            aria-label={t('close')}
            className="group flex h-[33px] w-[33px] flex-shrink-0 cursor-pointer items-center justify-center rounded-md bg-[#20C5FE] text-black transition-all duration-300 sm:h-[44px] sm:w-[44px]"
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
                stroke="#0B0B0B"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="relative grid grid-cols-1 gap-6 sm:grid-cols-12 sm:gap-8">
          {/* Left: Scan or Share */}
          <div className="relative rounded-[8px] border border-[#00374A] p-5 pb-16 sm:col-span-5">
            <h3 className="mb-5 text-2xl leading-none font-bold text-white">
              {(() => {
                const text = t('scan_or_share');
                const lines = text.split('\n');
                return lines.map((line, idx) => (
                  <React.Fragment key={idx}>
                    {line}
                    {idx < lines.length - 1 && <br />}
                  </React.Fragment>
                ));
              })()}
            </h3>

            <div className="rounded-[8px] border border-[#20C5FE] bg-[#001724] p-3">
              <div className="mx-auto grid h-44 w-44 place-items-center rounded">
                <Image
                  src={qrCodeUrl}
                  alt="QR Code"
                  width={176}
                  height={176}
                  className="h-full w-full object-contain"
                  unoptimized
                />
              </div>
            </div>
            <a
              href={apkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute inset-x-0 bottom-0 rounded-b-[8px] bg-[#20C5FE] px-4 py-3 text-center text-sm font-bold text-white"
            >
              {t('direct_download')}
            </a>
          </div>

          {/* Right: space for visual; image overlays */}
          <div className="relative min-h-[260px] sm:col-span-7 sm:min-h-[360px]" />
        </div>
      </div>

      {/* Hand/device image positioned bottom-right */}
      <img
        src={handImageUrl}
        alt="APK modal visual"
        className="pointer-events-none absolute right-0 bottom-0 w-[72%] max-w-[450px] select-none sm:w-[55%]"
      />
    </div>
  );
}
