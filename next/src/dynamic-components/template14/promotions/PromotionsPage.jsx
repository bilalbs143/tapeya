'use client';

import Image from 'next/image';
import React, { useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import Timer from '@/dynamic-components/template14/components/Timer/Timer';
import UserPromotions from '@/dynamic-components/template14/components/UserPromotions/UserPromotions';
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
      {/* Slot Providers Hero Banner */}
      <section
        className="relative mx-auto w-full overflow-hidden"
        aria-label={t('live_casino_banner')}
      >
        <div
          className="relative w-full overflow-hidden"
          style={{ minHeight: '200px' }}
        >
          {/* Desktop Banner - Hidden on mobile (<=768px) */}
          <div className="relative hidden w-full md:block">
            <Image
              src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/promotion-top-banner-7.webp"
              alt={t('live_casino_background_alt')}
              width={1920}
              height={600}
              className="w-full rounded-[5px] object-cover"
              style={{ height: 'auto', display: 'block' }}
              priority
            />
          </div>

          {/* Mobile Banner - Only visible on mobile (<=768px) */}
          <div className="relative block w-full md:hidden">
            <Image
              src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/promotion-top-banner-mob-7.webp"
              alt={t('live_casino_mobile_background_alt')}
              width={1920}
              height={600}
              className="w-full rounded-[5px] object-cover"
              style={{ height: 'auto', display: 'block' }}
              priority
            />
          </div>

          {/* Content Overlay */}
          <div className="absolute inset-0 z-10 mt-0 flex items-start justify-center pt-8 pl-8 sm:pt-6 sm:pl-6 md:mt-6 md:items-center md:pt-0 md:pl-12 lg:pl-16 xl:pl-20">
            <div className="w-auto max-w-[calc(100%-2rem)] sm:max-w-[calc(100%-3rem)] md:max-w-none">
              <div className="flex flex-col items-start gap-2 sm:gap-3 md:gap-3">
                {/* Promotions Badge */}
                <div
                  className="rounded px-3 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 lg:px-4 lg:py-2"
                  style={{
                    border: '1px solid rgba(51, 19, 105, 0.70)',
                    backgroundColor: 'rgba(24, 14, 58, 0.5)',
                  }}
                >
                  <span className="inline-block text-[12px] font-bold whitespace-nowrap text-white uppercase sm:text-[12px] md:text-[12px] lg:text-[14px] xl:text-[16px]">
                    {t('promotions_badge')}
                  </span>
                </div>

                {/* PROMOTIONS AND OFFERS */}
                <h2
                  className="font-bring-race text-left text-[18px] leading-tight break-words text-white sm:text-[18px] md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl"
                  style={{ letterSpacing: '1px' }}
                >
                  {t('promotions_and_offers_line1')}
                  <br />
                  {t('promotions_and_offers_line2')}
                </h2>

                {/* Get the exclusive promotions and offers */}
                <p className="text-left text-[12px] text-white sm:text-xs md:text-sm lg:text-base">
                  {t('get_exclusive_promotions_offers')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Promotions Banner Section */}
      <section className="w-full pt-4 md:pt-10">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 md:flex-row md:px-6">
          {/* Left Text */}
          <div className="text-center md:text-left">
            <h2 className="font-bring-race text-xl font-normal text-white italic md:text-2xl lg:text-3xl">
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
            className="template14-menu-item-angled template14-menu-item-angled-active"
            style={{ marginBottom: 0 }}
          >
            <div className="template14-menu-item-angled-inner !px-10 !py-2 !text-[14px]">
              <div className="template14-menu-item-content">
                <span className="font-medium text-white">
                  {t('promotions_my_promotions')}
                </span>
              </div>
            </div>
          </button>
        </div>
      </section>

      {/* Promotional Cards Section */}
      <section className="w-full py-6 md:py-8">
        <div className="space-y-6">
          {promotions && promotions.length === 0 ? (
            <div className="flex items-center justify-center py-12 md:py-16">
              <p className="text-center text-lg font-semibold text-[#7351FF] md:text-xl lg:text-2xl">
                {t('promotions_no_promotions_available')}
              </p>
            </div>
          ) : (
            (promotions || []).map((promo) => {
              const countdown = promo.countdown
                ? [
                  { label: 'DAYS', value: promo.countdown.days },
                  { label: 'HOURS', value: promo.countdown.hours },
                  { label: 'MINS', value: promo.countdown.minutes },
                ]
                : [];

              return (
                <div
                  key={promo.id}
                  className={`grid gap-3 rounded-[12px] ${
                    promo.layout === 'banner-left'
                      ? 'md:grid-cols-[3fr_1fr]'
                      : 'md:grid-cols-[1fr_3fr]'
                  }`}
                >
                  {/* Banner - Left or Right based on layout */}
                  {promo.layout === 'banner-left' ? (
                    <div className="relative overflow-hidden rounded-[7px] border-2 border-[#661BB5]">
                      <Image
                        src={promo.bannerDesktop}
                        alt={promo.title}
                        width={1200}
                        height={500}
                        className="hidden h-full w-full object-cover md:block"
                      />
                      <Image
                        src={promo.bannerMobile}
                        alt={promo.title}
                        width={600}
                        height={500}
                        className="block h-full w-full object-cover md:hidden"
                      />
                    </div>
                  ) : null}

                  {/* Content */}
                  <div
                    className="flex h-full rounded-[5px] border border-[#EE7AF4] p-3 md:p-3"
                    style={{
                      background:
                        'linear-gradient(114deg, rgba(102, 27, 181, 0.09) 5.98%, rgba(199, 46, 239, 0.09) 45.86%, rgba(100, 26, 185, 0.09) 83.35%)',
                    }}
                  >
                    <div className="flex h-full w-full flex-col gap-4 rounded-[8px] border border-[#7351FF] p-4 md:p-6">
                      <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-white md:text-[26px]">
                          {promo.title}
                        </h3>
                        <p className="text-sm font-semibold text-[#B55DBA] md:text-base">
                          {promo.endDate
                            ? `${t('promotions_end_date_label')}: ${promo.endDate}`
                            : ''}
                        </p>
                      </div>

                      {/* Countdown */}
                      {countdown.length > 0 && (
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
                            {countdown.map((item, index) => {
                              const value = item.value
                                .toString()
                                .padStart(2, '0');
                              return (
                                <React.Fragment key={item.label}>
                                  <div className="flex flex-col items-center gap-1">
                                    <div className="flex items-center gap-1">
                                      {value.split('').map((digit, idx) => (
                                        <span
                                          key={`${item.label}-${idx}`}
                                          className="flex h-[28px] w-[28px] items-center justify-center rounded-[2px] text-base font-bold text-white"
                                          style={{
                                            border:
                                              '1px solid rgba(255, 255, 255, 0.15)',
                                            background:
                                              'rgba(115, 81, 255, 0.30)',
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
                                  {index < countdown.length - 1 && (
                                    <span className="pb-4 text-xl font-bold text-white">
                                      :
                                    </span>
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div className="mt-auto flex flex-col gap-3 sm:flex-row">
                        <button
                          type="button"
                          onClick={() => handleOpenPromotionDetail(promo)}
                          className="angled-button angled-button-pink h-[50px] w-full sm:flex-1"
                        >
                          <div className="angled-button-inner">
                            <span className="angled-button-text px-5">
                              {t('promotions_see_details')}
                            </span>
                          </div>
                        </button>
                        {!promo.isActiveForUser ? (
                          <button
                            type="button"
                            onClick={() => handleActivate(promo.raw)}
                            className="angled-button angled-button-blue h-[50px] w-full sm:flex-1"
                          >
                            <div className="angled-button-inner">
                              <span className="angled-button-text px-5">
                                {t('promotions_activate')}
                              </span>
                            </div>
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={!promo.isActiveForUser}
                            onClick={() => handleClaim(promo.raw)}
                            className="angled-button angled-button-blue h-[50px] w-full disabled:cursor-not-allowed disabled:opacity-50 sm:flex-1"
                          >
                            <div className="angled-button-inner">
                              <span className="angled-button-text px-5">
                                {t('promotions_claim')}
                              </span>
                            </div>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Banner - Right when layout is timer-left */}
                  {promo.layout === 'timer-left' ? (
                    <div className="relative overflow-hidden rounded-[7px] border-2 border-[#661BB5]">
                      <Image
                        src={promo.bannerDesktop}
                        alt={promo.title}
                        width={1200}
                        height={500}
                        className="hidden h-full w-full object-cover md:block"
                      />
                      <Image
                        src={promo.bannerMobile}
                        alt={promo.title}
                        width={600}
                        height={500}
                        className="block h-full w-full object-cover md:hidden"
                      />
                    </div>
                  ) : null}
                </div>
              );
            })
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
