import type { ComponentProps } from 'react';

import { cn } from '@/shared/lib/cn';
import { Badge, type BadgeVariant } from '@/shared/ui/Badge';
import { LiveBadge } from '@/shared/ui/LiveBadge';

import { type StatusKind, statusMeta } from './statusMeta';

/** Maps domain status → badge tone; `kind` disambiguates colliding values (e.g. order vs vendor `pending`). */

const VARIANT: Record<'neutral' | 'brand' | 'positive' | 'danger' | 'warning', BadgeVariant> = {
  neutral: 'neutral',
  brand: 'brand',
  positive: 'positive',
  danger: 'danger',
  warning: 'warning',
};

export type StatusBadgeProps = ComponentProps<'span'> & {
  kind?: StatusKind | undefined;
  status?: string | null | undefined;
  /** Overrides the mapped copy — the tone still comes from `status`. */
  label?: string | undefined;
};

export function StatusBadge({ kind = 'match', status, label, className, ...props }: StatusBadgeProps) {
  const meta = statusMeta(kind, status);

  if (meta.tone === 'live') return <LiveBadge className={className} label={label ?? 'LIVE'} {...props} />;

  return (
    <Badge variant={VARIANT[meta.tone]} className={cn(className)} {...props}>
      {label ?? meta.label}
    </Badge>
  );
}
