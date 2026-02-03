'use client';

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

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

  // Template14 styling - using purple/blue theme colors
  return (
    <div
      className={`promotion-detail-modal scrollbar-hide mx-auto flex h-[80vh] w-full transform flex-col overflow-x-visible overflow-y-hidden rounded-[5px] border-2 border-[#7351FF] bg-[#1E1451] p-4 text-white shadow-xl transition-all duration-300 ease-out sm:p-6 lg:p-8 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
      }`}
    >
      <div className="flex min-h-0 flex-1 flex-col space-y-4 sm:space-y-6">
        {/* Header Section */}
        <div className="rounded-[5px] border border-[#7351FF] bg-[#1E1451] p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-[#EE7AF4] sm:text-2xl lg:text-3xl">
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
                className="angled-button angled-button-pink h-[50px] w-[130px] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <div className="angled-button-inner">
                  <span className="angled-button-text px-5 whitespace-nowrap">
                    {t('promotions_claim_offer')}
                  </span>
                </div>
              </button>

              {/* Close Button */}
              <button
                onClick={handleCloseModal}
                aria-label={t('close')}
                className="group flex h-8 w-8 flex-shrink-0 cursor-pointer items-center justify-center rounded-sm border border-[rgba(115,81,255,0.30)] bg-[#1E1451] text-xl leading-none font-bold transition-all duration-300 sm:h-10 sm:w-10"
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
                    stroke="#EE7AF4"
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
            className="grid flex-1 gap-3"
            style={{
              gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))`,
            }}
          >
            {configEntries.length ? (
              configEntries.map(([key, value]) => (
                <div
                  key={key}
                  className="rounded-[5px] border border-[#7351FF] bg-[#1E1451] p-3 text-center"
                >
                  <p className="text-xs text-white/70 sm:text-sm">
                    {key.replace(/_/g, ' ').toUpperCase()}
                  </p>
                  <p className="mt-1 text-sm font-bold text-[#EE7AF4] sm:text-base">
                    {formatNumber(value) ?? '-'}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-[5px] border border-[#7351FF] bg-[#1E1451] p-3 text-center">
                <p className="text-xs text-white/70 sm:text-sm">
                  {t('promotions_details_label')}
                </p>
                <p className="mt-1 text-sm font-bold text-[#EE7AF4] sm:text-base">
                  -
                </p>
              </div>
            )}

            {/* Validity */}
            <div className="rounded-[5px] border border-[#7351FF] bg-[#1E1451] p-3 text-center">
              <p className="text-xs text-white/70 sm:text-sm">
                {t('promotions_validity_label')}
              </p>
              <p className="mt-1 text-sm font-bold text-[#EE7AF4] sm:text-base">
                {promotion.validity}
              </p>
            </div>
          </div>

          {/* Timer Section */}
          <div className="md:w-auto md:flex-shrink-0">
            {countdown ? (
              <div
                className="flex items-center overflow-hidden rounded-[5px] border border-[#7351FF]"
                style={{ background: '#0D1028' }}
              >
                {/* ENDS ON label */}
                <div className="flex items-center justify-center bg-[#7351FF] px-4 py-3 md:px-5 md:py-4">
                  <span className="text-xs font-bold text-white md:text-sm">
                    {t('promotions_ends_on')
                      .split(' ')
                      .map((word, idx, arr) => (
                        <React.Fragment key={idx}>
                          {word}
                          {idx < arr.length - 1 && <br />}
                        </React.Fragment>
                      ))}
                  </span>
                </div>

                {/* Timer sections */}
                <div className="flex flex-1 items-center justify-around gap-1 px-2 py-2 md:gap-2 md:px-3 md:py-3">
                  {[
                    { label: 'DAYS', value: countdown.days },
                    { label: 'HOURS', value: countdown.hours },
                    { label: 'MINS', value: countdown.minutes },
                  ].map((item, index) => {
                    const value = item.value.toString().padStart(2, '0');
                    return (
                      <React.Fragment key={item.label}>
                        <div className="flex flex-col items-center gap-1">
                          <div className="flex items-center gap-1">
                            {value.split('').map((digit, idx) => (
                              <span
                                key={`${item.label}-${idx}`}
                                className="flex h-[28px] w-[28px] items-center justify-center rounded-[2px] text-base font-bold text-white"
                                style={{
                                  border: '1px solid rgba(255, 255, 255, 0.15)',
                                  background: 'rgba(115, 81, 255, 0.30)',
                                }}
                              >
                                {digit}
                              </span>
                            ))}
                          </div>
                          <span className="text-[10px] font-semibold text-white md:text-xs">
                            {item.label}
                          </span>
                        </div>
                        {index < 2 && (
                          <span className="pb-4 text-xl font-bold text-white">
                            :
                          </span>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Combined Content Container */}
        <div className="scrollbar-thin scrollbar-track-[#1E1451] scrollbar-thumb-[#EE7AF4] scrollbar-track-rounded-full scrollbar-thumb-rounded-full min-h-0 flex-1 overflow-y-auto rounded-[5px] border border-[#7351FF] bg-[#1E1451] p-4 pr-2">
          {/* Terms & Conditions */}
          <div>
            <div
              className="prose prose-invert prose-headings:text-[#EE7AF4] prose-headings:font-semibold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:text-sm prose-ol:list-decimal prose-ul:list-disc prose-li:text-white prose-li:marker:text-[#EE7AF4] prose-a:text-[#EE7AF4] prose-strong:font-semibold max-w-none text-xs leading-relaxed sm:text-sm"
              dangerouslySetInnerHTML={{ __html: descriptionHtml }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
