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
  const buttonWidth = isMobile ? 'w-[180px]' : 'w-[200px]';
  const dropdownWidth = isMobile ? 'w-[180px]' : 'w-[200px]';
  const buttonPadding = isMobile ? 'px-3 py-1.5' : 'px-4 py-2';
  const textSize = isMobile ? 'text-[11px]' : 'text-[10px]';
  const buttonTextSize = isMobile ? 'text-[12px]' : 'text-[15px]';
  const dropdownPadding = isMobile ? 'px-2 py-1.5' : 'px-3 py-2';

  const { t } = useTranslations();

  // Base URL used across the site for static assets
  const baseUrl = 'https://d3emlo5tm9es2f.cloudfront.net/next';

  return (
    <div className="relative" ref={walletRef}>
      <div
        className={`inline-flex ${buttonWidth} ${isMobile ? 'h-[35px]' : 'h-[45px]'} items-stretch rounded-[6px] p-[1px]`}
        style={{ backgroundImage: 'linear-gradient(#74cae3, #5bc0de 60%, #4ab9db)' }}
      >
        <button
          onClick={() => setIsWalletOpen(!isWalletOpen)}
          className={`group flex w-full items-center justify-between ${buttonPadding} h-full cursor-pointer rounded-[5px] bg-[#000304] text-white transition-all hover:shadow-[inset_0_0_6px_1px_#D3AF37]`}
        >
          <span className="flex items-center gap-3">
            <Image
              src={`${baseUrl}/icons/cash-3.svg`}
              alt="Wallet"
              width={25}
              height={25}
              className="h-6 w-6"
            />
            <span
              className={`${buttonTextSize} font-medium text-white group-hover:text-white`}
            >
              {userLoader ? (
                <CommonLoader size="sm" border="border-[#D3AF37]" />
              ) : hasWalletData ? (
                formatCurrency(holdingMoney)
              ) : (
                formatCurrency(0)
              )}
            </span>
          </span>
          <Image
            src={`${baseUrl}/icons/drop-3.svg`}
            alt="Open wallet"
            width={15}
            height={15}
            className={`h-4 w-4 transition-transform ${isWalletOpen ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {isWalletOpen && (
        <div
          className={`absolute ${isMobile ? 'right-0' : 'left-0'} mt-2 ${dropdownWidth} z-[1000]`}
        >
          <div className="rounded-[0px] bg-[#E8D25E] p-[1px] shadow-xl">
            <div className="rounded-[0px] bg-[#000304] p-[10px]">
              <div className="rounded-[8px] bg-[#E8D25E] p-[1px]">
                <div className="overflow-hidden rounded-[7px] bg-[#000304]">
                  {/* Row: Game Wallet */}
                  <button
                    type="button"
                    onClick={handleOpenTransactionModal}
                    className={`group flex w-full items-center justify-between ${dropdownPadding} border-b border-[#FFFFFF66] bg-transparent text-[20px] transition-all hover:bg-[#E8D25E]`}
                  >
                    <div className="flex items-center gap-2 text-white group-hover:text-black">
                      <span className={textSize}>{t('game_wallet')}</span>
                    </div>
                    <div
                      className={`justify-self-start pl-2 font-medium text-white group-hover:text-black ${textSize}`}
                    >
                      {userLoader ? (
                        <CommonLoader size="sm" border="border-[#D3AF37]" />
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
                    className={`group flex w-full items-center justify-between ${dropdownPadding} border-b border-[#FFFFFF66] transition-all hover:bg-[#E8D25E]`}
                  >
                    <div className="flex items-center gap-2 text-white group-hover:text-black">
                      <span className={textSize}>{t('points')}</span>
                    </div>
                    <div
                      className={`justify-self-start pl-2 font-medium text-white group-hover:text-black ${textSize}`}
                    >
                      {userLoader ? (
                        <CommonLoader size="sm" border="border-[#D3AF37]" />
                      ) : hasWalletData ? (
                        formatPoints(Math.floor(points))
                      ) : (
                        '0 P'
                      )}
                    </div>
                  </button>

                  {/* Row: Coupons */}
                  <button
                    type="button"
                    onClick={handleOpenCouponsModal}
                    className={`group flex w-full items-center justify-between ${dropdownPadding} bg-transparent transition-all hover:bg-[#E8D25E]`}
                  >
                    <div className="flex items-center gap-2 text-white group-hover:text-black">
                      <span className={textSize}>{t('coupons')}</span>
                    </div>
                    <div
                      className={`justify-self-start pl-2 font-medium text-white group-hover:text-black ${textSize}`}
                    >
                      {userLoader ? (
                        <CommonLoader size="sm" border="border-[#D3AF37]" />
                      ) : hasWalletData ? (
                        formatPoints(Math.floor(couponPoints))
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
