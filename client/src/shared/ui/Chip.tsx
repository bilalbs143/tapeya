import type { ComponentProps, ElementType, ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/shared/lib/cn';

import { HScroll } from './HScroll';

/** Selectable chips — selected = brand tint + border (not colour alone). Use Tabs for pane switches. */
const chipVariants = cva(
  [
    'inline-flex shrink-0 items-center justify-center rounded-field border font-bold',
    'focus-visible:outline-brand focus-visible:outline-2 focus-visible:outline-offset-2',
    'disabled:pointer-events-none disabled:opacity-40',
  ],
  {
    variants: {
      size: {
        sm: 'min-h-8 gap-1.5 px-3 text-3xs',
        md: 'min-h-9 gap-2 px-3.5 text-2xs',
        lg: 'min-h-11 gap-2 px-4 text-body-sm',
      },
      selected: {
        true: 'border-brand bg-brand/12 text-ink',
        false: 'border-border bg-surface text-muted hover:text-ink hover:border-border',
      },
    },
    defaultVariants: { size: 'md', selected: false },
  }
);

export type ChipSize = NonNullable<VariantProps<typeof chipVariants>['size']>;

export type ChipProps = Omit<ComponentProps<'button'>, 'children'> &
  VariantProps<typeof chipVariants> & {
    leading?: ReactNode;
    trailing?: ReactNode;
    as?: ElementType | undefined;
    children?: ReactNode;
  };

export function Chip({
  selected = false,
  disabled = false,
  size,
  leading,
  trailing,
  as,
  role,
  className,
  children,
  ...props
}: ChipProps) {
  const element: ElementType = as ?? 'button';
  const isButton = element === 'button';
  const Comp = element as 'button';
  const isSelected = selected ?? false;

  return (
    <Comp
      type={isButton ? 'button' : undefined}
      disabled={isButton ? disabled : undefined}
      role={role}
      aria-pressed={isButton && !role ? isSelected : undefined}
      className={cn(chipVariants({ size, selected: isSelected }), className)}
      {...props}
    >
      {leading}
      <span className="min-w-0 truncate">{children}</span>
      {trailing}
    </Comp>
  );
}

/** Horizontal scroll — wrapping filter rows steal vertical space on narrow screens. */
export function ChipRow({ className, children, ...props }: ComponentProps<'div'>) {
  return (
    <HScroll
      /* py-0.5: overflow-x-auto enables overflow-y and would clip borders without it */
      className={cn('items-center gap-2 py-0.5', className)}
      {...props}
    >
      {children}
    </HScroll>
  );
}
