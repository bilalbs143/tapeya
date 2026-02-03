'use client';

import Image from 'next/image';
import React, { useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import Timer from '@/dynamic-components/template13/components/Timer/Timer';
import UserPromotions from '@/dynamic-components/template13/components/UserPromotions/UserPromotions';
import { useTranslations } from '@/hooks/useTranslations';
import { openModal } from '@/slices/common/commonSlice';
import {
  activatePromotion,
  claimPromotion,
  fetchPromotions,
  fetchUserPromotionProgress,
} from '@/website/websiteAction';

export default function PromotionsPage() {
  const { t } = useTranslations();
  const dispatch = useDispatch();
  const userPromotionsRef = useRef(null);
  const promotionsData =
    useSelector((state) => state.website.promotionsData) || [];
  const isAuth = useSelector((state) => state.auth.isAuth);
  const promotionProgress =
    useSelector((state) => state.website.promotionProgressData) || [];

  const backgroundUrlDesktop =
    'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/promotion-top-banner-5.webp';
  const backgroundUrlMobile =
    'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/promotion-top-banner-mob-5.webp';

  const fallbackBannerDesktop =
    'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/promotion-banner-1-3.webp';
  const fallbackBannerMobile =
    'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/promotion-banner-1-mob-3.webp';

  const formatDate = (date) => {
    if (!date) return '';
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return '';
    // Use en-GB to match dd/mm/yyyy (e.g., 31/12/2025)
    return parsed.toLocaleDateString('en-GB');
  };

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

  const mapPromotion = (promo, index, progressMap) => {
    const config = promo?.config || {};
    const layout = index % 2 === 0 ? 'banner-left' : 'timer-left';
    const expiryAfterHours = config.expiry_after_activation_hours;
    const userProgress = progressMap?.get(promo.id);
    let countdown = null;

    if (expiryAfterHours && userProgress?.activated_at) {
      const activatedAtMs = new Date(userProgress.activated_at).getTime();
      if (!Number.isNaN(activatedAtMs)) {
        const targetMs = activatedAtMs + expiryAfterHours * 60 * 60 * 1000;
        countdown = computeCountdown(targetMs);
      }
    }

    return {
      id: promo.id,
      title: promo.name,
      endDate: formatDate(promo.valid_to),
      validTo: promo.valid_to,
      countdown,
      bannerDesktop: promo.image || fallbackBannerDesktop,
      bannerMobile: promo.image || fallbackBannerMobile,
      layout,
      validity: promo.status === 'active' ? 'ACTIVE' : promo.status,
      bonusType: promo.type_enum || promo.type,
      terms: config.description ? [config.description] : [],
      raw: promo,
    };
  };

  useEffect(() => {
    dispatch(fetchPromotions());
  }, [dispatch]);

  useEffect(() => {
    if (isAuth) {
      dispatch(fetchUserPromotionProgress());
    }
  }, [dispatch, isAuth]);

  const promotions = useMemo(() => {
    const progressMap = new Map(
      promotionProgress.map((pp) => [pp.promotion_id, pp]),
    );
    return promotionsData.map((p, idx) => {
      const prog = progressMap.get(p.id);
      const mapped = mapPromotion(p, idx, progressMap);
      return {
        ...mapped,
        isActiveForUser: !!prog,
        userProgress: prog,
      };
    });
  }, [promotionsData, promotionProgress]);

  const handleActivate = (promo) => {
    if (!isAuth) {
      dispatch(openModal('login'));
      return;
    }
    if (!promo?.id) return;
    dispatch(activatePromotion({ promotionId: promo.id })).then((res) => {
      if (res?.meta?.requestStatus === 'fulfilled') {
        toast.success(t('success'));
        dispatch(fetchPromotions());
        dispatch(fetchUserPromotionProgress());
      }
    });
  };

  const handleClaim = (promo) => {
    if (!isAuth) {
      dispatch(openModal('login'));
      return;
    }
    if (!promo?.id) return;
    dispatch(claimPromotion({ promotionId: promo.id })).then((res) => {
      if (res?.meta?.requestStatus === 'fulfilled') {
        toast.success(t('success'));
        dispatch(fetchPromotions());
        dispatch(fetchUserPromotionProgress());
      }
    });
  };

  const handleOpenPromotionDetail = (promotion) => {
    dispatch(
      openModal({
        modal: 'promotionDetail',
        props: { promotion },
      }),
    );
  };

  return (
    <div>
      {/* Hero Banner Section */}
      <section
        className="relative w-full overflow-hidden"
        aria-label={t('hero_section')}
      >
        {/* Desktop Image */}
        <Image
          src={backgroundUrlDesktop}
          alt={t('hero_section')}
          width={1920}
          height={650}
          className="hidden h-auto w-full object-cover md:block"
          priority
        />
        {/* Mobile Image */}
        <Image
          src={backgroundUrlMobile}
          alt={t('hero_section')}
          width={768}
          height={650}
          className="block h-auto w-full object-cover md:hidden"
          priority
        />

        {/* Content Overlay */}
        <div className="absolute inset-0 z-10 container mx-auto flex h-full w-full items-start justify-center py-6 sm:py-8 md:items-center md:justify-start lg:py-10">
          <div className="w-full px-4 md:px-6">
            {/* Headline (center on mobile, left on desktop) */}
            <div className="text-center md:text-left">
              <h1
                className="!text-[24px] leading-tight font-semibold tracking-wide text-[#D9D9D9] uppercase lg:!text-[40px]"
                style={{
                  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
                }}
              >
                {t('promotions_hero_title')}
              </h1>
              <p className="mt-2 text-sm font-normal text-gray-400 md:text-base">
                {t('get_exclusive_promotions_offers')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Promotions Banner Section */}
      <section className="w-full pt-4 md:pt-10">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 md:flex-row md:px-6">
          {/* Left Text */}
          <div className="text-center md:text-left">
            <h2 className="text-xl font-normal text-white md:text-2xl lg:text-3xl">
              {t('promotions_new_discounts_title')}
            </h2>
          </div>

          {/* Right Button */}
          <button
            type="button"
            onClick={() => {
              userPromotionsRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
              });
            }}
            className="rounded-[5px] border bg-[#20C5FE] px-6 py-2 text-base font-semibold text-white transition-all duration-200 hover:bg-[#1da8d4] md:px-8"
            style={{ borderColor: '#00374A' }}
          >
            {t('promotions_my_promotions')}
          </button>
        </div>
      </section>

      {/* Promotional Cards Section */}
      <section className="w-full bg-transparent py-6 md:py-8">
        <div className="container mx-auto space-y-6">
          {promotions && promotions.length === 0 ? (
            <div className="flex items-center justify-center py-12 md:py-16">
              <p className="text-center text-lg font-semibold text-[#20C5FE] md:text-xl lg:text-2xl">
                {t('promotions_no_promotions_available')}
              </p>
            </div>
          ) : (
            (promotions || []).map((promo) => (
              <div key={promo.id} className="overflow-hidden rounded-[10px]">
                {/* Header Section */}
                <div
                  className="p-4 md:p-6"
                  style={{
                    borderRadius: '10px 10px 0 0',
                    borderTop: '1px solid rgba(32, 197, 254, 0.50)',
                    borderRight: '1px solid rgba(32, 197, 254, 0.50)',
                    borderLeft: '1px solid rgba(32, 197, 254, 0.50)',
                    background: '#102534',
                  }}
                >
                  <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {/* Left Side - Title and End Date */}
                    <div className="text-center md:text-left">
                      <h3 className="text-lg font-bold tracking-wider text-white uppercase md:text-xl lg:text-2xl">
                        {t('promotions_new_discounts_title')}
                      </h3>
                      <p className="mt-1 text-sm font-semibold text-[#20C5FE] md:text-base">
                        {promo.endDate
                          ? `${t('promotions_end_date_label')}: ${promo.endDate}`
                          : ''}
                      </p>
                    </div>

                    {/* Center - Timer Component (Hidden on mobile, shown on lg screens) */}
                    <div className="hidden justify-center lg:flex">
                      {promo.countdown ? (
                        <Timer
                          days={promo.countdown.days}
                          hours={promo.countdown.hours}
                          minutes={promo.countdown.minutes}
                          seconds={promo.countdown.seconds}
                          label={t('promotions_ends_on')}
                          showSeconds={true}
                          inline={true}
                        />
                      ) : null}
                    </div>

                    {/* Right Side - Buttons */}
                    <div className="flex items-center justify-center gap-3 md:justify-end md:gap-4">
                      <button
                        type="button"
                        onClick={() => handleOpenPromotionDetail(promo)}
                        className="text-sm font-semibold text-white transition-colors hover:text-[#00D4FF] md:text-base"
                      >
                        {t('promotions_see_details')}
                      </button>
                      {!promo.isActiveForUser ? (
                        <button
                          type="button"
                          onClick={() => handleActivate(promo.raw)}
                          className="rounded-full bg-[#20C5FE] px-6 py-2 text-sm font-bold text-white transition-all duration-200 hover:bg-[#00B8E6] md:px-8 md:py-2.5 md:text-base"
                        >
                          {t('promotions_activate')}
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={!promo.isActiveForUser}
                          onClick={() => handleClaim(promo.raw)}
                          className="rounded-full bg-[#20C5FE] px-6 py-2 text-sm font-bold text-white transition-all duration-200 hover:bg-[#00B8E6] disabled:cursor-not-allowed disabled:opacity-50 md:px-8 md:py-2.5 md:text-base"
                        >
                          {t('promotions_claim')}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Banner Image */}
                <div className="relative w-full">
                  {/* Desktop Image */}
                  <Image
                    src={promo.bannerDesktop}
                    alt={promo.title}
                    width={1200}
                    height={500}
                    className="hidden h-auto w-full object-cover md:block"
                  />
                  {/* Mobile Image */}
                  <Image
                    src={promo.bannerMobile}
                    alt={promo.title}
                    width={600}
                    height={400}
                    className="block h-auto w-full object-cover md:hidden"
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* User Promotions Component */}
      <div ref={userPromotionsRef}>
        <UserPromotions />
      </div>
    </div>
  );
}
