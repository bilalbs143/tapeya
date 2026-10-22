import { cn } from '@/shared/lib/cn';

type HighlightThumbProps = {
  src: string | null;
  className?: string | undefined;
};

export function HighlightThumb({ src, className }: HighlightThumbProps) {
  return (
    <span
      className={cn(
        'border-border-subtle relative block overflow-hidden border bg-[linear-gradient(150deg,var(--color-brand-deep),var(--color-page-deep))]',
        className
      )}
    >
      {src ? (
        <img src={src} alt="" className="h-full w-full object-cover" />
      ) : (
        <span className="font-mono absolute inset-0 grid place-items-center text-4xs font-bold tracking-eyebrow text-white/22">
          TAPEYA
        </span>
      )}
    </span>
  );
}
