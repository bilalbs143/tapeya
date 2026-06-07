/**
 * Pricing
 *
 * Pricing plans list and CTA. Exports PRICING_PLANS for PricingDetail.
 * Route: /pricing
 *
 * Coding guidelines: docs/Coding guidelines.md
 */
/* eslint-disable react-refresh/only-export-components */
import { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';

const eliteRankingIcon = `${CLOUDFRONT_APP_BASE}/images/icons/elite-ranking-icon.svg`;
const goldRankingIcon = `${CLOUDFRONT_APP_BASE}/images/icons/gold-ranking-icon.svg`;
const pricingListTickIcon = `${CLOUDFRONT_APP_BASE}/images/icons/pricing-list-tick.svg`;
const recommendedIcon = `${CLOUDFRONT_APP_BASE}/images/icons/recommended-icon.svg`;

export const PRICING_PLANS = [
  {
    id: 'gold-player',
    name: 'GOLD PLAYER',
    price: 999,
    currency: 'PKR',
    billingCycleLabel: 'Monthly',
    yearlyLabel: 'Yearly',
    yearlyPrice: 'PKR 10,988',
    yearlyNote: 'Save 2 months',
    isRecommended: true,
    accentColor: '#DA9811',
    badgeLabel: 'Recommended',
    ctaLabel: 'Buy',
    icon: goldRankingIcon,
    features: [
      'Upload up to 100 videos',
      'Live match updates',
      'Advanced player statistics',
      'Unlimited profile views',
      'In-app support chat',
      'Gold member badge',
      'Secure data & privacy',
      'Scoring & performance profile',
    ],
  },
  {
    id: 'elite-organizer',
    name: 'ELITE ORGANIZER',
    price: 2999,
    currency: 'PKR',
    billingCycleLabel: 'Monthly',
    yearlyLabel: 'Yearly',
    yearlyPrice: 'PKR 29,988',
    yearlyNote: 'Save 2 months',
    isRecommended: false,
    accentColor: '#E01D2F',
    badgeLabel: null,
    ctaLabel: 'Buy',
    icon: eliteRankingIcon,
    features: [
      'Create & manage tournaments',
      'Upload up to 120 videos',
      'Organizer support chat',
      'Elite organizer badge',
      'Secure data & privacy',
      'Scoring profiles',
      'Match scheduling & leaderboards',
      'Player notifications',
    ],
  },
];

function CheckIcon({ className = '' }) {
  return <img src={pricingListTickIcon} alt="" aria-hidden className={`h-4 w-4 flex-none object-contain ${className}`} />;
}

function PricingCard({ plan, isSelected, onSelect, onBuy }) {
  const {
    name,
    price,
    currency,
    billingCycleLabel,
    yearlyLabel,
    yearlyPrice,
    yearlyNote,
    isRecommended,
    badgeLabel,
    ctaLabel,
    features,
    icon,
  } = plan;

  return (
    <section
      className="relative cursor-pointer rounded-[17px] p-[18px] shadow-[0_18px_40px_rgba(0,0,0,0.9)] transition-transform duration-150 active:scale-[0.99]"
      style={{
        border: isSelected ? '1px solid #DA9811' : 'none',
        background: '#141412',
      }}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect?.();
        }
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-[17px]"
        style={{
          border: isSelected ? '1px solid rgba(255,255,255,0.15)' : 'none',
        }}
      />

      {/* top row: badge + title, price on right */}
      <div className="relative mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-[14px] bg-black/60">
            <img src={icon} alt={`${name} badge`} className="h-8 w-8 object-contain" />
          </div>
          <h2 className="text-[16px] font-bold text-[#DA9811] uppercase">{name}</h2>
        </div>

        <div className="text-right">
          <p className="mt-1 text-[16px] font-bold tracking-wide text-white">
            {currency} <span className="text-[16px] font-bold tracking-tight">{price.toLocaleString('en-PK')}</span>
          </p>
          <p className="text-[12px] font-bold text-white uppercase">{billingCycleLabel}</p>
        </div>
      </div>

      {isRecommended && badgeLabel ? (
        <div className="mb-4 inline-flex items-center rounded-full border border-[#DA9811] px-3 py-[6px]">
          <img src={recommendedIcon} alt="Recommended" className="mr-2 h-[18px] w-[18px] object-contain" />
          <span className="text-[12px] font-normal text-white uppercase">{badgeLabel}</span>
        </div>
      ) : null}

      <ul className="mb-5 space-y-2.5">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-[12px] text-[#A2A6AB]">
            <CheckIcon />
            <span className="leading-relaxed">{feature}</span>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between gap-3">
        <p className="text-[14px] font-semibold text-[#DA9811]">
          {yearlyLabel}: {yearlyPrice} ({yearlyNote})
        </p>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-[6px] bg-[#DA9811] px-4 py-1.5 text-[12px] font-semibold tracking-wide text-black shadow-[0_10px_25px_rgba(0,0,0,0.6)]"
          onClick={(event) => {
            event.stopPropagation();
            onBuy?.();
          }}
        >
          {ctaLabel}
          <span aria-hidden className="text-[16px]">
            ↗
          </span>
        </button>
      </div>
    </section>
  );
}

export default function Pricing() {
  const [selectedPlanId, setSelectedPlanId] = useState(PRICING_PLANS[0]?.id ?? null);
  const navigate = useNavigate();

  return (
    <div className="flex flex-col text-white">
      <AppSubpageHeader title="Choose Plan" />
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-4 px-4 py-4 lg:max-w-none">
        <div className="space-y-4">
          {PRICING_PLANS.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              isSelected={plan.id === selectedPlanId}
              onSelect={() => setSelectedPlanId(plan.id)}
              onBuy={() => navigate(`/pricing/${plan.id}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
