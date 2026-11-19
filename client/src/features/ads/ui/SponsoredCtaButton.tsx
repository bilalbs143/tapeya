import { cn } from '@/shared/lib/cn';
import { WhatsAppIcon } from '@/shared/ui/icons';

import type { AdCta } from '../model/schemas';

type SponsoredCtaButtonProps = {
  cta: AdCta;
  onClick: () => void;
  /** Brand / headline on the left of the feed CTA strip. */
  title?: string | null | undefined;
  className?: string | undefined;
  tone?: 'feed' | 'reel' | undefined;
};

/** Sponsored CTA — feed strip under media, or full-width reel bar under caption. */
export function SponsoredCtaButton({ cta, onClick, title, className, tone = 'feed' }: SponsoredCtaButtonProps) {
  const isWhatsApp = cta.type === 'whatsapp';
  const label = cta.label.trim();

  if (tone === 'reel') {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'flex w-full min-h-10 items-center justify-center gap-1.5 rounded-field border px-3.5 text-2xs font-bold text-white backdrop-blur-md transition-colors active:scale-[0.99]',
          isWhatsApp
            ? 'border-positive/45 bg-positive/80 hover:bg-positive/90'
            : 'border-white/25 bg-white/15 hover:bg-white/22',
          className
        )}
      >
        {isWhatsApp ? <WhatsAppIcon size="xs" className="shrink-0" /> : null}
        {label}
      </button>
    );
  }

  const barTitle = title?.trim() || label;

  return (
    <div
      className={cn('border-border-subtle bg-surface-raised flex items-center gap-3 border-y px-3.5 py-2.5', className)}
    >
      <p className="text-ink min-w-0 flex-1 truncate text-2xs font-semibold leading-snug">{barTitle}</p>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'inline-flex shrink-0 items-center gap-1.5 rounded-field px-3 py-1.5 text-2xs font-bold text-white transition-colors',
          isWhatsApp ? 'bg-positive hover:bg-positive-2' : 'bg-brand hover:bg-brand-hover'
        )}
      >
        {isWhatsApp ? <WhatsAppIcon size="xs" className="shrink-0" /> : null}
        {label}
      </button>
    </div>
  );
}
