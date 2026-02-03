'use client';
import Image from 'next/image';
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
  const buttonWidth = isMobile ? 'w-full' : 'w-[250px]';
  const dropdownWidth = isMobile ? 'w-[180px]' : 'w-[200px]';
  const buttonPadding = isMobile ? 'px-3 py-1.5' : 'px-4 py-2';
  const textSize = isMobile ? 'text-[11px]' : 'text-[10px]';
  const buttonTextSize = isMobile ? 'text-[16px]' : 'text-[15px]';
  const dropdownPadding = isMobile ? 'px-2 py-1.5' : 'px-3 py-2';

  const { t } = useTranslations();

  // Base URL used across the site for static assets
  const baseUrl = 'https://d3emlo5tm9es2f.cloudfront.net/next';

  const handleDecrement = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Handle decrement logic - could open withdrawal modal or decrease amount
    handleOpenTransactionModal();
  };

  const handleIncrement = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Handle increment logic - could open deposit modal or increase amount
    handleOpenTransactionModal();
  };

  const containerHeight = isMobile ? 'h-[55px]' : 'h-[50px]';

  return (
    <div className="relative" ref={walletRef}>
      <div
        className={`mb-2 inline-flex px-2 py-2 ${buttonWidth} ${containerHeight} items-center overflow-hidden ${isMobile ? 'rounded-[8px]' : 'rounded-full'}`}
        style={{
          border: '1px solid rgba(6, 214, 160, 0.3)',
          background: '#14213D',
        }}
      >
        {/* Minus Button (Left) */}
        <button
          onClick={handleDecrement}
          className="flex h-[36px] w-[36px] items-center justify-center transition-all hover:opacity-80"
          style={{ background: '#DFA336', borderRadius: '50%' }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            className="h-4 w-4"
          >
            <path
              d="M5 12h14"
              stroke="#000"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Central Display */}
        <button
          onClick={() => setIsWalletOpen(!isWalletOpen)}
          className="group flex h-full flex-1 cursor-pointer items-center justify-center text-white transition-all"
        >
          <span className={`${buttonTextSize} font-bold text-white`}>
            {userLoader ? (
              <CommonLoader size="sm" border="border-[#CBBC91]" />
            ) : hasWalletData ? (
              formatCurrency(holdingMoney)
            ) : (
              formatCurrency(0)
            )}
          </span>
        </button>

        {/* Plus Button (Right) */}
        <button
          onClick={handleIncrement}
          className="flex h-[36px] w-[36px] items-center justify-center transition-all hover:opacity-80"
          style={{ background: '#DFA336', borderRadius: '50%' }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            className="h-4 w-4"
          >
            <path
              d="M12 5v14M5 12h14"
              stroke="#000"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {isWalletOpen && (
        <div
          className={`absolute ${isMobile ? 'right-0' : 'left-0'} mt-2 ${dropdownWidth} z-[1000]`}
        >
          <div className="rounded-[0px] bg-[#03c72c4d] p-[2px] shadow-xl">
            <div className="rounded-[0px] bg-[#000304] p-[10px]">
              <div className="rounded-[5px] bg-[#5AB25A] p-[1px]">
                <div className="overflow-hidden rounded-[5px] bg-[#000304]">
                  {/* Row: Game Wallet */}
                  <button
                    type="button"
                    onClick={handleOpenTransactionModal}
                    className={`group flex w-full items-center justify-between ${dropdownPadding} border-b border-[#5AB25A] bg-transparent text-[20px] transition-all hover:bg-[#55BC55]`}
                  >
                    <div className="flex items-center gap-2 text-white group-hover:text-black">
                      <span className={textSize}>{t('game_wallet')}</span>
                    </div>
                    <div
                      className={`justify-self-start pl-2 font-medium text-white group-hover:text-black ${textSize}`}
                    >
                      {userLoader ? (
                        <CommonLoader size="sm" border="border-[#06D6A04D]" />
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
                    className={`group flex w-full items-center justify-between ${dropdownPadding} border-b border-[#5AB25A] transition-all hover:bg-[#55BC55]`}
                  >
                    <div className="flex items-center gap-2 text-white group-hover:text-black">
                      <span className={textSize}>{t('points')}</span>
                    </div>
                    <div
                      className={`justify-self-start pl-2 font-medium text-white group-hover:text-black ${textSize}`}
                    >
                      {userLoader ? (
                        <CommonLoader size="sm" border="border-[#06D6A04D]" />
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
                    className={`group flex w-full items-center justify-between ${dropdownPadding} bg-transparent transition-all hover:bg-[#55BC55]`}
                  >
                    <div className="flex items-center gap-2 text-white group-hover:text-black">
                      <span className={textSize}>{t('coupons')}</span>
                    </div>
                    <div
                      className={`justify-self-start pl-2 font-medium text-white group-hover:text-black ${textSize}`}
                    >
                      {userLoader ? (
                        <CommonLoader size="sm" border="border-[#06D6A04D]" />
                      ) : hasWalletData ? (
                        formatPoints(couponPoints)
                      ) : (
                        '0 P'
                      )}
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
