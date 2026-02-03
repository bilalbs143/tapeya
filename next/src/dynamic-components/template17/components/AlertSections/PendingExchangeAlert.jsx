'use client';

import { useRouter } from 'next/navigation';

import { useTranslations } from '@/hooks/useTranslations';

export default function PendingExchangeAlert({
  pendingDepositCount = 0,
  pendingWithdrawalCount = 0,
  totalPendingCount = 0,
  hasPendingRequests = false,
}) {
  const { t } = useTranslations();
  const router = useRouter();

  if (!hasPendingRequests) {
    return null;
  }

  const handleGoToDeposit = () => {
    router.push('/dashboard/deposit');
  };

  const handleGoToWithdrawal = () => {
    router.push('/dashboard/withdrawal');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#10B981]">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-white"
          >
            <path
              d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9 12L11 14L15 10"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-[#D9D9D9]">
            {t('you_have_pending_exchange_requests')}
          </p>
          <p className="text-xs text-[#B8B8B8]">
            {totalPendingCount}{' '}
            {totalPendingCount === 1
              ? t('pending_request')
              : t('pending_requests')}
          </p>
        </div>
      </div>

      <div className="rounded-lg bg-[#1a1a2e] p-4">
        <p className="mb-2 text-sm text-[#D9D9D9]">
          {t('please_review_your_pending_exchange_requests')}
        </p>

        {pendingDepositCount > 0 && (
          <div className="flex items-center justify-between py-1">
            <span className="text-xs text-[#10B981]">
              {pendingDepositCount} {t('pending_deposits')}
            </span>
          </div>
        )}

        {pendingWithdrawalCount > 0 && (
          <div className="flex items-center justify-between py-1">
            <span className="text-xs text-[#D3AF37]">
              {pendingWithdrawalCount} {t('pending_withdrawals')}
            </span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {pendingDepositCount > 0 && (
          <button
            onClick={handleGoToDeposit}
            className="w-full cursor-pointer rounded-[10px] bg-gradient-to-r from-[#D3AF37] via-[#FFF788] to-[#D3AF37] px-4 py-3 text-sm font-semibold text-black [box-shadow:inset_0_-3px_0_#876800] transition-all duration-150 active:scale-95"
            data-hover="View Deposits"
          >
            {t('view_deposits')}
          </button>
        )}

        {pendingWithdrawalCount > 0 && (
          <button
            onClick={handleGoToWithdrawal}
            className="w-full cursor-pointer rounded-[10px] bg-gradient-to-r from-[#D3AF37] via-[#FFF788] to-[#D3AF37] px-4 py-3 text-sm font-semibold text-black [box-shadow:inset_0_-3px_0_#876800] transition-all duration-150 active:scale-95"
            data-hover="View Withdrawals"
          >
            {t('view_withdrawals')}
          </button>
        )}
      </div>
    </div>
  );
}
