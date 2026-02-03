'use client';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import CommonLoader from '@/components/CommonLoader/CommonLoader';
import { formatCurrency, formatPoints } from '@/helpers/formatting';
import { useTranslations } from '@/hooks/useTranslations';

export default function WalletButton({ variant = 'desktop' }) {
  const { user, userLoader } = useSelector((state) => state.auth);
  const router = useRouter();
  const { t } = useTranslations();

  // Extract wallet information from user data
  const holdingMoney = user?.wallet?.holding_money || 0;
  const points = user?.wallet?.points || 0;
  const couponPoints = user?.wallet?.coupon_points || 0;
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

    if (isWalletOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isWalletOpen]);

  // Handle navigation to deposit page
  const handleDepositClick = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsWalletOpen(false);
      router.push('/dashboard/deposit');
    },
    [router],
  );

  // Handle navigation to withdrawal page
  const handleWithdrawalClick = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsWalletOpen(false);
      router.push('/dashboard/withdrawal');
    },
    [router],
  );

  const toggleWallet = useCallback(() => {
    setIsWalletOpen((prev) => !prev);
  }, []);

  return (
    <div className="relative" ref={walletRef}>
      {/* Wallet Button with Three Sections */}
      <button
        onClick={toggleWallet}
        className="group flex h-[50px] min-w-[200px] items-center rounded-[4px] bg-[#0A1414]"
        style={{
          border: '1px solid rgba(45, 250, 26, 0.30)',
        }}
      >
        <div className="flex h-full w-full items-center">
          {/* Left Section - Minus Button */}
          <button
            onClick={handleWithdrawalClick}
            className="flex h-full min-w-[50px] items-center justify-center rounded-l bg-[#2DFA1A]"
            type="button"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="2"
              viewBox="0 0 12 2"
              fill="none"
              className="h-3 w-3"
            >
              <path
                d="M0 1H12"
                stroke="black"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>

          {/* Center Section - Currency Value */}
          <div className="flex h-full flex-1 items-center justify-center px-3">
            {userLoader ? (
              <CommonLoader size="sm" border="border-white" />
            ) : hasWalletData ? (
              <span className="template8-wallet-button-value">
                {formatCurrency(holdingMoney)}
              </span>
            ) : (
              <span className="template8-wallet-button-value">
                {formatCurrency(0)}
              </span>
            )}
          </div>

          {/* Right Section - Plus Button */}
          <button
            onClick={handleDepositClick}
            className="flex h-full min-w-[50px] items-center justify-center rounded-r bg-[#2DFA1A]"
            type="button"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              className="h-3 w-3"
            >
              <path
                d="M6 0V12M0 6H12"
                stroke="black"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </button>

      {/* Wallet Dropdown */}
      {isWalletOpen && (
        <div className="template8-wallet-dropdown">
          <div
            className="border bg-[#0A1414] shadow-xl"
            style={{ borderColor: 'rgba(45, 250, 26, 0.30)' }}
          >
            <div className="overflow-hidden rounded-[5px] p-3">
              {/* Game Wallet */}
              <button
                type="button"
                onClick={handleDepositClick}
                className="group mb-2 flex w-full items-center justify-between rounded-[3px] border px-3 py-3 transition-all duration-200"
                style={{ borderColor: 'rgba(45, 250, 26, 0.30)' }}
              >
                <span className="flex items-center gap-3">
                  <span className="text-[10px] text-[#7D7D7D] transition-colors group-hover:text-white">
                    {t('game_wallet')}
                  </span>
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-medium text-[#7D7D7D] transition-colors group-hover:text-white">
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
                    className="text-[#636363] transition-colors group-hover:!text-[#2DFA1A]"
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

              {/* Points */}
              <button
                type="button"
                onClick={() => {
                  setIsWalletOpen(false);
                  router.push('/dashboard/points');
                }}
                className="group mb-2 flex w-full items-center justify-between rounded-[3px] border px-3 py-3 transition-all duration-200"
                style={{ borderColor: 'rgba(45, 250, 26, 0.30)' }}
              >
                <span className="flex items-center gap-3">
                  <span className="text-[10px] text-[#7D7D7D] transition-colors group-hover:text-white">
                    {t('points')}
                  </span>
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-medium text-[#7D7D7D] transition-colors group-hover:text-white">
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
                    className="text-[#636363] transition-colors group-hover:!text-[#2DFA1A]"
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

              {/* Coupons */}
              <button
                type="button"
                onClick={() => {
                  setIsWalletOpen(false);
                  router.push('/dashboard/coupons');
                }}
                className="group flex w-full items-center justify-between rounded-[3px] border px-3 py-3 transition-all duration-200"
                style={{ borderColor: 'rgba(45, 250, 26, 0.30)' }}
              >
                <span className="flex items-center gap-3">
                  <span className="text-[10px] text-[#7D7D7D] transition-colors group-hover:text-white">
                    {t('coupons')}
                  </span>
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-medium text-[#7D7D7D] transition-colors group-hover:text-white">
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
                    className="text-[#636363] transition-colors group-hover:!text-[#2DFA1A]"
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
