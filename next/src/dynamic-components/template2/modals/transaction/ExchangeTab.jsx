'use client';

import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import { formatPoints } from '@/helpers/formatting';
import { useTranslations } from '@/hooks/useTranslations';
import { clearPreviouslySelectedTab } from '@/slices/common/commonSlice';
import { createTransactionRequest } from '@/website/websiteAction';

export default function ExchangeTab() {
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
              className="relative flex h-[46px] w-full cursor-pointer appearance-none items-center justify-between rounded-[5px] border border-[#51a2ff8a] bg-[#03071E] px-3 py-3 text-[12px] text-white focus:border-[#51A2FF] focus:ring-1 focus:ring-[#51A2FF] focus:outline-none md:text-[14px]"
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
                  ? t('exchange_with_points')
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
              <div className="scrollbar-hide absolute z-[99999] mt-1 max-h-[150px] w-full overflow-y-auto rounded-[5px] border border-[#51a2ff8a] bg-black shadow-lg">
                <div
                  className="cursor-pointer px-3 py-2 text-[12px] text-white transition-colors duration-150 hover:bg-[#51A2FF] md:text-[14px]"
                  onClick={() => {
                    setConvertType('points_exchange');
                    setIsConvertDropdownOpen(false);
                  }}
                >
                  {t('exchange_with_points')}
                </div>
                <div
                  className="cursor-pointer px-3 py-2 text-[12px] text-white transition-colors duration-150 hover:bg-[#51A2FF] md:text-[14px]"
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
            className="flex h-[46px] w-full items-center rounded-[6px] border border-[#FFFFFF66] bg-[#ffffff17] px-3 text-[12px] text-white md:text-[14px]"
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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label
              htmlFor="convert-amount"
              className="text-[14px] font-bold whitespace-nowrap text-white capitalize sm:min-w-fit"
            >
              {t('enter_amount')}
            </label>
            <input
              id="convert-amount"
              type="number"
              placeholder={t('enter_amount')}
              value={convertAmount}
              onChange={(e) => setConvertAmount(e.target.value)}
              className="relative block h-[46px] w-full appearance-none rounded-[5px] border border-[#51a2ff8a] bg-[#03071E] px-3 py-3 text-white placeholder:text-xs placeholder:text-[#FFFFFF66] autofill:bg-[#03071E] autofill:shadow-[inset_0_0_0px_1000px_#03071E] autofill:[-webkit-text-fill-color:white] focus:z-10 focus:border-[#51A2FF] focus:ring-1 focus:ring-[#51A2FF] focus:outline-none sm:w-auto sm:flex-1 sm:text-sm md:px-4 md:text-[14px] md:placeholder:text-sm"
              min="1"
              step="1"
            />
            <button
              type="submit"
              disabled={
                convertLoading ||
                !convertAmount ||
                parseFloat(convertAmount) < 1 ||
                !convertType
              }
              className="btn-style901 inline-flex h-[46px] items-center justify-center rounded-[8px] bg-[#51A2FF] px-6 text-[14px] whitespace-nowrap text-white transition-all duration-300 hover:bg-[#4a96e6] disabled:cursor-not-allowed disabled:opacity-50 sm:shrink-0"
            >
              {convertLoading ? t('processing') : t('send_your_request')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
