'use client';

import Image from 'next/image';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import StatusPill from '@/components/StatusPill/StatusPill';
import { formatAmount } from '@/helpers/formatting';
import { getStatusText, getStatusVariant } from '@/helpers/statusUtils';
import { useTemplate } from '@/hooks/useTemplate';
import { useTranslations } from '@/hooks/useTranslations';
import { cancelCryptoDeposit } from '@/website/websiteAction';

const PAYMENT_STATUSES = {
  FINISHED: 'finished',
  CONFIRMED: 'confirmed',
  FAILED: 'failed',
  EXPIRED: 'expired',
  REFUNDED: 'refunded',
  WAITING: 'waiting',
  CONFIRMING: 'confirming',
  SENDING: 'sending',
};

const CryptoPaymentDetails = ({ paymentData, onClose, onCancelSuccess }) => {
  const { t } = useTranslations();
  const { getCurrency } = useTemplate();
  const dispatch = useDispatch();

  // State
  const [paymentStatus] = useState(
    paymentData?.payment_status || PAYMENT_STATUSES.WAITING,
  );
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(null);

  // Redux state
  const { cancelCryptoDepositLoader } = useSelector((state) => state.website);
  // Effects
  useEffect(() => {
    if (
      paymentData?.pay_address &&
      paymentData?.pay_currency &&
      paymentData?.pay_amount
    ) {
      try {
        const qrData = paymentData.pay_address;
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;
        setQrCodeUrl(qrUrl);
      } catch (error) {
        console.error('Failed to generate QR code URL:', error);
        setQrCodeUrl('');
      }
    }
  }, [paymentData]);

  useEffect(() => {
    if (!paymentData?.expiration_estimate_date) {
      setTimeRemaining(null);
      return;
    }

    const update = () => {
      const ms = new Date(paymentData.expiration_estimate_date) - Date.now();
      if (ms <= 0) return setTimeRemaining({ expired: true });

      const totalSeconds = Math.floor(ms / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      setTimeRemaining({ hours, minutes, seconds, expired: false });
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [paymentData?.expiration_estimate_date]);

  // Handlers
  const performCancelDeposit = useCallback(async () => {
    if (!paymentData?.id) return;

    try {
      await dispatch(cancelCryptoDeposit({ id: paymentData.id })).unwrap();
      onCancelSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to cancel deposit:', error);
    }
  }, [dispatch, paymentData?.id, onCancelSuccess, onClose]);

  const copyToClipboard = useCallback(
    async (text) => {
      try {
        await navigator.clipboard.writeText(text);
        toast.success(t('copied_to_clipboard'));
      } catch (error) {
        console.error('Failed to copy: ', error);
      }
    },
    [t],
  );

  const handleCancelDeposit = useCallback(async () => {
    if (!window.confirm(t('confirm_cancel_deposit'))) return;
    await performCancelDeposit();
  }, [t, performCancelDeposit]);

  // Auto-cancel deposit when countdown expires
  useEffect(() => {
    if (timeRemaining?.expired) {
      performCancelDeposit();
    }
  }, [timeRemaining?.expired, performCancelDeposit]);

  // Computed values
  const getPaymentStatusText = useCallback(
    (status) => {
      const statusLower = status?.toLowerCase();
      const baseText = getStatusText(status, t) || status;

      // Payment-specific status mappings
      const statusMappings = {
        [PAYMENT_STATUSES.FINISHED]: () => `${t('payment')} ${baseText}`,
        [PAYMENT_STATUSES.CONFIRMED]: () => `${t('payment')} ${baseText}`,
        [PAYMENT_STATUSES.FAILED]: () => `${t('payment')} ${baseText}`,
        [PAYMENT_STATUSES.EXPIRED]: () => `${t('payment')} ${baseText}`,
        [PAYMENT_STATUSES.REFUNDED]: () => `${t('payment')} ${baseText}`,
        [PAYMENT_STATUSES.WAITING]: () => t('waiting_for_payment'),
        [PAYMENT_STATUSES.CONFIRMING]: () => t('confirming_payment'),
        [PAYMENT_STATUSES.SENDING]: () => t('processing_payment'),
      };

      return statusMappings[statusLower]?.() || baseText;
    },
    [t],
  );

  const displayAmount = useMemo(() => {
    if (paymentData?.price_amount_idr) {
      return {
        amount: formatAmount(paymentData.price_amount_idr),
        currency: getCurrency(),
      };
    }
    return {
      amount: formatAmount(paymentData?.price_amount),
      currency: paymentData?.price_currency?.toUpperCase(),
    };
  }, [paymentData, getCurrency]);

  const cryptoAmount = useMemo(
    () => ({
      amount: paymentData?.pay_amount,
      currency: paymentData?.pay_currency?.toUpperCase(),
    }),
    [paymentData],
  );

  // Render helpers
  const renderCountdown = () => {
    if (!timeRemaining) return null;

    if (timeRemaining.expired) {
      return (
        <div className="mb-4 rounded-[12px] bg-gradient-to-r from-red-600 to-red-500 px-4 py-3 shadow-lg">
          <div className="flex items-center gap-3">
            <svg
              className="h-6 w-6 shrink-0 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex-1 text-sm font-bold text-white">
              {t('payment_expired')}
            </div>
          </div>
        </div>
      );
    }

    const parts = [
      { value: timeRemaining.hours, label: t('hours') },
      { value: timeRemaining.minutes, label: t('minutes') },
      { value: timeRemaining.seconds, label: t('seconds') },
    ];

    return (
      <div className="mb-4 rounded-[12px] bg-gradient-to-r from-[#372A84] to-[#2E2070] px-4 py-3 shadow-lg">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-white md:text-sm">
              {t('wallet_expires_in')}
            </span>
          </div>
          <div className="flex items-center gap-1 text-white">
            {parts.map((p, i) => (
              <React.Fragment key={p.label}>
                <div className="flex flex-col items-center rounded-lg bg-white/10 px-2 py-1 backdrop-blur-sm">
                  <span className="text-base leading-none font-bold md:text-lg">
                    {String(p.value).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] uppercase opacity-80">
                    {p.label}
                  </span>
                </div>
                {i < parts.length - 1 && (
                  <span className="text-[#B6AAFF]">:</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderAmountDisplay = () => (
    <div className="rounded-[10px] bg-[#372A84] px-4 py-4">
      <div className="text-center text-base font-bold md:text-lg">
        <span className="text-white">{displayAmount.amount}</span>{' '}
        <span className="text-[#FF9A1F]">{displayAmount.currency}</span>
      </div>
    </div>
  );

  const renderCryptoAmountDisplay = () => (
    <div className="rounded-[10px] bg-[#372A84] px-4 py-4">
      <div className="text-center text-base font-bold md:text-lg">
        <span className="text-white">{cryptoAmount.amount}</span>{' '}
        <span className="text-[#FF9A1F]">{cryptoAmount.currency}</span>
      </div>
    </div>
  );

  const renderQRCode = () => {
    if (!qrCodeUrl) return null;

    return (
      <div className="flex flex-col items-center">
        <div className="rounded-[14px] border border-white/80 p-8">
          <Image
            src={qrCodeUrl}
            alt={t('payment_qr_code')}
            width={180}
            height={180}
            style={{ maxWidth: '180px', height: 'auto' }}
          />
        </div>
        <div className="uppercas mt-3 text-xs tracking-wide text-[#B6AAFF]">
          {t('scan_to_pay')}
        </div>
      </div>
    );
  };

  const renderAddressSection = () => (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
      <div className="flex-1 rounded-[12px] bg-[#372A84] px-3 py-3 text-white">
        <div className="flex items-center gap-2">
          <input
            type="text"
            className="flex-1 truncate bg-transparent text-[16px] text-white outline-none sm:text-[18px]"
            value={paymentData.pay_address}
            readOnly
            style={{ fontFamily: 'monospace' }}
            title={paymentData.pay_address}
          />
          <button
            onClick={() => copyToClipboard(paymentData.pay_address)}
            aria-label={t('copy')}
            className="shrink-0 transition-opacity hover:opacity-80"
          >
            <Image
              src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/copy-icon.svg"
              alt={t('copy')}
              width={20}
              height={20}
            />
          </button>
        </div>
      </div>
      <button
        className="w-full rounded-[10px] bg-[#FF8C24] px-5 py-3 text-sm font-bold text-white hover:bg-[#FC7E09] sm:w-[270px]"
        onClick={() => copyToClipboard(paymentData.pay_address)}
      >
        {t('copy')}
      </button>
    </div>
  );

  const renderInstructions = () => (
    <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
      <ul className="list-disc space-y-2 pl-5">
        <li>
          {t('send_exactly')}{' '}
          <strong>
            {paymentData.pay_amount} {paymentData.pay_currency?.toUpperCase()}
          </strong>{' '}
          {t('to_the_address_below')}
        </li>
        <li>{t('scan_qr_or_copy_address')}</li>
      </ul>
      <ul className="list-disc space-y-2 pl-5">
        <li>{t('payment_confirmed_automatically')}</li>
        <li>{t('do_not_close_until_confirmed')}</li>
      </ul>
    </div>
  );

  if (!paymentData) return null;

  return (
    <div className="rounded-[16px] bg-[#241866] p-5">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <span className="text-[15px] font-bold text-white md:text-[16px]">
          {t('deposit_details')}
        </span>
        <button
          onClick={onClose}
          aria-label={t('close')}
          className="btn-hover-outline group flex h-7 w-7 items-center justify-center rounded-md border border-[#FC7E09] bg-transparent text-white"
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
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* Countdown Timer */}
      {renderCountdown()}

      {/* Amount and QR Section */}
      <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="mb-2 text-[14px] font-bold text-white">
            {t('amount_to_pay')}
          </div>
          <div className="rounded-[12px] bg-[#2E2070] px-6 py-8 text-white">
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="flex-1">{renderAmountDisplay()}</div>
              <div className="text-center text-2xl font-bold text-[#B6AAFF] select-none md:hidden">
                =
              </div>
              <div className="hidden px-2 text-center text-2xl font-bold text-[#B6AAFF] select-none md:block">
                =
              </div>
              <div className="flex-1">{renderCryptoAmountDisplay()}</div>
            </div>
          </div>

          {/* Payment ID and Status */}
          <div className="mt-4 flex flex-row flex-wrap items-center gap-3">
            <div className="text-left text-xs text-[#B6AAFF]">
              <div className="font-medium break-all text-white">
                {t('payment_id')}: {paymentData.payment_id}
              </div>
            </div>
            <StatusPill
              value={getPaymentStatusText(paymentStatus)}
              variant={getStatusVariant(paymentStatus?.toLowerCase())}
              size="xs"
            />
          </div>
        </div>

        {/* QR Code */}
        <div className="flex justify-center md:justify-end">
          <div className="rounded-[12px] text-white">{renderQRCode()}</div>
        </div>
      </div>

      {/* Address Section */}
      <div className="">
        <div className="mb-2 text-[14px] font-bold text-white">
          {t('deposit_address')}
        </div>
        {renderAddressSection()}
      </div>

      {/* Instructions */}
      <div className="mt-6">
        <div className="mb-2 text-[14px] font-bold text-white">
          {t('deposit_instructions')}
        </div>
        <div className="rounded-[12px] bg-[#372A84] px-5 py-4 text-white">
          {renderInstructions()}
        </div>
      </div>

      {/* Cancel Deposit Button */}
      <div className="mt-6">
        <button
          onClick={handleCancelDeposit}
          disabled={cancelCryptoDepositLoader}
          className="w-full rounded-[10px] border-2 border-red-500 bg-transparent px-5 py-3 text-sm font-bold text-red-500 transition-all hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {cancelCryptoDepositLoader ? (
            <span className="flex items-center justify-center gap-2">
              {t('cancelling')}
            </span>
          ) : (
            t('cancel_deposit')
          )}
        </button>
      </div>
    </div>
  );
};

export default CryptoPaymentDetails;
