import { cn } from '@/shared/lib/cn';

type GlyphProps = {
  className?: string;
  active?: boolean;
};

const base = 'h-[17px] w-[17px]';

export function HomeGlyph({ className, active }: GlyphProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn(base, !active && 'opacity-50', className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5z" />
    </svg>
  );
}

export function ShopGlyph({ className, active }: GlyphProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn(base, !active && 'opacity-50', className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M4 9h16l-1.2 11H5.2L4 9z" />
      <path d="M8 9V7a4 4 0 0 1 8 0v2" />
    </svg>
  );
}

export function ReelsGlyph({ className, active }: GlyphProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn(base, !active && 'opacity-50', className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      aria-hidden
    >
      <rect x="4" y="3" width="16" height="18" rx="3" />
      <path d="M10 9.5v5l5-2.5-5-2.5z" />
    </svg>
  );
}

export function LiveGlyph({ className, active }: GlyphProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn(base, !active && 'opacity-50', className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M5.5 8.5a8 8 0 0 0 0 7M18.5 8.5a8 8 0 0 1 0 7" />
    </svg>
  );
}

export function MatchesGlyph({ className, active }: GlyphProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn(base, !active && 'opacity-50', className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      aria-hidden
    >
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="M8 5v14M16 5v14" />
    </svg>
  );
}

export function YouGlyph({ className, active }: GlyphProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn(base, !active && 'opacity-50', className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      aria-hidden
    >
      <circle cx="12" cy="8" r="3.6" />
      <path d="M5 20c0-3.6 3.1-5.6 7-5.6s7 2 7 5.6" />
    </svg>
  );
}
