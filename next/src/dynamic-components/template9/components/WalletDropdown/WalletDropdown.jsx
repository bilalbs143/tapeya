'use client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import CommonLoader from '@/components/CommonLoader/CommonLoader';
import { formatCurrency, formatPoints } from '@/helpers/formatting';
import { useTranslations } from '@/hooks/useTranslations';

export default function WalletDropdown({
  variant = 'desktop',
  closeMobileMenu,
}) {
  const { user, userLoader } = useSelector((state) => state.auth);
  const router = useRouter();

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

  // Handle navigation to deposit page
  const handleDepositClick = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsWalletOpen(false);
      if (closeMobileMenu) {
        closeMobileMenu();
      }
      router.push('/dashboard/deposit');
    },
    [router, closeMobileMenu],
  );

  // Handle navigation to withdrawal page
  const handleWithdrawalClick = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsWalletOpen(false);
      if (closeMobileMenu) {
        closeMobileMenu();
      }
      router.push('/dashboard/withdrawal');
    },
    [router, closeMobileMenu],
  );

  // Handle navigation to deposit page (for dropdown)
  const handleGameWalletClick = useCallback(
    (e) => {
      e.preventDefault();
      setIsWalletOpen(false);
      if (closeMobileMenu) {
        closeMobileMenu();
      }
      router.push('/dashboard/deposit');
    },
    [router, closeMobileMenu],
  );

  // Handle navigation to points page
  const handlePointsClick = useCallback(
    (e) => {
      e.preventDefault();
      setIsWalletOpen(false);
      if (closeMobileMenu) {
        closeMobileMenu();
      }
      router.push('/dashboard/points');
    },
    [router, closeMobileMenu],
  );

  // Handle navigation to coupons page
  const handleCouponsClick = useCallback(
    (e) => {
      e.preventDefault();
      setIsWalletOpen(false);
      if (closeMobileMenu) {
        closeMobileMenu();
      }
      router.push('/dashboard/coupons');
    },
    [router, closeMobileMenu],
  );

  // Styling based on variant - mobile matches profile dropdown, desktop has custom dimensions
  const isMobile = variant === 'mobile';
  const buttonWidth = isMobile ? 'w-full' : 'w-[200px]';
  const dropdownWidth = isMobile ? 'w-full' : 'w-[200px]';
  const buttonPadding = isMobile ? 'px-4 py-2' : 'px-4 py-2';
  const textSize = isMobile ? 'text-[12px]' : 'text-[10px]';
  const buttonTextSize = isMobile ? 'text-base' : 'text-[15px]';
  const dropdownPadding = isMobile ? 'px-3 py-3' : 'px-3 py-2';

  const { t } = useTranslations();

  // Base URL used across the site for static assets
  const baseUrl = 'https://d3emlo5tm9es2f.cloudfront.net/next';

  return (
    <div className="relative" ref={walletRef}>
      {isMobile ? (
        <div className="w-full">
          {/* Wallet Button with Three Sections - Mobile */}
          <button
            onClick={() => setIsWalletOpen(!isWalletOpen)}
            className="group flex h-[50px] w-full items-center rounded-[3px] bg-[#12001F]"
            style={{
              border: '1px solid rgba(219, 180, 44, 0.30)',
            }}
          >
            <div className="flex h-full w-full items-center gap-2 p-1">
              {/* Left Section - Withdrawal Button (Minus) */}
              <button
                onClick={handleWithdrawalClick}
                className="flex h-full w-[48px] items-center justify-center rounded-[5px] bg-[#1D0032]"
                type="button"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="M4 10H16"
                    stroke="#DBB42C"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {/* Center Section - Currency Value */}
              <div className="flex h-full flex-1 items-center justify-center px-2">
                {userLoader ? (
                  <CommonLoader size="sm" border="border-white" />
                ) : hasWalletData ? (
                  <span className="text-sm font-bold text-white">
                    {formatCurrency(holdingMoney)}
                  </span>
                ) : (
                  <span className="text-sm font-bold text-white">
                    {formatCurrency(0)}
                  </span>
                )}
              </div>

              {/* Right Section - Deposit Button (Plus) */}
              <button
                onClick={handleDepositClick}
                className="flex h-full w-[48px] items-center justify-center rounded-[5px] bg-[#1D0032]"
                type="button"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="M10 4V16M4 10H16"
                    stroke="#DBB42C"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </button>
        </div>
      ) : (
        <div
          className={`inline-flex ${buttonWidth} ${isMobile ? 'h-[50px]' : 'h-[54px]'} items-stretch ${isMobile ? 'rounded-[6px]' : 'rounded-[5px]'}`}
        >
          <button
            onClick={() => setIsWalletOpen(!isWalletOpen)}
            className={`group flex w-full items-center justify-between ${buttonPadding} h-full cursor-pointer ${isMobile ? 'rounded-[6px]' : 'rounded-[5px]'} border bg-[#0A1414] text-white transition-all hover:shadow-[inset_0_0_6px_1px_#2DFA1A]`}
            style={{ borderColor: 'rgba(45, 250, 26, 0.30)' }}
          >
            <span className="flex items-center gap-3">
              <Image
                src={`${baseUrl}/icons/coin-6.svg`}
                alt="Wallet"
                width={25}
                height={25}
                className={`${isMobile ? 'h-6 w-6' : 'h-6 w-6'}`}
              />
              <span
                className={`${buttonTextSize} font-medium text-white group-hover:text-white`}
              >
                {userLoader ? (
                  <CommonLoader size="sm" border="border-[#9d4edd]" />
                ) : hasWalletData ? (
                  formatCurrency(holdingMoney)
                ) : (
                  formatCurrency(0)
                )}
              </span>
            </span>
            <Image
              src={`${baseUrl}/icons/drop-6-red.svg`}
              alt="Open wallet"
              width={15}
              height={15}
              className={`h-3 w-3 transition-transform ${isWalletOpen ? 'rotate-180' : ''}`}
            />
          </button>
        </div>
      )}

      {isWalletOpen && (
        <div
          className={`absolute ${isMobile ? 'right-0 left-0' : 'left-0'} ${isMobile ? 'w-full' : ''} z-[1000] mt-2`}
          style={!isMobile ? { width: '200px' } : {}}
        >
          <div
            className="rounded-[3px] border bg-[#1D0032] shadow-xl"
            style={{ borderColor: 'rgba(219, 180, 44, 0.30)' }}
          >
            <div className="overflow-hidden rounded-[3px] p-2">
              {/* Row: Game Wallet */}
              <button
                type="button"
                onClick={handleGameWalletClick}
                className="group mb-2 flex w-full items-center justify-between rounded-[3px] border border-transparent bg-[#12001F] px-3 py-3 transition-all duration-200 hover:border-[rgba(219,180,44,0.30)] hover:bg-[rgba(51,19,105,0.41)] hover:shadow-[4px_5px_16px_rgba(0,0,0,0.25)_inset]"
              >
                <span className="flex items-center gap-3">
                  <span className="text-[12px] text-[#636363] transition-colors group-hover:text-white">
                    {t('game_wallet')}
                  </span>
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-medium text-[#636363] transition-colors group-hover:text-white">
                    {userLoader ? (
                      <CommonLoader size="sm" border="border-white" />
                    ) : hasWalletData ? (
                      formatCurrency(holdingMoney)
                    ) : (
                      formatCurrency(0)
                    )}
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="6"
                    height="13"
                    viewBox="0 0 6 13"
                    fill="none"
                    className="text-[#636363] transition-colors group-hover:!text-[#DBB42C]"
                  >
                    <path
                      d="M0.46875 0.470703L4.7858 4.78776C5.52108 5.52304 5.52108 6.71516 4.7858 7.45044L0.46875 11.7675"
                      stroke="currentColor"
                      strokeWidth="0.941399"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </button>

              {/* Row: Points */}
              <button
                type="button"
                onClick={handlePointsClick}
                className="group mb-2 flex w-full items-center justify-between rounded-[3px] border border-transparent bg-[#12001F] px-3 py-3 transition-all duration-200 hover:border-[rgba(219,180,44,0.30)] hover:bg-[rgba(51,19,105,0.41)] hover:shadow-[4px_5px_16px_rgba(0,0,0,0.25)_inset]"
              >
                <span className="flex items-center gap-3">
                  <span className="text-[12px] text-[#636363] transition-colors group-hover:text-white">
                    {t('points')}
                  </span>
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-medium text-[#636363] transition-colors group-hover:text-white">
                    {userLoader ? (
                      <CommonLoader size="sm" border="border-white" />
                    ) : hasWalletData ? (
                      formatPoints(points)
                    ) : (
                      '0 P'
                    )}
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="6"
                    height="13"
                    viewBox="0 0 6 13"
                    fill="none"
                    className="text-[#636363] transition-colors group-hover:!text-[#DBB42C]"
                  >
                    <path
                      d="M0.46875 0.470703L4.7858 4.78776C5.52108 5.52304 5.52108 6.71516 4.7858 7.45044L0.46875 11.7675"
                      stroke="currentColor"
                      strokeWidth="0.941399"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </button>

              {/* Row: Coupons */}
              <button
                type="button"
                onClick={handleCouponsClick}
                className="group flex w-full items-center justify-between rounded-[3px] border border-transparent bg-[#12001F] px-3 py-3 transition-all duration-200 hover:border-[rgba(219,180,44,0.30)] hover:bg-[rgba(51,19,105,0.41)] hover:shadow-[4px_5px_16px_rgba(0,0,0,0.25)_inset]"
              >
                <span className="flex items-center gap-3">
                  <span className="text-[12px] text-[#636363] transition-colors group-hover:text-white">
                    {t('coupons')}
                  </span>
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-medium text-[#636363] transition-colors group-hover:text-white">
                    {userLoader ? (
                      <CommonLoader size="sm" border="border-white" />
                    ) : hasWalletData ? (
                      formatPoints(couponPoints)
                    ) : (
                      '0 P'
                    )}
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="6"
                    height="13"
                    viewBox="0 0 6 13"
                    fill="none"
                    className="text-[#636363] transition-colors group-hover:!text-[#DBB42C]"
                  >
                    <path
                      d="M0.46875 0.470703L4.7858 4.78776C5.52108 5.52304 5.52108 6.71516 4.7858 7.45044L0.46875 11.7675"
                      stroke="currentColor"
                      strokeWidth="0.941399"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
