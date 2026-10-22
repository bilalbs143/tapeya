import type { ComponentProps, ElementType, ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';
import { ChevronRightIcon } from '@/shared/ui/icons';

export function ListGroup({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('border-border bg-surface overflow-hidden rounded-card border', className)} {...props} />;
}

export type ListRowProps = Omit<ComponentProps<'button'>, 'children' | 'title'> & {
  leading?: ReactNode;
  title?: ReactNode;
  subtitle?: ReactNode;
  meta?: ReactNode;
  trailing?: ReactNode;
  selected?: boolean | undefined;
  chevron?: boolean | undefined;
  as?: ElementType | undefined;
};

export function ListRow({
  leading,
  title,
  subtitle,
  meta,
  trailing,
  selected = false,
  chevron = false,
  onClick,
  className,
  as,
  ...props
}: ListRowProps) {
  const element: ElementType = as ?? (onClick ? 'button' : 'div');
  const Comp = element as 'button';
  /* `as={Link}` rows need the same interactive styles as onClick rows. */
  const interactive = Boolean(onClick) || Boolean(as);

  return (
    <Comp
      type={element === 'button' ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'border-border-subtle flex w-full items-center gap-3 border-t px-4 py-3 text-left first:border-t-0',
        selected && 'bg-brand/12',
        interactive &&
          'hover:bg-surface-raised/80 focus-visible:outline-brand focus-visible:outline-2 focus-visible:-outline-offset-2',
        className
      )}
      {...props}
    >
      {leading ? <span className="shrink-0">{leading}</span> : null}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-body-sm font-semibold text-ink">{title}</span>
        {subtitle ? <span className="text-muted mt-0.5 block truncate text-2xs">{subtitle}</span> : null}
      </span>
      {meta ? (
        <span className="font-mono text-dim shrink-0 text-3xs font-semibold tracking-eyebrow uppercase">{meta}</span>
      ) : null}
      {trailing ? <span className="shrink-0">{trailing}</span> : null}
      {selected ? (
        <span
          className="bg-brand grid h-5 w-5 shrink-0 place-items-center rounded-full text-2xs font-bold text-white"
          aria-hidden
        >
          ✓
        </span>
      ) : null}
      {chevron && !selected ? <ChevronRightIcon size="xs" className="text-dim h-4 w-4 shrink-0" /> : null}
    </Comp>
  );
}
