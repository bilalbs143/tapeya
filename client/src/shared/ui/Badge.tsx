import type { ComponentProps } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/shared/lib/cn';

/** Status pills — always `rounded-full`, not filter-chip radius. */
const badgeVariants = cva('inline-flex h-5 items-center gap-1.5 rounded-full px-2 text-xs font-semibold', {
  variants: {
    variant: {
      brand: 'bg-brand/18 text-brand-text',
      positive: 'bg-positive/18 text-positive-2',
      danger: 'bg-danger/20 text-danger-soft',
      warning: 'bg-warning/16 text-warning-soft',
      neutral: 'bg-surface-raised text-muted',
      navy: 'bg-surface-navy text-navy-text border border-border-subtle',
    },
  },
  defaultVariants: { variant: 'neutral' },
});

export type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>;

export type BadgeProps = ComponentProps<'span'> & VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {children}
    </span>
  );
}

type VerifiedBadgeProps = ComponentProps<'svg'> & {
  isOfficial?: boolean | undefined;
  size?: 'sm' | 'md' | undefined;
};

export function VerifiedBadge({ isOfficial = false, size = 'sm', className, ...props }: VerifiedBadgeProps) {
  if (!isOfficial) return null;

  const dim = size === 'md' ? 'h-4 w-4' : 'h-3.5 w-3.5';

  return (
    <svg
      className={cn('inline-block shrink-0 text-brand', dim, className)}
      viewBox="0 0 24 24"
      aria-label="Official Account"
      role="img"
      {...props}
    >
      <path
        fill="currentColor"
        d="M23 12l-2.44-2.79.34-3.69-3.61-.82-1.89-3.2L12 2.96 8.6 1.5 6.71 4.69 3.1 5.5l.34 3.7L1 12l2.44 2.79-.34 3.7 3.61.82L8.6 22.5 12 21.04l3.4 1.46 1.89-3.19 3.61-.82-.34-3.7L23 12z"
      />
      <path fill="#fff" d="M10.09 16.72 6.29 12.91l1.48-1.48 2.32 2.33 5.85-5.87 1.48 1.48-7.33 7.35z" />
    </svg>
  );
}
