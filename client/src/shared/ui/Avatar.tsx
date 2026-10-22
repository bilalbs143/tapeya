import type { ComponentProps } from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/shared/lib/cn';

/** Radix swaps to fallback when the image fails — avoids broken-img flash. */
const avatarVariants = cva('relative flex shrink-0 items-center justify-center overflow-hidden', {
  variants: {
    size: {
      xs: 'h-6 w-6 text-4xs',
      sm: 'h-8 w-8 text-3xs',
      md: 'h-9 w-9 text-xs',
      lg: 'h-12 w-12 text-sm',
      xl: 'h-20 w-20 text-xl',
    },
    crest: {
      true: 'rounded-icon',
      false: 'rounded-full',
    },
  },
  defaultVariants: { size: 'md', crest: false },
});

export type AvatarSize = NonNullable<VariantProps<typeof avatarVariants>['size']>;

export type AvatarProps = Omit<ComponentProps<typeof AvatarPrimitive.Root>, 'children'> & {
  src?: string | undefined;
  /** Full name, or a crest code like `CBC` when `crest` is set. */
  name?: string | undefined;
  size?: AvatarSize | undefined;
  /** Squared-off club crest rather than a round face. */
  crest?: boolean | undefined;
  /** Adds the presence dot, which needs a wrapper — `className` then lands on it. */
  online?: boolean | undefined;
};

function initialsFrom(name: string, crest: boolean): string {
  const raw = name.trim();
  if (!raw) return '';
  /* Crest codes (CBC, GAC) are single tokens — take up to 3 letters. */
  if (crest && !/\s/.test(raw)) return raw.slice(0, 3).toUpperCase();
  return raw
    .split(/\s+/)
    .map((word) => word[0])
    .filter(Boolean)
    .slice(0, crest ? 3 : 2)
    .join('')
    .toUpperCase();
}

export function Avatar({ className, src, name = '', size, crest = false, online = false, ...props }: AvatarProps) {
  const initials = initialsFrom(name, crest);

  const face = (
    <AvatarPrimitive.Root className={cn(avatarVariants({ size, crest }), !online && className)} {...props}>
      {src ? <AvatarPrimitive.Image src={src} alt="" className="h-full w-full object-cover" /> : null}
      <AvatarPrimitive.Fallback
        delayMs={src ? 200 : 0}
        className={cn(
          'flex h-full w-full items-center justify-center font-bold text-ink',
          crest ? 'bg-[linear-gradient(150deg,var(--color-positive),var(--color-brand-deep))]' : 'bg-surface-raised'
        )}
      >
        {initials}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );

  if (!online) return face;

  return (
    <span className={cn('relative inline-flex shrink-0', className)}>
      {face}
      <span
        className="bg-positive ring-page absolute right-0 bottom-0 h-[13px] w-[13px] rounded-full ring-[2.5px]"
        aria-label="Online"
      />
    </span>
  );
}
