'use client';

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import Timer from '@/dynamic-components/template22/components/Timer/Timer';
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

  const formatLabel = (label) => label.replace(/_/g, ' ').toUpperCase();

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
      className={`promotion-detail-modal scrollbar-hide mx-auto flex h-[80vh] w-full transform flex-col overflow-x-visible overflow-y-hidden rounded-[10px] border border-[#E8D25E] bg-black p-4 text-white shadow-xl transition-all duration-300 ease-out sm:p-6 lg:p-8 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
      }`}
    >
      <div className="flex min-h-0 flex-1 flex-col space-y-4 sm:space-y-6">
        {/* Header Section */}
        <div className="rounded-[5px] border border-[#E8D25E] bg-[#000] p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-[#E8D25E] sm:text-2xl lg:text-3xl">
                {promotion.title}
              </h2>
              <p className="mt-1 text-sm text-white sm:text-base">
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
                className="rounded-[10px] px-4 pt-2 pb-3 text-sm font-semibold text-white transition-all duration-200 sm:px-6 sm:text-base"
                style={{
                  backgroundImage: 'linear-gradient(#74cae3, #5bc0de 60%, #4ab9db)',
                }}
              >
                {t('promotions_claim_offer')}
              </button>

              {/* Close Button */}
              <button
                onClick={handleCloseModal}
                aria-label={t('close')}
                className="group flex h-8 w-8 flex-shrink-0 cursor-pointer items-center justify-center rounded-sm text-xl leading-none font-bold text-white transition-all duration-300 sm:h-10 sm:w-10"
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
          </div>
        </div>

        {/* Key Parameters - Flex Layout */}
        <div className="flex flex-col items-stretch justify-between gap-3 md:flex-row md:items-start">
          {/* Key Parameters Cards */}
          <div
            className="grid flex-1 gap-3"
            style={{
              gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))`,
            }}
          >
            {configEntries.length ? (
              configEntries.map(([key, value]) => (
                <div
                  key={key}
                  className="rounded-[5px] border border-[#E8D25E] bg-black p-3 text-center"
                >
                  <p className="text-xs text-white/70 sm:text-sm">
                    {formatLabel(key)}
                  </p>
                  <p className="mt-1 text-sm font-bold text-[#E8D25E] sm:text-base">
                    {formatNumber(value) ?? '-'}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-[5px] border border-[#E8D25E] bg-black p-3 text-center">
                <p className="text-xs text-white/70 sm:text-sm">
                  {t('promotions_details_label')}
                </p>
                <p className="mt-1 text-sm font-bold text-[#E8D25E] sm:text-base">
                  -
                </p>
              </div>
            )}

            {/* Validity */}
            <div className="rounded-[5px] border border-[#E8D25E] bg-black p-3 text-center">
              <p className="text-xs text-white/70 sm:text-sm">
                {t('promotions_validity_label')}
              </p>
              <p className="mt-1 text-sm font-bold text-[#E8D25E] sm:text-base">
                {promotion.validity}
              </p>
            </div>
          </div>
        </div>

        {/* Timer Section */}
        <div className="md:w-auto md:flex-shrink-0">
          {countdown ? (
            <Timer
              days={countdown.days}
              hours={countdown.hours}
              minutes={countdown.minutes}
              seconds={countdown.seconds}
              label=""
              showSeconds={false}
            />
          ) : null}
        </div>

        {/* Combined Content Container */}
        <div className="scrollbar-thin scrollbar-track-[#000000] scrollbar-thumb-[#E8D25E] scrollbar-track-rounded-full scrollbar-thumb-rounded-full min-h-0 flex-1 overflow-y-auto rounded-[9px] bg-[#1C1C1C] p-4 pr-2">
          {/* Terms & Conditions */}
          <div>
            <div
              className="prose prose-invert prose-headings:text-[#E8D25E] prose-headings:font-semibold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:text-sm prose-ol:list-decimal prose-ul:list-disc prose-li:text-white prose-li:marker:text-[#E8D25E] prose-a:text-[#E8D25E] prose-strong:font-semibold max-w-none text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: descriptionHtml }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
