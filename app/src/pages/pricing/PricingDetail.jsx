import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import pricingListTickIcon from '@/assets/images/icons/pricing-list-tick.svg';
import { PRICING_PLANS } from '@/pages/pricing/Pricing';
import { Container } from '@/ui/Container';
import {
  Dialog,
  DialogClose,
  DialogContentProfile,
  DialogScrollBody,
} from '@/ui/Dialog';

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
  const navigate = useNavigate();
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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
        <header className="-mx-4 -mt-6 flex items-center gap-3 bg-black px-4 pt-6 pb-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-[27px] w-[27px] shrink-0 items-center justify-center rounded-full bg-white text-[#4a4a4a] transition-opacity active:opacity-80"
            aria-label="Back"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="min-w-0 flex-1 pr-[27px] text-center text-[16px] font-bold tracking-wide text-white uppercase">
            Plan Detail
          </h1>
        </header>

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
            onClick={() => setShowSuccessModal(true)}
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

      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContentProfile className="!h-[280px]">
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex shrink-0 items-center justify-between px-4 py-3">
              <span aria-hidden className="w-5" />
              <DialogClose
                className="rounded p-1 text-white/60 transition-colors hover:text-white focus:ring-2 focus:ring-[#FFB703] focus:outline-none"
                aria-label="Close"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 15 15"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" />
                </svg>
              </DialogClose>
            </div>

            <DialogScrollBody className="flex flex-col items-center justify-center py-2 text-center">
              <div className="relative mb-4 flex h-16 w-16 shrink-0 items-center justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white">
                  <svg
                    className="h-8 w-8 text-[#E8A857]"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden
                  >
                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 11V4a3 3 0 0 1 3-3h2v10z" />
                  </svg>
                </div>
                <div
                  className="absolute -top-0.5 -right-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-[#22C55E]"
                  aria-hidden
                >
                  <svg
                    className="h-4 w-4 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
              </div>

              <h2 className="mb-1.5 text-[16px] font-bold text-white">
                Thank you for your request
              </h2>
              <p className="text-[13px] leading-snug text-[#A2A6AB]">
                Our team will contact you soon
              </p>
            </DialogScrollBody>
          </div>
        </DialogContentProfile>
      </Dialog>
    </div>
  );
}
