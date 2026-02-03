'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import { formatPoints } from '@/helpers/formatting';
import { useTranslations } from '@/hooks/useTranslations';
import { clearPreviouslySelectedTab } from '@/slices/common/commonSlice';
import { createTransactionRequest } from '@/website/websiteAction';

export default function ConvertPointsCouponsTab() {
  const dispatch = useDispatch();
  const { points = 0, coupon_points: couponPoints = 0 } = useSelector(
    (state) => state.auth.user?.wallet || {},
  );
  const previouslySelectedTab = useSelector(
    (state) => state.common.previouslySelectedTab,
  );
  const [convertType, setConvertType] = useState('points_exchange');
  const [convertAmount, setConvertAmount] = useState('');
  const [convertLoading, setConvertLoading] = useState(false);
  const [isConvertDropdownOpen, setIsConvertDropdownOpen] = useState(false);
  const convertDropdownRef = useRef(null);
  const { t } = useTranslations();

  // If user navigated here from Points or Coupons tab, default selection accordingly
  useEffect(() => {
    if (previouslySelectedTab === 'Coupons') {
      setConvertType('coupon_points_exchange');
      dispatch(clearPreviouslySelectedTab());
    } else if (previouslySelectedTab === 'Points') {
      setConvertType('points_exchange');
      dispatch(clearPreviouslySelectedTab());
    }
  }, [previouslySelectedTab, dispatch]);

  // Close convert dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        convertDropdownRef.current &&
        !convertDropdownRef.current.contains(event.target)
      ) {
        setIsConvertDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmitConvert = async (e) => {
    e.preventDefault();

    if (!convertAmount || parseFloat(convertAmount) < 1) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      setConvertLoading(true);
      await dispatch(
        createTransactionRequest({
          type: convertType,
          requested_money: parseFloat(convertAmount),
        }),
      ).unwrap();

      toast.success('Convert request submitted successfully!');
      setConvertAmount('');
    } catch (error) {
      console.log('Error:', error);
    } finally {
      setConvertLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h3 className="text-[15px] font-extrabold text-white md:text-[20px]">
          {t('convert_points_coupons')}
        </h3>
      </div>

      {/* Convert Section */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
        <div>
          <label
            htmlFor="convert-select"
            className="mb-2 block text-[14px] font-bold text-white"
          >
            {t('exchange_to_game_wallet')} *
          </label>
          <div className="relative" ref={convertDropdownRef}>
            <div
              id="convert-select"
              className="relative flex h-[46px] w-full cursor-pointer appearance-none items-center justify-between rounded-[5px] border border-[#3E1D88] bg-[#3E1D88] px-3 py-3 text-[12px] text-white shadow-[inset_4px_5px_16px_0_rgba(0,0,0,0.25)] focus:border-[#661BB5] focus:ring-1 focus:ring-[#661BB5] focus:outline-none md:text-[14px] lg:h-[55px]"
              onClick={() => setIsConvertDropdownOpen(!isConvertDropdownOpen)}
            >
              <span
                className={
                  convertType === 'points_exchange'
                    ? 'text-white'
                    : convertType === 'coupon_points_exchange'
                      ? 'text-white'
                      : 'text-[#B3A6FF]'
                }
              >
                {convertType === 'points_exchange'
                  ? t('points')
                  : convertType === 'coupon_points_exchange'
                    ? t('coupon_points')
                    : t('select_one')}
              </span>
              <svg
                className={`h-5 w-5 text-white transition-transform duration-200 ${isConvertDropdownOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>

            {isConvertDropdownOpen && (
              <div className="scrollbar-hide absolute z-[99999] mt-1 max-h-[150px] w-full overflow-y-auto rounded-[3px] border border-[#3E1D88] bg-black shadow-lg">
                <div
                  className="cursor-pointer px-3 py-2 text-[12px] text-white transition-colors duration-150 hover:bg-[#3E1D88] md:text-[14px]"
                  onClick={() => {
                    setConvertType('points_exchange');
                    setIsConvertDropdownOpen(false);
                  }}
                >
                  {t('points')}
                </div>
                <div
                  className="cursor-pointer px-3 py-2 text-[12px] text-white transition-colors duration-150 hover:bg-[#3E1D88] md:text-[14px]"
                  onClick={() => {
                    setConvertType('coupon_points_exchange');
                    setIsConvertDropdownOpen(false);
                  }}
                >
                  {t('coupon_points')}
                </div>
              </div>
            )}
          </div>
        </div>
        <div>
          <label
            htmlFor="available-amount"
            className="mb-2 block text-[14px] font-bold text-white"
          >
            {t('available')}
          </label>
          <div
            id="available-amount"
            className="flex h-[46px] w-full items-center rounded-[3px] border border-[#3E1D88] bg-[#3E1D88] px-3 py-3 text-[12px] text-[#FFFFFF80] shadow-[inset_4px_5px_16px_0_rgba(0,0,0,0.25)] sm:text-sm md:placeholder:text-sm lg:h-[55px]"
          >
            {convertType === 'points_exchange' ? (
              <span className="font-semibold text-white">
                {formatPoints(points)}
              </span>
            ) : convertType === 'coupon_points_exchange' ? (
              <span className="font-semibold text-white">
                {formatPoints(couponPoints)}
              </span>
            ) : (
              <span className="text-[#B3A6FF]">{t('select_convert_type')}</span>
            )}
          </div>
        </div>
      </div>

      {/* Amount Input Section */}
      <div className="space-y-4">
        {/* Input Field and Send Button */}
        <form onSubmit={handleSubmitConvert} className="space-y-4">
          <div className="">
            <label
              htmlFor="convert-amount"
              className="mb-2 block text-[14px] font-bold text-white"
            >
              {t('enter_amount')}
            </label>
            <input
              id="convert-amount"
              type="number"
              placeholder={t('enter_amount')}
              value={convertAmount}
              onChange={(e) => setConvertAmount(e.target.value)}
              className="relative block h-[46px] w-full appearance-none rounded-[3px] border border-[#3E1D88] bg-[#3E1D88] px-3 py-3 text-white shadow-[inset_4px_5px_16px_0_rgba(0,0,0,0.25)] placeholder:text-xs placeholder:text-[#FFFFFF66] focus:border-[#661BB5] focus:ring-0 focus:ring-transparent focus:outline-none sm:flex-1 sm:text-sm md:placeholder:text-sm lg:h-[55px]"
              min="1"
              step="1"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={
                convertLoading ||
                !convertAmount ||
                parseFloat(convertAmount) < 1 ||
                !convertType
              }
              className="angled-button angled-button-pinks h-[32px] w-full disabled:cursor-not-allowed disabled:opacity-50 md:h-[45px] md:w-[180px]"
            >
              <div className="angled-button-inner">
                <span className="angled-button-text">
                  {convertLoading ? t('processing') : t('send_your_request')}
                </span>
              </div>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
