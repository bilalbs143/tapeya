'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import CommonLoader from '@/components/CommonLoader/CommonLoader';
import { formatCurrency, formatPoints } from '@/helpers/formatting';
import { useAuthModal } from '@/hooks/useAuthModal';
import { useTranslations } from '@/hooks/useTranslations';

export default function WalletDropdown({ variant = 'desktop' }) {
  const { user, userLoader } = useSelector((state) => state.auth);
  const { openAuthModal } = useAuthModal();

  // Extract wallet information from user data
  const holdingMoney = user?.wallet?.holding_money || 0;
  const points = user?.wallet?.points || 0;
  const couponPoints = user?.wallet?.coupon_points || 0;

  // Check if wallet data is available
  const hasWalletData = user?.wallet && Object.keys(user.wallet).length > 0;

  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const walletRef = useRef(null);

  // Close wallet dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (walletRef.current && !walletRef.current.contains(event.target)) {
        setIsWalletOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleOpenTransactionModal = () => {
    openAuthModal('transaction');
    setIsWalletOpen(false);
  };

  const handleOpenPointsModal = () => {
    openAuthModal({ modal: 'transaction', props: { defaultTab: 'points' } });
    setIsWalletOpen(false);
  };

  const handleOpenCouponsModal = () => {
    openAuthModal({ modal: 'transaction', props: { defaultTab: 'coupons' } });
    setIsWalletOpen(false);
  };

  // Styling based on variant - mobile has smaller dimensions
  const isMobile = variant === 'mobile';
  const buttonWidth = isMobile ? 'w-[200px]' : 'w-[280px]';
  const dropdownWidth = isMobile ? 'w-[200px]' : 'w-[280px]';
  const buttonPadding = isMobile ? 'px-3 py-1.5' : 'px-4 py-2';
  const textSize = isMobile ? 'text-[9px]' : 'text-[14px]';
  const dropdownPadding = isMobile ? 'px-2 py-1.5' : 'px-3 py-2';
  const gridCols = isMobile
    ? 'grid-cols-[auto_1px_80px]'
    : 'grid-cols-[auto_1px_120px]';

  const { t } = useTranslations();

  return (
    <div className="relative" ref={walletRef}>
      <button
        onClick={() => setIsWalletOpen(!isWalletOpen)}
        className={`btn-hover-outline group flex items-center justify-between ${buttonWidth} ${buttonPadding} ${isMobile ? 'h-[35px]' : 'h-[45px]'} cursor-pointer rounded-[6px] border border-[#FFFFFF66] text-white transition-all hover:border-[#51A2FF] hover:shadow-[inset_0_0_6px_1px_#51A2FF]`}
      >
        <span className="flex items-center gap-3">
          <span className={textSize}>{t('game_wallet')}</span>
          <span className="h-[8px] w-[1px] rounded-[1px] bg-[#4B51A3]" />
          <span
            className={`font-medium text-white group-hover:text-white ${textSize}`}
          >
            {userLoader ? (
              <CommonLoader size="sm" border="border-[#51A2FF]" />
            ) : hasWalletData ? (
              formatCurrency(holdingMoney)
            ) : (
              formatCurrency(0)
            )}
          </span>
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className={`h-4 w-4 text-white transition-transform group-hover:text-white ${isWalletOpen ? 'rotate-180' : ''}`}
        >
          <path
            fillRule="evenodd"
            d="M5.47 8.47a.75.75 0 0 1 1.06 0L12 13.94l5.47-5.47a.75.75 0 1 1 1.06 1.06l-6 6a.75.75 0 0 1-1.06 0l-6-6a.75.75 0 0 1 0-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isWalletOpen && (
        <div
          className={`absolute ${isMobile ? 'right-0' : 'left-0'} mt-2 ${dropdownWidth} z-[1000] overflow-hidden rounded-[10px] border border-[#FFFFFF66] bg-[#000304] shadow-xl`}
        >
          {/* Row: Game Wallet */}
          <button
            type="button"
            onClick={handleOpenTransactionModal}
            className={`group grid w-full ${gridCols} items-center gap-x-2 ${dropdownPadding} border-b border-[#FFFFFF66] bg-transparent transition-all hover:bg-[#51A2FF]`}
          >
            <div className="flex items-center gap-2 text-white">
              <span className={textSize}>{t('game_wallet')}</span>
            </div>
            <div className="h-[10px] w-[1px] justify-self-center rounded-[1px] bg-[#4B51A3] group-hover:bg-white" />
            <div
              className={`justify-self-start pl-2 font-medium text-white group-hover:text-white ${textSize}`}
            >
              {userLoader ? (
                <CommonLoader size="sm" border="border-[#51A2FF]" />
              ) : hasWalletData ? (
                formatCurrency(holdingMoney)
              ) : (
                formatCurrency(0)
              )}
            </div>
          </button>

          {/* Row: Points */}
          <button
            type="button"
            onClick={handleOpenPointsModal}
            className={`group grid w-full ${gridCols} items-center gap-x-2 ${dropdownPadding} border-b border-[#FFFFFF66] transition-all hover:bg-[#51A2FF]`}
          >
            <div className="flex items-center gap-2 text-white">
              <span className={textSize}>{t('points')}</span>
            </div>
            <div className="h-[10px] w-[1px] justify-self-center rounded-[1px] bg-[#4B51A3] group-hover:bg-white" />
            <div
              className={`justify-self-start pl-2 font-medium text-white group-hover:text-white ${textSize}`}
            >
              {userLoader ? (
                <CommonLoader size="sm" border="border-[#51A2FF]" />
              ) : hasWalletData ? (
                formatPoints(points)
              ) : (
                '0 P'
              )}
            </div>
          </button>

          {/* Row: Coupons */}
          <button
            type="button"
            onClick={handleOpenCouponsModal}
            className={`group grid w-full ${gridCols} items-center gap-x-2 ${dropdownPadding} bg-transparent transition-all hover:bg-[#51A2FF]`}
          >
            <div className="flex items-center gap-2 text-white">
              <span className={textSize}>{t('coupons')}</span>
            </div>
            <div className="h-[10px] w-[1px] justify-self-center rounded-[1px] bg-[#4B51A3] group-hover:bg-white" />
            <div
              className={`justify-self-start pl-2 font-medium text-white group-hover:text-white ${textSize}`}
            >
              {userLoader ? (
                <CommonLoader size="sm" border="border-[#51A2FF]" />
              ) : hasWalletData ? (
                formatPoints(couponPoints)
              ) : (
                '0 P'
              )}
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
