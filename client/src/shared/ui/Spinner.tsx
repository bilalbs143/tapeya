import type { ComponentProps } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/shared/lib/cn';

/** Indeterminate wait — prefer Skeleton when layout shape is known. */
const spinnerVariants = cva('inline-block shrink-0 animate-spin rounded-full', {
  variants: {
    size: {
      sm: 'h-3.5 w-3.5 border-[1.5px]',
      md: 'h-5 w-5 border-2',
      lg: 'h-8 w-8 border-[2.5px]',
    },
    tone: {
      brand: 'border-brand/25 border-t-brand',
      ink: 'border-border border-t-ink',
      muted: 'border-border-subtle border-t-muted',
      /* White track on dark media — page tokens would disappear. */
      media: 'border-white/20 border-t-white/85',
    },
  },
  defaultVariants: { size: 'md', tone: 'brand' },
});

export type SpinnerSize = NonNullable<VariantProps<typeof spinnerVariants>['size']>;
export type SpinnerTone = NonNullable<VariantProps<typeof spinnerVariants>['tone']>;

export type SpinnerProps = ComponentProps<'span'> &
  VariantProps<typeof spinnerVariants> & { label?: string | undefined };

export function Spinner({ size, tone, label = 'Loading', className, ...props }: SpinnerProps) {
  return (
    <span role="status" aria-label={label} className={cn(spinnerVariants({ size, tone }), className)} {...props} />
  );
}
