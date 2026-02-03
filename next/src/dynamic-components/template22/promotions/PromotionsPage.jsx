'use client';

import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import Timer from '@/dynamic-components/template22/components/Timer/Timer';
import UserPromotions from '@/dynamic-components/template22/components/UserPromotions/UserPromotions';
import { useTranslations } from '@/hooks/useTranslations';
import { openModal } from '@/slices/common/commonSlice';
import {
  activatePromotion,
  claimPromotion,
  fetchPromotions,
  fetchUserPromotionProgress,
} from '@/website/websiteAction';

export default function PromotionsPage({ embedded = false }) {
  const { t } = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const userPromotionsRef = useRef(null);
  const promotionsData =
    useSelector((state) => state.website.promotionsData) || [];
  const isAuth = useSelector((state) => state.auth.isAuth);
  const promotionProgressData =
    useSelector((state) => state.website.promotionProgressData) || [];

  const backgroundUrlDesktop =
    'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/promotion-top-banner-3.webp';
  const backgroundUrlMobile =
    'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/promotion-top-banner-mob-3.webp';

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

  const progressList = Array.isArray(promotionProgressData?.data)
    ? promotionProgressData.data
    : promotionProgressData || [];

  const promotions = useMemo(() => {
    const progressMap = new Map(
      progressList.map((pp) => [pp.promotion_id, pp]),
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
  }, [promotionsData, progressList]);

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

  const handleBack = () => {
    if (embedded) return;
    router.push('/dashboard/home');
  };

  // Show back button only when route is /dashboard/promotions
  const showBackButton = !embedded && pathname === '/dashboard/promotions';

  const content = (
    <>
      {/* (Header with title removed as requested) */}

      {/* Promotions Banner Section */}
      <section
        className={`w-full pt-4 md:pt-10 ${
          embedded ? '' : 'bg-[#1E1E1E]'
        }`}
      >
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 md:flex-row md:px-6">
          {/* Left Text */}
          <div className="text-center md:text-left">
            <h2 className="text-xl font-[var(--font-urbanist)] font-normal text-white italic md:text-2xl lg:text-3xl">
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
            className="group flex cursor-pointer items-center justify-center rounded-[10px] bg-[linear-gradient(#f17a77,#ee5f5b_60%,#ec4d49)] px-6 pt-2 pb-3 text-base font-semibold text-white shadow-none transition-all duration-200 hover:opacity-90 md:px-8"
          >
            {t('promotions_my_promotions')}
          </button>
        </div>
      </section>

      {/* Promotional Cards Section */}
      <section
        className={`w-full py-6 md:py-8 ${
          embedded ? '' : 'bg-[#1E1E1E]'
        }`}
      >
        <div className="container mx-auto space-y-6 px-4 md:px-6">
          {promotions && promotions.length === 0 ? (
            <div className="flex items-center justify-center py-12 md:py-16">
              <p className="text-center text-lg font-semibold text-white md:text-xl lg:text-2xl">
                {t('promotions_no_promotions_available')}
              </p>
            </div>
          ) : (
            (promotions || []).map((promo) => (
              <div
                key={promo.id}
                className={`overflow-hidden rounded-[10px] border border-[rgba(0,0,0,0.6)] ${
                  embedded ? 'bg-transparent' : 'bg-[#1E1E1E]'
                }`}
              >
                {/* Desktop Layout */}
                {promo.layout === 'banner-left' ? (
                  // Banner Left, Timer Right
                  <div className="hidden gap-6 p-6 md:grid md:grid-cols-[3fr_1fr]">
                    {/* Left - Banner Image */}
                    <div className="relative flex items-center justify-center">
                      <Image
                        src={promo.bannerDesktop}
                        alt={promo.title}
                        width={940}
                        height={380}
                        className="h-auto w-full object-contain"
                      />
                    </div>

                    {/* Right - Details Section */}
                    <div className="flex flex-col justify-between rounded-[10px] bg-[#141414] p-6">
                      {/* Top Content */}
                      <div className="space-y-4">
                        <h3 className="text-xl font-bold text-white italic lg:text-[25px]">
                          {promo.title}
                        </h3>
                        <p className="text-sm text-white">
                          {promo.endDate
                            ? `${t('promotions_end_date_label')}: ${promo.endDate}`
                            : ''}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleOpenPromotionDetail(promo)}
                          className="text-left text-sm font-semibold text-[#E8D25E] underline transition-colors hover:text-[#d3af37]"
                        >
                          {t('promotions_see_details')}
                        </button>

                        {/* Countdown Timer */}
                        {promo.countdown ? (
                          <div className="mt-6">
                            <Timer
                              days={promo.countdown.days}
                              hours={promo.countdown.hours}
                              minutes={promo.countdown.minutes}
                              seconds={promo.countdown.seconds}
                              label={t('promotions_ends_on')}
                            />
                          </div>
                        ) : null}
                        {/* No close-after-activation text; countdown only when configured */}
                      </div>

                      {/* Bottom Buttons */}
                      <div className="mt-6 flex gap-3">
                        {!promo.isActiveForUser && (
                          <button
                            type="button"
                            onClick={() => handleActivate(promo.raw)}
                            className="flex-1 rounded-[10px] bg-[linear-gradient(#74cae3,#5bc0de_60%,#4ab9db)] px-4 py-2.5 text-sm font-semibold text-white shadow-none transition-all hover:opacity-90"
                          >
                            {t('promotions_activate')}
                          </button>
                        )}
                        <button
                          type="button"
                          disabled={!promo.isActiveForUser}
                          onClick={() => handleClaim(promo.raw)}
                          className="flex-1 rounded-[10px] bg-[linear-gradient(#f17a77,#ee5f5b_60%,#ec4d49)] px-4 pt-2 pb-3 text-base font-semibold text-white shadow-none transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 hover:opacity-90"
                        >
                          {t('promotions_claim')}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Timer Left, Banner Right
                  <div className="hidden gap-6 p-6 md:grid md:grid-cols-[1fr_3fr]">
                    {/* Left - Details Section */}
                    <div className="flex flex-col justify-between rounded-[10px] bg-[#141414] p-6">
                      {/* Top Content */}
                      <div className="space-y-4">
                        <h3 className="text-xl font-bold text-white italic lg:text-[25px]">
                          {promo.title}
                        </h3>
                        <p className="text-sm text-white">
                          {promo.endDate
                            ? `${t('promotions_end_date_label')}: ${promo.endDate}`
                            : ''}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleOpenPromotionDetail(promo)}
                          className="text-left text-sm font-semibold text-[#E8D25E] underline transition-colors hover:text-[#d3af37]"
                        >
                          {t('promotions_see_details')}
                        </button>

                        {/* Countdown Timer */}
                        {promo.countdown ? (
                          <div className="mt-6">
                            <Timer
                              days={promo.countdown.days}
                              hours={promo.countdown.hours}
                              minutes={promo.countdown.minutes}
                              seconds={promo.countdown.seconds}
                              label={t('promotions_ends_on')}
                            />
                          </div>
                        ) : null}
                      </div>

                      {/* Bottom Buttons */}
                      <div className="mt-6 flex gap-3">
                        {!promo.isActiveForUser && (
                          <button
                            type="button"
                            onClick={() => handleActivate(promo.raw)}
                            className="flex-1 rounded-[5px] bg-[linear-gradient(#74cae3,#5bc0de_60%,#4ab9db)] px-4 py-2.5 text-sm font-semibold text-white shadow-none transition-all hover:opacity-90"
                          >
                            {t('promotions_activate')}
                          </button>
                        )}
                        <button
                          type="button"
                          disabled={!promo.isActiveForUser}
                          onClick={() => handleClaim(promo.raw)}
                          className="flex-1 rounded-[10px] bg-[linear-gradient(#f17a77,#ee5f5b_60%,#ec4d49)] px-4 pt-2 pb-3 text-base font-semibold text-white shadow-none transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 hover:opacity-90"
                        >
                          {t('promotions_claim')}
                        </button>
                      </div>
                    </div>

                    {/* Right - Banner Image */}
                    <div className="relative flex items-center justify-center">
                      <Image
                        src={promo.bannerDesktop}
                        alt={promo.title}
                        width={940}
                        height={380}
                        className="h-auto w-full object-contain"
                      />
                    </div>
                  </div>
                )}

                {/* Mobile Layout */}
                <div className="md:hidden">
                  {/* Banner Image */}
                  <div className="relative flex items-center justify-center p-4">
                    <Image
                      src={promo.bannerMobile}
                      alt={promo.title}
                      width={375}
                      height={500}
                      className="h-auto w-full object-contain"
                    />
                  </div>

                  {/* Details Section */}
                  <div className="rounded-[10px] bg-[#141414] p-4">
                    <div className="space-y-3">
                      <h3 className="text-xl font-bold text-white italic">
                        {promo.title}
                      </h3>
                      <p className="text-sm text-white">
                        {promo.endDate
                          ? `${t('promotions_end_date_label')}: ${promo.endDate}`
                          : ''}
                      </p>

                      {/* Buttons */}
                      <div className="flex gap-3">
                        {!promo.isActiveForUser && (
                          <button
                            type="button"
                            onClick={() => handleActivate(promo.raw)}
                            className="flex-1 rounded-[5px] bg-[linear-gradient(#74cae3,#5bc0de_60%,#4ab9db)] px-4 py-2.5 text-sm font-semibold text-white shadow-none transition-all hover:opacity-90"
                          >
                            {t('promotions_activate')}
                          </button>
                        )}
                        <button
                          type="button"
                          disabled={!promo.isActiveForUser}
                          onClick={() => handleClaim(promo.raw)}
                          className="flex-1 rounded-[10px] bg-[linear-gradient(#f17a77,#ee5f5b_60%,#ec4d49)] px-4 pt-2 pb-3 text-base font-semibold text-white shadow-none transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 hover:opacity-90"
                        >
                          {t('promotions_claim')}
                        </button>
                      </div>
                    </div>
                  </div>
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
    </>
  );

  // Use global page background only for standalone page, not embedded tab view.
  // When embedded, content is already inside the same bordered area as other tabs (DashboardTabs).
  if (embedded) {
    return content;
  }

  // Standalone promotions page: use same border as dashboard/home tab content area.
  return (
    <div className="min-h-screen bg-[#272b30]">
      <div className="rounded-[5px] border border-[#2A2A2A] overflow-hidden">
        {content}
      </div>
    </div>
  );
}
