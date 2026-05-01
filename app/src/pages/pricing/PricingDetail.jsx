/**
 * PricingDetail
 *
 * Single pricing plan detail and purchase CTA. Opens success dialog.
 * Route: /pricing/:planId
 *
 * Coding guidelines: docs/Coding guidelines.md (§2 useAppDispatch)
 */

import { useMemo } from 'react';

import { useParams } from 'react-router-dom';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';
import { PRICING_PLANS } from '@/pages/pricing/Pricing';
import { useAppDispatch } from '@/store/hooks';
import { openDialog } from '@/store/slices/commonSlice';
import { Container } from '@/ui/Container';


const pricingListTickIcon = `${CLOUDFRONT_APP_BASE}/images/icons/pricing-list-tick.svg`;

function DetailCheckIcon() {
  return (
    <img
      src={pricingListTickIcon}
      alt=""
      aria-hidden
      className="h-4 w-4 flex-none object-contain"
    />
  );
}

export default function PricingDetail() {
  const { planId } = useParams();
  const dispatch = useAppDispatch();

  const plan = useMemo(
    () => PRICING_PLANS.find((p) => p.id === planId) ?? PRICING_PLANS[0],
    [planId],
  );

  if (!plan) {
    return null;
  }

  const { name, price, currency, features } = plan;

  return (
    <div className="bg-black text-white">
      <Container className="!px-4 !py-0">
        <AppSubpageHeader
          title="Plan Detail"
          bottomSpacing="relaxed"
          className="-mx-4 -mt-6 lg:mt-0"
        />

        <div className="mx-auto w-full max-w-md rounded-[18px] bg-[#141412] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.9)]">
          <div className="mb-4 flex items-center gap-3">
            {plan.icon ? (
              <div className="flex h-9 w-9 items-center justify-center rounded-[14px] bg-black/60">
                <img
                  src={plan.icon}
                  alt={`${name} badge`}
                  className="h-8 w-8 object-contain"
                />
              </div>
            ) : null}
            <h2 className="text-[18px] font-extrabold tracking-[0.18em] text-[#DA9811] uppercase">
              {name}
            </h2>
          </div>

          <ul className="mb-5 space-y-2.5">
            {features.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-2.5 text-[12px] text-[#A2A6AB]"
              >
                <DetailCheckIcon />
                <span className="leading-relaxed">{feature}</span>
              </li>
            ))}
          </ul>

          <p className="mb-4 text-[16px] font-extrabold text-white">
            {currency} {price.toLocaleString('en-PK')}{' '}
            <span className="text-[12px] font-medium text-white/80">
              Per Month
            </span>
          </p>

          <button
            type="button"
            onClick={() =>
              dispatch(
                openDialog({
                  key: 'pricingSuccess',
                  props: { planName: name },
                }),
              )
            }
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-[6px] bg-[#DA9811] py-3 text-center text-[14px] font-semibold text-black shadow-[0_10px_25px_rgba(0,0,0,0.7)]"
          >
            Submit Request
            <svg
              className="h-5 w-5 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </button>
        </div>
      </Container>
    </div>
  );
}
