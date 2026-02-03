'use client';

import Image from 'next/image';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import StatusPill from '@/components/StatusPill/StatusPill';
import { formatAmount } from '@/helpers/formatting';
import { getStatusText, getStatusVariant } from '@/helpers/statusUtils';
import { useTemplate } from '@/hooks/useTemplate';
import { useTranslations } from '@/hooks/useTranslations';

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

const CryptoPaymentDetails = ({ paymentData, onClose }) => {
  const { t } = useTranslations();
  const { getCurrency } = useTemplate();

  // State
  const [paymentStatus] = useState(
    paymentData?.payment_status || PAYMENT_STATUSES.WAITING,
  );
  const [qrCodeUrl, setQrCodeUrl] = useState('');

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

  // Handlers
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
  const renderAmountDisplay = () => (
    <div className="rounded-[10px] border border-[#FFFFFF66] bg-black px-4 py-4">
      <div className="text-center text-base font-bold md:text-lg">
        <span className="text-white">{displayAmount.amount}</span>{' '}
        <span className="text-[#D3AF37]">{displayAmount.currency}</span>
      </div>
    </div>
  );

  const renderCryptoAmountDisplay = () => (
    <div className="rounded-[10px] border border-[#FFFFFF66] bg-black px-4 py-4">
      <div className="text-center text-base font-bold md:text-lg">
        <span className="text-white">{cryptoAmount.amount}</span>{' '}
        <span className="text-[#D3AF37]">{cryptoAmount.currency}</span>
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
        <div className="mt-3 text-xs tracking-wide text-[#D3AF37] uppercase">
          {t('scan_to_pay')}
        </div>
      </div>
    );
  };

  const renderAddressSection = () => (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
      <div className="flex h-[46px] w-full items-center rounded-[6px] border border-[#FFFFFF66] bg-[#ffffff17] px-3 text-[12px] text-white md:text-[14px]">
        <div className="flex flex-1 items-center gap-2">
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
            className="btn-style901 shrink-0 transition-opacity hover:opacity-80"
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
        className="btn-style901 w-full rounded-[10px] bg-[#E8D25E] px-5 py-3 text-sm font-bold text-black [box-shadow:inset_0_-3px_0_#876800] transition-all duration-200 hover:[box-shadow:0_0_10px_0_#876800_inset,0_0_20px_2px_#876800] hover:outline hover:outline-2 hover:outline-[#876800] active:scale-95 sm:w-[270px]"
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
    <div className="rounded-[16px] border border-[#FFFFFF66] bg-transparent p-5">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <span className="text-[15px] font-bold text-white md:text-[16px]">
          {t('deposit_details')}
        </span>
        <button
          onClick={onClose}
          aria-label={t('close')}
          className="group flex h-8 w-8 flex-shrink-0 cursor-pointer items-center justify-center rounded-md text-white transition-all duration-300"
          style={{
            backgroundImage: 'linear-gradient(#74cae3, #5bc0de 60%, #4ab9db)',
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className="transition-all duration-300 group-hover:rotate-180 sm:h-5 sm:w-5"
          >
            <path
              d="M6 6L18 18M18 6L6 18"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* Amount and QR Section */}
      <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="mb-2 text-[14px] font-bold text-white">
            {t('amount_to_pay')}
          </div>
          <div className="rounded-[8px] border border-[#FFFFFF66] bg-transparent px-6 py-8 text-white">
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="flex-1">{renderAmountDisplay()}</div>
              <div className="text-center text-2xl font-bold text-[#D3AF37] select-none md:hidden">
                =
              </div>
              <div className="hidden px-2 text-center text-2xl font-bold text-[#D3AF37] select-none md:block">
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
        <div className="rounded-[8px] border border-[#FFFFFF66] bg-transparent px-5 py-4 text-white">
          {renderInstructions()}
        </div>
      </div>
    </div>
  );
};

export default CryptoPaymentDetails;
