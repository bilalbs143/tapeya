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
  const [walletButtonWidth, setWalletButtonWidth] = useState(0);
  const walletRef = useRef(null);
  const walletButtonRef = useRef(null);

  // Track wallet button width
  useEffect(() => {
    if (!walletButtonRef.current) return;

    const updateWidth = () => {
      if (walletButtonRef.current) {
        setWalletButtonWidth(walletButtonRef.current.offsetWidth);
      }
    };

    updateWidth();

    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(walletButtonRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

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
        ref={walletButtonRef}
        onClick={toggleWallet}
        className="group flex h-[50px] min-w-[200px] items-center rounded-[45px] bg-[#12001F]"
        style={{
          border: '1px solid rgba(219, 180, 44, 0.30)',
          boxShadow: '0 4px 22px 0 rgba(0, 0, 0, 0.45) inset',
        }}
      >
        <div className="flex h-full w-full items-center gap-4 p-1">
          {/* Left Section - Withdrawal Button */}
          <button
            onClick={handleWithdrawalClick}
            className="flex h-full w-[100px] items-center justify-center rounded-[140px] bg-[#1D0032] px-3"
            type="button"
          >
            <span className="text-sm font-bold text-[#DBB42C]">
              {t('withdrawal') || 'Withdrawal'}
            </span>
          </button>

          {/* Center Section - Currency Value */}
          <div className="flex h-full flex-1 items-center justify-center px-3">
            {userLoader ? (
              <CommonLoader size="sm" border="border-white" />
            ) : hasWalletData ? (
              <span className="template10-wallet-button-value text-white">
                {formatCurrency(holdingMoney)}
              </span>
            ) : (
              <span className="template10-wallet-button-value text-white">
                {formatCurrency(0)}
              </span>
            )}
          </div>

          {/* Right Section - Deposit Button */}
          <button
            onClick={handleDepositClick}
            className="flex h-full w-[100px] items-center justify-center rounded-[140px] bg-[#1D0032] px-3"
            type="button"
          >
            <span className="text-sm font-bold text-[#DBB42C]">
              {t('deposit') || 'Deposit'}
            </span>
          </button>
        </div>
      </button>

      {/* Wallet Dropdown */}
      {isWalletOpen && (
        <div
          className="absolute top-[calc(100%+8px)] left-1/2 z-[1000] -translate-x-1/2"
          style={{
            width: walletButtonWidth > 0 ? `${walletButtonWidth}px` : '200px',
          }}
        >
          <div
            className="rounded-[3px] border bg-[#1D0032] shadow-xl"
            style={{ borderColor: 'rgba(219, 180, 44, 0.30)' }}
          >
            <div className="overflow-hidden rounded-[3px] p-2">
              {/* Game Wallet */}
              <button
                type="button"
                onClick={handleDepositClick}
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

              {/* Points */}
              <button
                type="button"
                onClick={() => {
                  setIsWalletOpen(false);
                  router.push('/dashboard/points');
                }}
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

              {/* Coupons */}
              <button
                type="button"
                onClick={() => {
                  setIsWalletOpen(false);
                  router.push('/dashboard/coupons');
                }}
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
