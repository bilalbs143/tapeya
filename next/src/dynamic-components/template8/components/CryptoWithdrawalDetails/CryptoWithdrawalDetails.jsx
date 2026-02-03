'use client';

import Image from 'next/image';
import React from 'react';
import { toast } from 'react-toastify';

import StatusPill from '@/components/StatusPill/StatusPill';
import { getStatusText, getStatusVariant } from '@/helpers/statusUtils';
import { useTemplate } from '@/hooks/useTemplate';
import { useTranslations } from '@/hooks/useTranslations';

const CryptoWithdrawalDetails = ({ withdrawalData, onClose }) => {
  const { t } = useTranslations();
  const { getCurrency } = useTemplate();

  // Use the withdrawal status from the data directly with fallback
  const withdrawalStatus = withdrawalData?.withdrawal_status || 'PENDING';

  // Add fallback for missing data
  if (!withdrawalData) {
    return (
      <div className="rounded-[16px] border border-[#FFFFFF66] bg-transparent p-5">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-base font-bold text-white sm:text-base">
            {t('withdrawal_details')}
          </span>
          <button
            onClick={onClose}
            aria-label="close"
            className="group flex h-[30px] w-[30px] flex-shrink-0 cursor-pointer items-center justify-center rounded-md bg-[#2DFA1A] text-black transition-all duration-300 sm:h-[33px] sm:w-[33px]"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:rotate-180"
            >
              <path
                d="M6 6L18 18M18 6L6 18"
                stroke="#0B0B0B"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        <div className="text-center text-white">
          <p>{t('no_withdrawal_data_available')}</p>
        </div>
      </div>
    );
  }

  const copyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success(t('copied_to_clipboard'));
      })
      .catch((err) => {
        console.error('Failed to copy: ', err);
      });
  };

  // Custom status text mapping for withdrawal-specific statuses
  const getWithdrawalStatusText = (status) => {
    const statusLower = status?.toLowerCase();
    const baseText = getStatusText(status, t) || status;

    // Add "Withdrawal" prefix for withdrawal-specific statuses
    if (['verified', 'completed', 'rejected', 'failed'].includes(statusLower)) {
      return `Withdrawal ${baseText}`;
    }

    // Add "Request" prefix for pending states
    if (['pending'].includes(statusLower)) {
      return `Request ${baseText}`;
    }

    // Add "Processing" prefix for processing states
    if (['processing'].includes(statusLower)) {
      return t('processing_withdrawal');
    }

    return baseText;
  };

  if (!withdrawalData) return null;

  return (
    <div className="rounded-[16px] border border-[#FFFFFF66] bg-transparent p-5">
      {/* Header: title on left, close button on right */}
      <div className="mb-4 flex items-center justify-start gap-4">
        <button
          onClick={onClose}
          aria-label={t('back')}
          className="template8-filled-button-hover flex items-center justify-center rounded-[4px] bg-[#2DFA1A] px-8 py-2 font-extrabold text-black transition-all duration-300"
        >
          <span>{t('black')}</span>
        </button>
        <span className="text-base font-medium text-white sm:text-base">
          {t('withdrawal_details')}
        </span>
      </div>

      {/* Top bar: Withdrawal ID and status chip */}
      <div className="mt-8 mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <div className="flex flex-wrap items-center justify-start gap-2 sm:justify-start">
          <div className="text-left text-xs text-[#B6AAFF] sm:text-right">
            <div className="font-medium break-all text-white">
              {t('withdrawal_id')}: {withdrawalData?.withdrawal_id || 'N/A'}
            </div>
          </div>
          <StatusPill
            value={getWithdrawalStatusText(withdrawalStatus)}
            variant={getStatusVariant(withdrawalStatus?.toLowerCase())}
            size="xs"
          />
        </div>
      </div>

      {/* Amount Section */}
      <div className="mb-8">
        <div className="mb-2 text-[14px] font-bold text-white">
          {t('withdrawal_amount')}
        </div>
        <div className="rounded-[12px] border border-[#2DFA1A4D] bg-transparent px-6 py-8 text-white">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="flex-1">
              <div className="rounded-[10px] border border-[#2DFA1A4D] bg-[#101010] px-4 py-4">
                <div className="text-center text-base font-bold md:text-lg">
                  <span className="text-[#2DFA1A]">
                    {withdrawalData?.withdraw_amount_from || '0'}
                  </span>{' '}
                  <span className="text-[#2DFA1A]">
                    {withdrawalData?.withdraw_currency_from || getCurrency()}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-center text-2xl font-bold text-[#2DFA1A] select-none md:hidden">
              =
            </div>
            <div className="hidden px-2 text-center text-2xl font-bold text-[#2DFA1A] select-none md:block">
              =
            </div>
            <div className="flex-1">
              <div className="rounded-[10px] border border-[#2DFA1A4D] bg-[#2DFA1A] px-4 py-4">
                <div className="text-center text-base font-bold md:text-lg">
                  <span className="text-[#2DFA1A]">
                    {withdrawalData?.withdraw_amount_to || '0'}
                  </span>{' '}
                  <span className="text-[#2DFA1A]">
                    {withdrawalData?.withdraw_currency_to || getCurrency()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Information */}
      <div className="mb-6">
        <div className="mb-2 text-[14px] font-bold text-white">
          {t('payment_details')}
        </div>
        <div className="rounded-[12px] bg-[#101010] px-5 py-4 text-white">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-[14px] font-bold text-white">
                  {t('order_id')}:
                </span>
                <span className="font-mono text-sm">
                  {withdrawalData?.order_id || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[14px] font-bold text-white">
                  {t('batch_id')}:
                </span>
                <span className="font-mono text-sm">
                  {withdrawalData?.batch_withdrawal_id || 'N/A'}
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-[14px] font-bold text-white">
                  {t('exchange_request_id')}:
                </span>
                <span className="font-mono text-sm">
                  {withdrawalData?.exchange_request_id || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[14px] font-bold text-white">
                  {t('verification_required')}:
                </span>
                <span
                  className={`text-sm font-bold ${withdrawalData?.requires_verification ? 'text-[#FF8C24]' : 'text-[#28a745]'}`}
                >
                  {withdrawalData?.requires_verification ? t('yes') : t('no')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Address Row */}
      <div className="">
        <div className="mb-2 text-[14px] font-bold text-white">
          {t('withdrawal_address')}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
          <div className="flex-1 rounded-[12px] border border-[#2DFA1A4D] bg-black px-3 py-3 text-white">
            <div className="flex items-center gap-2">
              <input
                type="text"
                className="flex-1 truncate bg-transparent text-[16px] text-white outline-none sm:text-[18px]"
                value={withdrawalData?.withdraw_address || 'N/A'}
                readOnly
                style={{ fontFamily: 'monospace' }}
                title={withdrawalData?.withdraw_address || 'N/A'}
              />
              <button
                onClick={() =>
                  copyToClipboard(withdrawalData?.withdraw_address || '')
                }
                aria-label="copy"
                className="filled-button-hover-effect-5 shrink-0 transition-opacity hover:opacity-80"
                disabled={!withdrawalData?.withdraw_address}
              >
                <span>
                  <Image
                    src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/copy-icon.svg"
                    alt="copy"
                    width={20}
                    height={20}
                  />
                </span>
              </button>
            </div>
          </div>
          <button
            className="template8-filled-button-hover w-full rounded-[4px] bg-[#2DFA1A] px-5 py-3 text-sm font-bold text-black transition-all duration-200 active:scale-95 disabled:opacity-50 sm:w-[270px]"
            onClick={() =>
              copyToClipboard(withdrawalData?.withdraw_address || '')
            }
            disabled={!withdrawalData?.withdraw_address}
          >
            <span className="text-container">
              <span className="text">Copy</span>
            </span>
          </button>
        </div>
      </div>

      {/* Instructions */}

      <div className="mt-6">
        <div className="mb-2 text-[14px] font-bold text-white">
          {t('withdrawal_instructions')}
        </div>
        <div className="text-grey-400 rounded-[12px] bg-[#101010] px-5 py-4">
          <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
            <ul className="list-disc space-y-2 pl-5">
              <li>
                {t('your_withdrawal_request_for')}{' '}
                <strong>
                  {withdrawalData?.withdraw_amount_to || '0'}{' '}
                  {withdrawalData?.withdraw_currency_to || getCurrency()}
                </strong>{' '}
                {t('is_currently')} <strong>{withdrawalStatus}</strong>.
              </li>
              {withdrawalData?.requires_verification && (
                <li className="text-[#FF8C24]">
                  {t('this_withdrawal_requires_manual_verification')}
                </li>
              )}
              {withdrawalData?.automatically_verified && (
                <li className="text-[#28a745]">
                  {t('this_withdrawal_has_been_automatically_verified')}
                </li>
              )}
            </ul>
            <ul className="list-disc space-y-2 pl-5">
              <li>{t('withdrawal_processing_time_typically')}</li>
              <li>{t('you_will_be_notified_once_completed')}</li>
              {withdrawalStatus === 'REJECTED' && (
                <li className="text-[#dc3545]">
                  {t('this_withdrawal_has_been_rejected')}
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CryptoWithdrawalDetails;
