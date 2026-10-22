import type { ButtonHTMLAttributes } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/shared/lib/cn';

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 rounded-button font-semibold transition-transform active:scale-[.985]',
    'focus-visible:outline-brand focus-visible:outline-2 focus-visible:outline-offset-2',
    'disabled:pointer-events-none disabled:opacity-40',
  ],
  {
    variants: {
      variant: {
        primary: 'bg-brand text-white hover:bg-brand-hover',
        positive: 'bg-positive text-white hover:bg-positive-2',
        outline: 'bg-transparent text-ink border border-brand/55 hover:border-brand hover:bg-brand/10',
        secondary: 'bg-surface-raised text-ink border border-border hover:border-border hover:bg-surface',
        ghost: 'bg-transparent text-muted hover:bg-surface-raised hover:text-ink',
        danger: 'bg-danger text-white hover:opacity-90',
        link: 'bg-transparent text-brand-hover underline-offset-4 hover:underline px-0',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
);

export type ButtonVariant = NonNullable<VariantProps<typeof buttonVariants>['variant']>;
export type ButtonSize = NonNullable<VariantProps<typeof buttonVariants>['size']>;

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    /** Sets aria-busy and disables; ignored when `asChild`. */
    loading?: boolean;
  };

export function Button({
  className,
  variant,
  size,
  asChild = false,
  type = 'button',
  disabled,
  loading = false,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button';
  const spinner = loading && !asChild;

  return (
    <Comp
      type={asChild ? undefined : type}
      disabled={disabled || spinner}
      aria-busy={spinner || undefined}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          {spinner ? (
            <svg
              viewBox="0 0 24 24"
              className="h-3.5 w-3.5 shrink-0 animate-spin"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              aria-hidden
            >
              <path d="M12 3a9 9 0 1 0 9 9" />
            </svg>
          ) : null}
          {children}
        </>
      )}
    </Comp>
  );
}
