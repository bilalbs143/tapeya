import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';
import { Avatar } from '@/shared/ui/Avatar';
import { CalendarIcon, UsersIcon } from '@/shared/ui/icons';

/** Night stadium atmosphere for the interest campaign banner. */
export const INTEREST_STADIUM_BANNER_URL = '/images/interest-stadium.jpg';

type InterestCampaignBrandHeaderProps = {
  title: string;
  description?: string | null | undefined;
  logoUrl?: string | null | undefined;
  status?: 'open' | 'closed' | undefined;
  /** Title element — `h1` on the page, dialog title node from the caller. */
  titleAs?: 'h1' | 'h2' | undefined;
  className?: string | undefined;
};

/**
 * Stadium banner — logo left, copy right (ChatGPT layout), real photo + veil scrim.
 * Player identity below stays a quiet light card so the two sections don’t twin.
 */
export function InterestCampaignBrandHeader({
  title,
  description,
  logoUrl,
  status = 'open',
  titleAs = 'h1',
  className,
}: InterestCampaignBrandHeaderProps) {
  const TitleTag = titleAs;
  const blurb = description?.trim() || null;
  const timingLabel = status === 'closed' ? 'Closed' : 'Open Now';

  return (
    <section
      className={cn('relative overflow-hidden rounded-panel shadow-card', className)}
      aria-label="Tournament Interest"
    >
      <img
        src={INTEREST_STADIUM_BANNER_URL}
        alt=""
        width={1600}
        height={900}
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      {/* Light left wash only — keep stadium visible while type stays readable. */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-page-deep/60 via-page-deep/25 to-transparent"
        aria-hidden
      />

      <div className="relative flex min-h-36 items-center gap-3.5 p-3.5">
        {logoUrl ? (
          <span className="border-white/25 bg-page-deep/50 flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border shadow-card">
            <img src={logoUrl} alt="" className="h-full w-full object-contain p-1.5" />
          </span>
        ) : (
          <Avatar
            crest
            name={title}
            size="xl"
            className="border-white/25 h-24 w-24 border text-sm font-extrabold shadow-card"
            aria-hidden
          />
        )}

        <span className="bg-white/20 h-20 w-px shrink-0" aria-hidden />

        <div className="flex min-w-0 flex-1 flex-col justify-center py-0.5">
          <TitleTag className="line-clamp-2 text-body-lg leading-snug font-extrabold tracking-tight text-white">
            {title}
          </TitleTag>
          {blurb ? <p className="mt-1 line-clamp-3 text-2xs leading-relaxed text-white/80">{blurb}</p> : null}

          <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-3xs font-semibold text-white/70">
            <span className="inline-flex items-center gap-1.5">
              <CalendarIcon size="xs" className="h-3.5 w-3.5 shrink-0 text-white/80" strokeWidth={2} />
              {timingLabel}
            </span>
            <span className="bg-white/25 h-3 w-px shrink-0" aria-hidden />
            <span className="inline-flex items-center gap-1.5">
              <UsersIcon size="xs" className="h-3.5 w-3.5 shrink-0 text-white/80" strokeWidth={1.8} />
              Be a Player
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Faded campaign mark pinned behind the form — sibling of the scroller. */
export function InterestCampaignWatermark({ logoUrl }: { logoUrl?: string | null | undefined }) {
  if (!logoUrl) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center overflow-hidden"
      aria-hidden
    >
      <img src={logoUrl} alt="" className="max-h-[55%] max-w-[70%] object-contain opacity-20" />
    </div>
  );
}

type InterestCampaignStageProps = {
  logoUrl?: string | null | undefined;
  children: ReactNode;
  className?: string | undefined;
  /** Mark the scroller for shell scroll-to-top / focus helpers (Interest page). */
  pageScroll?: boolean | undefined;
};

/** Viewport-pinned watermark with scrolling content on top. */
export function InterestCampaignStage({
  logoUrl,
  children,
  className,
  pageScroll = false,
}: InterestCampaignStageProps) {
  return (
    <div className={cn('relative min-h-0 flex-1 overflow-hidden', className)}>
      <InterestCampaignWatermark logoUrl={logoUrl} />
      <div
        {...(pageScroll ? { 'data-page-scroll': '', 'data-scroll-to-top': '' } : {})}
        className="relative z-10 h-full overflow-y-auto overscroll-y-contain"
      >
        {children}
      </div>
    </div>
  );
}
