import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/shared/lib/cn';

/** Icon-only button — required `label` for a11y; sizes are hit targets (prefer `md`+ on phone). */
const iconButtonVariants = cva(
  [
    'grid shrink-0 place-items-center',
    'focus-visible:outline-brand focus-visible:outline-2 focus-visible:outline-offset-2',
    'disabled:pointer-events-none disabled:opacity-40',
  ],
  {
    variants: {
      size: {
        sm: 'h-8 w-8',
        md: 'h-10 w-10',
        lg: 'h-11 w-11',
      },
      variant: {
        ghost: 'text-muted hover:text-ink hover:bg-surface-raised',
        subtle: 'bg-surface-raised text-body hover:text-ink',
        outline: 'border border-border bg-surface text-body hover:text-ink',
        media: 'bg-black/35 text-white backdrop-blur-md hover:bg-black/50',
        danger: 'text-danger-soft hover:bg-danger/12',
      },
      round: {
        true: 'rounded-full',
        false: 'rounded-icon',
      },
    },
    defaultVariants: { size: 'md', variant: 'ghost', round: false },
  }
);

export type IconButtonSize = NonNullable<VariantProps<typeof iconButtonVariants>['size']>;
export type IconButtonVariant = NonNullable<VariantProps<typeof iconButtonVariants>['variant']>;

export type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof iconButtonVariants> & {
    label: string;
    asChild?: boolean | undefined;
  };

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, size, variant, round, className, children, asChild = false, ...props },
  ref
) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      ref={ref}
      type={asChild ? undefined : 'button'}
      aria-label={label}
      title={label}
      className={cn(iconButtonVariants({ size, variant, round }), className)}
      {...props}
    >
      {children}
    </Comp>
  );
});
