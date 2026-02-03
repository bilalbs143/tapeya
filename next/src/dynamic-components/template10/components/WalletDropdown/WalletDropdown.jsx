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
          {/* Wallet Button - Mobile (Simple design matching profile button) */}
          <button
            onClick={() => setIsWalletOpen(!isWalletOpen)}
            className="group flex h-[50px] w-full items-center justify-between rounded-[3px] px-3"
            style={{
              border: '1px solid #246A73',
              background: '#00111A',
            }}
          >
            <div className="flex items-center gap-3">
              {/* Wallet Icon */}
              <svg
                width="27"
                height="20"
                viewBox="0 0 27 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-auto"
              >
                <path
                  d="M16.8889 0C18.8008 0 20.6697 0.56694 22.2594 1.62913C23.8491 2.69131 25.0881 4.20104 25.8197 5.96739C26.5514 7.73375 26.7428 9.67739 26.3698 11.5525C25.9968 13.4277 25.0762 15.1501 23.7243 16.502C22.3724 17.8539 20.6499 18.7746 18.7748 19.1476C16.8996 19.5206 14.956 19.3292 13.1896 18.5975C11.4233 17.8659 9.91356 16.6269 8.85137 15.0372C7.78919 13.4475 7.22225 11.5786 7.22225 9.66667C7.22225 7.10291 8.24069 4.64415 10.0535 2.8313C11.8664 1.01845 14.3252 0 16.8889 0ZM2.38891 9.66667C2.39062 11.1645 2.85622 12.6251 3.7217 13.8476C4.58718 15.07 5.81006 15.9945 7.22225 16.4937V19.0192C5.15359 18.4785 3.32256 17.2672 2.01572 15.5749C0.708889 13.8826 0 11.8048 0 9.66667C0 7.52852 0.708889 5.4507 2.01572 3.75841C3.32256 2.06611 5.15359 0.854843 7.22225 0.314167V2.83958C5.81006 3.33886 4.58718 4.26329 3.7217 5.48578C2.85622 6.70827 2.39062 8.16882 2.38891 9.66667Z"
                  fill="#246A73"
                />
              </svg>
              {/* Currency Value */}
              <span className="text-base font-bold text-white">
                {userLoader ? (
                  <CommonLoader size="sm" border="border-white" />
                ) : hasWalletData ? (
                  formatCurrency(holdingMoney)
                ) : (
                  formatCurrency(0)
                )}
              </span>
            </div>
            {/* Chevron Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              className={`h-5 w-5 transition-transform ${isWalletOpen ? 'rotate-180' : ''}`}
            >
              <path
                d="M5 7.5L10 12.5L15 7.5"
                stroke="#246A73"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
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
                  <CommonLoader size="sm" border="border-[#1D4647]" />
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
            className="rounded-[5px] border bg-[#131515] shadow-xl"
            style={{ borderColor: 'rgba(36, 106, 115, 0.30)' }}
          >
            <div className="overflow-hidden rounded-[5px] p-2">
              {/* Row: Game Wallet */}
              <button
                type="button"
                onClick={handleGameWalletClick}
                className="group mb-2 flex w-full items-center justify-between rounded-[3px] border bg-transparent px-3 py-3 transition-all duration-200 hover:border-[#E33A24] hover:bg-[#E33A24]"
                style={{ borderColor: 'rgba(36, 106, 115, 0.3)' }}
              >
                <span className="flex items-center gap-3">
                  <span className="text-[12px] text-[#3DCCC7] transition-colors group-hover:text-white">
                    {t('game_wallet')}
                  </span>
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-medium text-[#3DCCC7] transition-colors group-hover:text-white">
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
                    className="text-[#3DCCC7] transition-colors group-hover:!text-white"
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
                className="group mb-2 flex w-full items-center justify-between rounded-[3px] border bg-transparent px-3 py-3 transition-all duration-200 hover:border-[#E33A24] hover:bg-[#E33A24]"
                style={{ borderColor: 'rgba(36, 106, 115, 0.3)' }}
              >
                <span className="flex items-center gap-3">
                  <span className="text-[12px] text-[#3DCCC7] transition-colors group-hover:text-white">
                    {t('points')}
                  </span>
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-medium text-[#3DCCC7] transition-colors group-hover:text-white">
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
                    className="text-[#3DCCC7] transition-colors group-hover:!text-white"
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
                className="group flex w-full items-center justify-between rounded-[3px] border bg-transparent px-3 py-3 transition-all duration-200 hover:border-[#E33A24] hover:bg-[#E33A24]"
                style={{ borderColor: 'rgba(36, 106, 115, 0.3)' }}
              >
                <span className="flex items-center gap-3">
                  <span className="text-[12px] text-[#3DCCC7] transition-colors group-hover:text-white">
                    {t('coupons')}
                  </span>
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-medium text-[#3DCCC7] transition-colors group-hover:text-white">
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
                    className="text-[#3DCCC7] transition-colors group-hover:!text-white"
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
