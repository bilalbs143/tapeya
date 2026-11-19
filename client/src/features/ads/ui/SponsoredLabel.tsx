import { cn } from '@/shared/lib/cn';

type SponsoredLabelProps = {
  label?: string | undefined;
  className?: string | undefined;
  /** Reels overlay sits on dark video chrome. */
  tone?: 'feed' | 'reel' | undefined;
};

/** Mandatory paid-placement disclosure beside the creator name. */
export function SponsoredLabel({ label = 'Sponsored', className, tone = 'feed' }: SponsoredLabelProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold tracking-wide',
        tone === 'reel'
          ? 'text-sponsored text-3xs drop-shadow-[0_1px_3px_rgba(0,0,0,0.55)]'
          : 'text-sponsored text-4xs',
        className
      )}
    >
      {label}
    </span>
  );
}
