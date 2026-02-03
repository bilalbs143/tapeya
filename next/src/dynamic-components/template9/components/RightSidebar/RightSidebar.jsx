'use client';

import React, { memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import CommonLoader from '@/components/CommonLoader/CommonLoader';
import LazyImage from '@/dynamic-components/template9/components/LazyImage/LazyImage';
import { formatCurrency, formatPoints } from '@/helpers/formatting';
import { useTranslations } from '@/hooks/useTranslations';
import { openModal } from '@/slices/common/commonSlice';

const RightSidebar = memo(function RightSidebar() {
  const { t } = useTranslations();
  const dispatch = useDispatch();
  const { user, userLoader } = useSelector((state) => state.auth);

  // Extract wallet information from user data
  const holdingMoney = user?.wallet?.holding_money || 0;
  const points = user?.wallet?.points || 0;
  const couponPoints = user?.wallet?.coupon_points || 0;

  // Check if wallet data is available
  const hasWalletData = user?.wallet && Object.keys(user.wallet).length > 0;

  return (
    <aside
      className="template9-right-sidebar hidden w-64 flex-shrink-0 border-l bg-[#101010] lg:block lg:w-64 xl:w-64"
      style={{ borderLeftColor: 'rgba(251, 99, 33, 0.30)' }}
    >
      <div className="flex flex-col p-3">
        {/* Wallet Section */}
        <div className="space-y-4">
          {/* My Wallet */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-white">{t('wallet')}</h3>
            <div
              className="rounded-[6px] border p-[10px]"
              style={{
                backgroundColor: '#000000',
                borderColor: 'rgba(251, 99, 33, 0.30)',
              }}
            >
              <div
                className="rounded-[6px] border px-4 py-4"
                style={{
                  backgroundColor: '#430201',
                  borderColor: 'rgba(251, 99, 33, 0.30)',
                }}
              >
                <div className="text-center text-xl font-semibold text-white">
                  {userLoader ? (
                    <CommonLoader size="sm" border="border-[#9d4edd]" />
                  ) : hasWalletData ? (
                    formatCurrency(holdingMoney)
                  ) : (
                    formatCurrency(0)
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Points */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-white">
              {t('points') || 'Points'}
            </h3>
            <div
              className="rounded-[6px] border p-[10px]"
              style={{
                backgroundColor: '#000000',
                borderColor: 'rgba(251, 99, 33, 0.30)',
              }}
            >
              <div
                className="rounded-[6px] border px-4 py-4"
                style={{
                  backgroundColor: '#430201',
                  borderColor: 'rgba(251, 99, 33, 0.30)',
                }}
              >
                <div className="text-center text-xl font-semibold text-white">
                  {userLoader ? (
                    <CommonLoader size="sm" border="border-[#9d4edd]" />
                  ) : hasWalletData ? (
                    formatPoints(points)
                  ) : (
                    formatPoints(0)
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Coupons */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-white">
              {t('coupons') || 'Coupons'}
            </h3>
            <div
              className="rounded-[6px] border p-[10px]"
              style={{
                backgroundColor: '#000000',
                borderColor: 'rgba(251, 99, 33, 0.30)',
              }}
            >
              <div
                className="rounded-[6px] border px-4 py-4"
                style={{
                  backgroundColor: '#430201',
                  borderColor: 'rgba(251, 99, 33, 0.30)',
                }}
              >
                <div className="text-center text-xl font-semibold text-white">
                  {userLoader ? (
                    <CommonLoader size="sm" border="border-[#9d4edd]" />
                  ) : hasWalletData ? (
                    formatPoints(couponPoints)
                  ) : (
                    formatPoints(0)
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* APK Banner */}
        <div className="mt-6">
          <div
            className="relative w-full cursor-pointer"
            onClick={() => dispatch(openModal('apkDownload'))}
          >
            <img
              src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/apk-new-banner-6.webp"
              alt="APK Banner"
              className="block w-full"
            />
            {/* Text overlay - top left */}
            <div className="absolute top-[7%] left-[15%] z-10">
              <h3 className="text-[18px] leading-tight font-bold text-white">
                {(() => {
                  const text = t('download_our_app');
                  const lines = text.split('\n');
                  return lines.map((line, idx) => (
                    <React.Fragment key={idx}>
                      {line}
                      {idx < lines.length - 1 && <br />}
                    </React.Fragment>
                  ));
                })()}
              </h3>
            </div>
            {/* Button overlay - bottom */}
            <div className="absolute right-2 bottom-2 left-2 z-10 flex justify-center px-3 py-3">
              <button
                className="fancy-hover-effect-red w-full rounded-[50px] bg-[#F45E2A] px-3 py-2 text-[11px] font-semibold text-white transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  dispatch(openModal('apkDownload'));
                }}
              >
                <span className="text-container">
                  <span className="text">{t('download_apk')}</span>
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Socials Section */}
        <div className="mt-6">
          <h3 className="mb-3 text-base font-medium text-gray-400 capitalize">
            {t('socials') || 'Socials'}
          </h3>
          <div className="space-y-3">
            {/* Telegram Button */}
            <button
              className="fancy-hover-effect-red flex w-full items-center justify-center gap-2.5 px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#FB6321', borderRadius: '34px' }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="12"
                viewBox="0 0 14 12"
                fill="none"
                className="relative z-10"
              >
                <path
                  d="M0.927878 4.81639C4.55228 3.23766 6.96854 2.19682 8.17668 1.69389C11.6302 0.257919 12.3469 0.00852278 12.815 7.36191e-05C12.9179 -0.00157737 13.1471 0.023867 13.2967 0.144777C13.421 0.24675 13.4559 0.384656 13.4734 0.481482C13.489 0.57821 13.5103 0.798665 13.4929 0.970756C13.3064 2.9364 12.4964 7.70639 12.0847 9.90803C11.9118 10.8396 11.568 11.1519 11.2359 11.1824C10.5133 11.2488 9.96557 10.7054 9.26633 10.2472C8.17279 9.52985 7.55513 9.08351 6.49267 8.38368C5.26511 7.57489 6.06147 7.13029 6.76071 6.40386C6.94329 6.2137 10.1248 3.32059 10.1851 3.05818C10.1928 3.02536 10.2006 2.90299 10.1268 2.83851C10.0549 2.77383 9.94809 2.79597 9.87039 2.81345C9.75968 2.83831 8.01352 3.99361 4.62609 6.27916C4.13079 6.61985 3.68211 6.78592 3.2781 6.77718C2.83525 6.76766 1.98062 6.52623 1.34548 6.31995C0.568546 6.06686 -0.0510593 5.93304 0.00332608 5.5032C0.0305188 5.27944 0.33935 5.05044 0.927878 4.81639Z"
                  fill="white"
                />
              </svg>
              <span className="text-container">
                <span className="text font-bold">{t('telegram')}</span>
              </span>
            </button>

            {/* WhatsApp Button */}
            <button
              className="fancy-hover-effect-orange flex w-full items-center justify-center gap-2.5 px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#D61324', borderRadius: '34px' }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="17"
                height="17"
                viewBox="0 0 17 17"
                fill="none"
                className="relative z-10"
              >
                <path
                  d="M0.0669674 7.91269C0.0665293 9.3073 0.433724 10.6687 1.13181 11.8688L0 15.9691L4.22902 14.8689C5.39426 15.4993 6.70619 15.8316 8.04116 15.8321H8.0446C12.4412 15.8321 16.0202 12.2819 16.0221 7.91902C16.0229 5.8046 15.1937 3.81631 13.6876 2.3206C12.1814 0.825077 10.1786 0.000869417 8.0446 0C3.64728 0 0.0687198 3.54971 0.0669674 7.91269ZM2.58551 11.6621L2.4276 11.4134C1.76381 10.3661 1.41345 9.15589 1.41395 7.91319C1.41533 4.28679 4.38968 1.33642 8.04711 1.33642C9.8183 1.33716 11.4828 2.02226 12.7348 3.26528C13.9867 4.50842 14.6756 6.16094 14.6752 7.91853C14.6736 11.5449 11.6991 14.4957 8.0446 14.4957H8.04198C6.85202 14.495 5.68497 14.178 4.66719 13.5787L4.42498 13.4362L1.91539 14.0891L2.58551 11.6621Z"
                  fill="url(#paint0_linear_140_1648)"
                />
                <path
                  d="M6.05099 4.60465C5.90166 4.27532 5.7445 4.26868 5.6025 4.2629C5.48621 4.25793 5.35328 4.25831 5.22047 4.25831C5.08753 4.25831 4.87155 4.30793 4.68898 4.50572C4.50623 4.7037 3.99127 5.18212 3.99127 6.15519C3.99127 7.12825 4.70557 8.06871 4.80515 8.2008C4.90485 8.33264 6.18411 10.3934 8.21016 11.1862C9.89398 11.845 10.2366 11.714 10.6021 11.681C10.9676 11.648 11.7815 11.2027 11.9475 10.7408C12.1137 10.279 12.1137 9.88319 12.0639 9.80047C12.014 9.71806 11.8811 9.66857 11.6818 9.5697C11.4824 9.47083 10.5024 8.99228 10.3197 8.92627C10.1369 8.86032 10.0041 8.8274 9.87114 9.02545C9.7382 9.22318 9.35649 9.66857 9.24014 9.80047C9.12392 9.93268 9.00757 9.94914 8.80829 9.85021C8.60883 9.75097 7.96688 9.54238 7.20527 8.86864C6.6127 8.34438 6.21265 7.69698 6.09636 7.49893C5.98008 7.3012 6.08391 7.19402 6.18386 7.09546C6.27342 7.00685 6.38326 6.86451 6.48302 6.74906C6.58241 6.63355 6.61558 6.55115 6.68205 6.41924C6.74858 6.28722 6.71528 6.17171 6.66553 6.07278C6.61558 5.97385 6.22823 4.9957 6.05099 4.60465Z"
                  fill="white"
                />
                <defs>
                  <linearGradient
                    id="paint0_linear_140_1648"
                    x1="801.106"
                    y1="1596.91"
                    x2="801.106"
                    y2="0"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#F9F9F9" />
                    <stop offset="1" stopColor="white" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="text-container">
                <span className="text font-bold">{t('whatsapp')}</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
});

export default RightSidebar;
