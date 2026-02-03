'use client';

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import Timer from '@/dynamic-components/template13/components/Timer/Timer';
import { formatNumber } from '@/helpers/formatting.js';
import { useTranslations } from '@/hooks/useTranslations';
import { closeModal, openModal } from '@/slices/common/commonSlice';
import {
  claimPromotion,
  fetchPromotions,
  fetchUserPromotionProgress,
} from '@/website/websiteAction';

export default function PromotionDetail(props) {
  const dispatch = useDispatch();
  const [isVisible, setIsVisible] = useState(false);
  const { t } = useTranslations();
  const isAuth = useSelector((state) => state.auth.isAuth);

  // Get promotion data from props
  const promotion = props?.promotion || {};

  useEffect(() => {
    const id = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const handleCloseModal = () => {
    dispatch(closeModal());
  };

  const descriptionHtml = promotion?.raw?.config?.description || '';
  const configEntries = Object.entries(promotion?.raw?.config || {}).filter(
    ([key]) => key !== 'description',
  );
  const totalCards = (configEntries?.length || 0) + 1; // include validity
  const gridColumns = Math.min(totalCards, 5);

  const computeCountdown = (dateOrMs) => {
    if (!dateOrMs) return null;
    const target =
      typeof dateOrMs === 'number' ? dateOrMs : new Date(dateOrMs).getTime();
    if (Number.isNaN(target)) return null;
    const now = Date.now();
    const diff = Math.max(target - now, 0);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    return { days, hours, minutes, seconds };
  };

  // Derive countdown/close-after-activation text similar to promotions page
  const config = promotion?.raw?.config || {};
  const expiryAfterHours = config.expiry_after_activation_hours;
  let countdown = null;

  if (expiryAfterHours && promotion?.userProgress?.activated_at) {
    const activatedAtMs = new Date(
      promotion.userProgress.activated_at,
    ).getTime();
    if (!Number.isNaN(activatedAtMs)) {
      const targetMs = activatedAtMs + expiryAfterHours * 60 * 60 * 1000;
      countdown = computeCountdown(targetMs);
    }
  }

  const handleClaim = async () => {
    const promoId = promotion?.raw?.id;
    const userProgress = promotion?.userProgress;

    if (!isAuth) {
      dispatch(openModal('login'));
      return;
    }
    if (!promoId) return;
    if (!promotion?.isActiveForUser || userProgress?.state !== 'completed') {
      toast.error(t('promotion_not_ready_for_redemption'));
      return;
    }
    try {
      await dispatch(claimPromotion({ promotionId: promoId })).unwrap();
      toast.success(t('success'));
      dispatch(fetchPromotions());
      dispatch(fetchUserPromotionProgress());
    } catch (err) {
      // errors handled by interceptor/toast elsewhere
    }
  };

  return (
    <div
      className={`promotion-detail-modal scrollbar-hide mx-auto flex h-[85vh] w-full max-w-[95vw] transform flex-col overflow-x-visible overflow-y-hidden rounded-[5px] bg-[#001724] p-3 text-white shadow-xl transition-all duration-300 ease-out sm:h-[80vh] sm:p-4 md:p-6 lg:p-8 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
      }`}
    >
      <div className="flex min-h-0 flex-1 flex-col space-y-3 sm:space-y-4 md:space-y-6">
        {/* Header Section */}
        <div className="relative rounded-[5px] border border-[#00374A] p-3 sm:p-4">
          {/* Close Button - Absolute positioned on mobile only, hidden on desktop */}
          <button
            onClick={handleCloseModal}
            aria-label={t('close')}
            className="group absolute top-3 right-3 flex h-[28px] w-[28px] flex-shrink-0 cursor-pointer items-center justify-center rounded-md bg-[#20C5FE] text-black transition-all duration-300 sm:hidden"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              className="h-3.5 w-3.5 transition-all duration-300 group-hover:rotate-180 sm:h-4 sm:w-4 md:h-5 md:w-5"
            >
              <path
                d="M6 6L18 18M18 6L6 18"
                stroke="#0B0B0B"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <div className="flex flex-col gap-3 pr-10 sm:flex-row sm:items-center sm:justify-between sm:pr-0">
            <div className="flex-1">
              <h2 className="text-base font-bold text-[#D9D9D9] sm:text-xl md:text-2xl lg:text-3xl">
                {promotion.title}
              </h2>
              <p className="mt-1 text-xs text-white sm:text-sm md:text-base">
                {promotion.endDate
                  ? `${t('promotions_end_date_label')}: ${promotion.endDate}`
                  : ''}
              </p>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-2">
              {/* Claim Offer Button */}
              <button
                type="button"
                onClick={handleClaim}
                disabled={
                  !promotion?.isActiveForUser ||
                  promotion?.userProgress?.state !== 'completed'
                }
                className="rounded-full bg-[#20C5FE] px-3 py-2 text-xs font-extrabold text-white transition-all duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:py-2.5 sm:text-sm md:px-6 md:py-3 md:text-base"
              >
                {t('promotions_claim_offer')}
              </button>

              {/* Close Button - Hidden on mobile, shown on larger screens */}
              <button
                onClick={handleCloseModal}
                aria-label={t('close')}
                className="group hidden h-[30px] w-[30px] flex-shrink-0 cursor-pointer items-center justify-center rounded-md bg-[#20C5FE] text-black transition-all duration-300 sm:flex md:h-[41px] md:w-[41px]"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  className="h-4 w-4 transition-all duration-300 group-hover:rotate-180 md:h-5 md:w-5"
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
          </div>
        </div>

        {/* Key Parameters and Timer Section - Flex Layout */}
        <div className="flex flex-col items-stretch justify-between gap-3 md:flex-row md:items-start">
          {/* Key Parameters Cards */}
          <div
            className="grid flex-1 gap-2 sm:gap-3"
            style={{
              gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))`,
            }}
          >
            {configEntries.length ? (
              configEntries.map(([key, value]) => (
                <div
                  key={key}
                  className="rounded-[5px] border border-[#00374A] bg-transparent p-2.5 text-center sm:p-3"
                >
                  <p className="text-[10px] text-[#FFFFFF66] sm:text-xs md:text-sm">
                    {key.replace(/_/g, ' ').toUpperCase()}
                  </p>
                  <p className="mt-1 text-xs font-bold text-[#20C5FE] sm:text-sm md:text-base">
                    {formatNumber(value) ?? '-'}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-[5px] border border-[#00374A] bg-transparent p-2.5 text-center sm:p-3">
                <p className="text-[10px] text-[#FFFFFF66] sm:text-xs md:text-sm">
                  {t('promotions_details_label')}
                </p>
                <p className="mt-1 text-xs font-bold text-[#20C5FE] sm:text-sm md:text-base">
                  -
                </p>
              </div>
            )}

            {/* Validity */}
            <div className="rounded-[5px] border border-[#00374A] bg-transparent p-2.5 text-center sm:p-3">
              <p className="text-[10px] text-[#FFFFFF66] sm:text-xs md:text-sm">
                {t('promotions_validity_label')}
              </p>
              <p className="mt-1 text-xs font-bold text-[#20C5FE] sm:text-sm md:text-base">
                {promotion.validity}
              </p>
            </div>
          </div>

          {/* Timer Section */}
          <div className="flex justify-center md:w-auto md:flex-shrink-0 md:justify-start">
            {countdown ? (
              <Timer
                days={countdown.days}
                hours={countdown.hours}
                minutes={countdown.minutes}
                seconds={countdown.seconds}
                label={t('promotions_ends_on')}
                showSeconds={true}
                inline={true}
              />
            ) : null}
          </div>
        </div>

        {/* Combined Content Container */}
        <div className="scrollbar-thin scrollbar-track-[#001724] scrollbar-thumb-[#20C5FE] scrollbar-track-rounded-full scrollbar-thumb-rounded-full min-h-0 flex-1 overflow-y-auto rounded-[5px] border border-[#00374A] bg-transparent p-3 pr-2 sm:p-4">
          {/* Terms & Conditions */}
          <div>
            <div
              className="prose prose-invert prose-headings:text-[#20C5FE] prose-headings:font-semibold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:text-sm prose-ol:list-decimal prose-ul:list-disc prose-li:text-white prose-li:marker:text-[#20C5FE] prose-a:text-[#20C5FE] prose-strong:font-semibold max-w-none text-[11px] leading-relaxed sm:text-xs md:text-sm"
              dangerouslySetInnerHTML={{ __html: descriptionHtml }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
