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
                src={`${baseUrl}/icons/coin-8.svg`}
                alt="Wallet"
                width={25}
                height={25}
                className={`${isMobile ? 'h-6 w-6' : 'h-6 w-6'}`}
              />
              <span
                className={`${buttonTextSize} font-medium text-white group-hover:text-white`}
              >
                {userLoader ? (
                  <CommonLoader size="sm" border="border-[#2DFA1A]" />
                ) : hasWalletData ? (
                  formatCurrency(holdingMoney)
                ) : (
                  formatCurrency(0)
                )}
              </span>
            </span>
            <Image
              src={`${baseUrl}/icons/drop-green-8.svg`}
              alt="Open wallet"
              width={15}
              height={15}
              className={`h-3 w-3 transition-transform ${isWalletOpen ? 'rotate-180' : ''}`}
            />
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
                  <CommonLoader size="sm" border="border-[#2DFA1A]" />
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
            className={`border bg-[#0A1414] shadow-xl ${isMobile ? '' : 'border-[#7351ff]'}`}
            style={isMobile ? { borderColor: 'rgba(45, 250, 26, 0.30)' } : {}}
          >
            <div className="overflow-hidden rounded-[5px] p-3">
              {/* Row: Game Wallet */}
              <button
                type="button"
                onClick={handleGameWalletClick}
                className="group mb-2 flex w-full items-center justify-between rounded-[3px] border px-3 py-3 transition-all duration-200"
                style={{
                  borderColor: isMobile ? 'rgba(45, 250, 26, 0.30)' : '#7351FF',
                }}
              >
                <span className="flex items-center gap-3">
                  <span
                    className={`${textSize} text-[#7D7D7D] transition-colors group-hover:text-white`}
                  >
                    {t('game_wallet')}
                  </span>
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={`${textSize} font-medium text-[#7D7D7D] transition-colors group-hover:text-white`}
                  >
                    {userLoader ? (
                      <CommonLoader size="sm" border="border-[#2DFA1A]" />
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
                    className={`text-white/50 transition-colors ${isMobile ? 'group-hover:!text-[#2DFA1A]' : 'group-hover:!text-[#7351FF]'}`}
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
                className="group mb-2 flex w-full items-center justify-between rounded-[3px] border px-3 py-3 transition-all duration-200"
                style={{
                  borderColor: isMobile ? 'rgba(45, 250, 26, 0.30)' : '#7351FF',
                }}
              >
                <span className="flex items-center gap-3">
                  <span
                    className={`${textSize} text-[#7D7D7D] transition-colors group-hover:text-white`}
                  >
                    {t('points')}
                  </span>
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={`${textSize} font-medium text-[#7D7D7D] transition-colors group-hover:text-white`}
                  >
                    {userLoader ? (
                      <CommonLoader size="sm" border="border-[#2DFA1A]" />
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
                    className={`text-white/50 transition-colors ${isMobile ? 'group-hover:!text-[#2DFA1A]' : 'group-hover:!text-[#7351FF]'}`}
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
                className="group flex w-full items-center justify-between rounded-[3px] border px-3 py-3 transition-all duration-200"
                style={{
                  borderColor: isMobile ? 'rgba(45, 250, 26, 0.30)' : '#7351FF',
                }}
              >
                <span className="flex items-center gap-3">
                  <span
                    className={`${textSize} text-[#7D7D7D] transition-colors group-hover:text-white`}
                  >
                    {t('coupons')}
                  </span>
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={`${textSize} font-medium text-[#7D7D7D] transition-colors group-hover:text-white`}
                  >
                    {userLoader ? (
                      <CommonLoader size="sm" border="border-[#2DFA1A]" />
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
                    className={`text-white/50 transition-colors ${isMobile ? 'group-hover:!text-[#2DFA1A]' : 'group-hover:!text-[#7351FF]'}`}
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
