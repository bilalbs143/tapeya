import type { ComponentProps, ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { InfoIcon, RefreshIcon } from '@/shared/ui/icons';
import { Spinner } from '@/shared/ui/Spinner';

const EMPTY_SIZES = {
  sm: 'px-4 py-8',
  md: 'px-6 py-12',
  lg: 'min-h-[320px] justify-center px-6 py-14',
} as const;

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: string | undefined;
  action?: ReactNode;
  size?: keyof typeof EMPTY_SIZES | undefined;
  inset?: boolean | undefined;
  className?: string | undefined;
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  size = 'md',
  inset = false,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center text-center',
        EMPTY_SIZES[size] ?? EMPTY_SIZES.md,
        inset && 'px-0',
        className
      )}
    >
      {icon ? (
        <span className="bg-surface-raised text-muted mb-3 grid h-10 w-10 place-items-center rounded-icon">{icon}</span>
      ) : null}
      <p className="text-ink text-sm font-bold">{title}</p>
      {description ? <p className="text-muted mt-1 max-w-[38ch] text-2xs leading-relaxed">{description}</p> : null}
      {action ? <div className="mt-4 flex flex-wrap justify-center gap-2">{action}</div> : null}
    </div>
  );
}

type ErrorStateProps = {
  title?: string | undefined;
  description?: string | undefined;
  onRetry?: (() => void) | undefined;
  onDismiss?: (() => void) | undefined;
  className?: string | undefined;
};

export function ErrorState({
  title = "Couldn't load that",
  description,
  onRetry,
  onDismiss,
  className,
}: ErrorStateProps) {
  return (
    <div className={cn('bg-surface flex flex-col items-center rounded-card px-6 py-8 text-center', className)}>
      <span className="bg-danger/14 mb-3 grid h-10 w-10 place-items-center rounded-icon">
        <InfoIcon className="text-danger-soft h-4 w-4" strokeWidth={2.2} />
      </span>
      <p className="text-ink text-sm font-bold">{title}</p>
      {description ? <p className="text-muted mt-1 text-2xs leading-relaxed">{description}</p> : null}
      {onRetry || onDismiss ? (
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {onDismiss ? (
            <Button variant="secondary" size="sm" onClick={onDismiss}>
              Dismiss
            </Button>
          ) : null}
          {onRetry ? (
            <Button variant="secondary" size="sm" onClick={onRetry}>
              <RefreshIcon className="h-3.5 w-3.5" strokeWidth={2} />
              Try Again
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

type SkeletonProps = {
  className?: string | undefined;
};

/** Prefer over Spinner when layout shape is known. */
export function Skeleton({ className, ...props }: SkeletonProps & ComponentProps<'span'>) {
  return (
    <span
      aria-hidden
      className={cn(
        'animate-shimmer block rounded-chip bg-[linear-gradient(90deg,var(--c-skeleton)_0%,var(--c-skeleton-shine)_50%,var(--c-skeleton)_100%)] bg-[length:200%_100%]',
        className
      )}
      {...props}
    />
  );
}

/** PostCard-shaped skeleton (feed may pass flush card classes). */
export function PostSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('border-border-subtle bg-surface overflow-hidden rounded-card border', className)} aria-hidden>
      <div className="flex items-center gap-2.5 p-3.5 pb-2.5">
        <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <Skeleton className="h-2.5 w-24" />
          <Skeleton className="h-2 w-16" />
        </div>
      </div>
      <Skeleton className="mx-3.5 mb-2.5 h-2.5 w-4/5" />
      {/* Post media aspect varies — avoid implying 4:3. */}
      <Skeleton className="h-40 w-full rounded-none" />
      <div className="flex gap-4 p-3.5 pt-2.5">
        <Skeleton className="h-3 w-10" />
        <Skeleton className="h-3 w-10" />
        <Skeleton className="h-3 w-10" />
      </div>
    </div>
  );
}

export function UserRowSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('flex items-center gap-2.5', className)} aria-hidden>
      <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <Skeleton className="h-2.5 w-28" />
        <Skeleton className="h-2 w-20" />
      </div>
      <Skeleton className="h-8 w-16 shrink-0 rounded-chip" />
    </div>
  );
}

export function CommentRowSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('flex items-start gap-2.5 py-2', className)} aria-hidden>
      <Skeleton className="h-7 w-7 shrink-0 rounded-full" />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <Skeleton className="h-2.5 w-24" />
        <Skeleton className="h-2.5 w-full" />
        <Skeleton className="h-2 w-2/3" />
      </div>
    </div>
  );
}

export function EpisodeRowSkeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn('border-border-subtle flex items-center gap-3 rounded-panel border p-2.5', className)}
      aria-hidden
    >
      <Skeleton className="h-14 w-24 shrink-0 rounded-field" />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <Skeleton className="h-2.5 w-4/5" />
        <Skeleton className="h-2 w-16" />
      </div>
    </div>
  );
}

export function ProfileHeaderSkeleton({ className, withTabs = true }: SkeletonProps & { withTabs?: boolean }) {
  return (
    <div className={cn('flex flex-col gap-4', className)} aria-busy="true" aria-label="Loading Profile">
      <div className="flex gap-3.5 px-4 pt-4">
        <Skeleton className="h-16 w-16 shrink-0 rounded-full" />
        <div className="flex min-w-0 flex-1 flex-col gap-2 pt-1">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
          <div className="mt-1 flex gap-4">
            <Skeleton className="h-3 w-10" />
            <Skeleton className="h-3 w-10" />
            <Skeleton className="h-3 w-10" />
          </div>
        </div>
      </div>
      <div className="flex gap-2 px-4">
        <Skeleton className="h-10 flex-1 rounded-panel" />
        <Skeleton className="h-10 flex-1 rounded-panel" />
      </div>
      {withTabs ? (
        <div className="border-border-subtle flex gap-3 border-b px-4 pb-0">
          <Skeleton className="mb-2 h-3 w-12" />
          <Skeleton className="mb-2 h-3 w-12" />
          <Skeleton className="mb-2 h-3 w-12" />
        </div>
      ) : null}
    </div>
  );
}

export function FormFieldsSkeleton({ rows = 4, className }: SkeletonProps & { rows?: number }) {
  return (
    <div className={cn('flex flex-col gap-3', className)} aria-hidden>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex flex-col gap-1.5">
          <Skeleton className="h-2.5 w-16" />
          <Skeleton className={cn('w-full rounded-field', i === 1 ? 'h-20' : 'h-11')} />
        </div>
      ))}
    </div>
  );
}

export function StreamCardSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('border-border-subtle border-b', className)} aria-hidden>
      <Skeleton className="aspect-video w-full rounded-none" />
      <div className="flex flex-col gap-1.5 px-4 py-2.5">
        <Skeleton className="h-3.5 w-4/5" />
        <Skeleton className="h-2.5 w-1/3" />
      </div>
    </div>
  );
}

export function ListRowSkeleton({
  className,
  thumbClassName = 'h-14 w-14 rounded-panel',
  trailing = true,
  showThumb = true,
}: SkeletonProps & {
  thumbClassName?: string | undefined;
  trailing?: boolean | undefined;
  showThumb?: boolean | undefined;
}) {
  return (
    <div className={cn('flex items-center gap-3 p-3.5', className)} aria-hidden>
      {showThumb ? <Skeleton className={cn('shrink-0', thumbClassName)} /> : null}
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <Skeleton className="h-2.5 w-3/4" />
        <Skeleton className="h-2 w-1/3" />
      </div>
      {trailing ? (
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <Skeleton className="h-5 w-14 rounded-chip" />
          <Skeleton className="h-2 w-10" />
        </div>
      ) : null}
    </div>
  );
}

export function OrderCardSkeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn('border-border-subtle bg-surface flex flex-col gap-2.5 rounded-card border p-3.5', className)}
      aria-hidden
    >
      <div className="flex items-center gap-2">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="ml-auto h-5 w-12 rounded-chip" />
        <Skeleton className="h-5 w-16 rounded-chip" />
      </div>
      <ListRowSkeleton className="p-0" thumbClassName="h-11 w-11 rounded-panel" trailing={false} />
      <div className="flex items-center justify-between gap-2">
        <Skeleton className="h-2.5 w-20" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

export function HighlightTileSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)} aria-hidden>
      <Skeleton className="aspect-video w-full rounded-field" />
      <Skeleton className="h-2.5 w-4/5" />
      <Skeleton className="h-2 w-1/3" />
    </div>
  );
}

/** Profile / public reel shelf — 3 cols phone, optional denser tab grid via className. */
export function ReelGridSkeleton({
  count = 9,
  className,
}: SkeletonProps & {
  count?: number | undefined;
}) {
  return (
    <div className={cn('grid grid-cols-3 gap-0.5', className)} aria-busy="true" aria-label="Loading Reels">
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} className="aspect-reel-poster w-full rounded-none" />
      ))}
    </div>
  );
}

/** Highlight library grid — 2 cols phone / 3 tab. */
export function HighlightGridSkeleton({
  count = 6,
  className,
}: SkeletonProps & {
  count?: number | undefined;
}) {
  return (
    <div
      className={cn('grid grid-cols-2 gap-x-3 gap-y-4 tab:grid-cols-3', className)}
      aria-busy="true"
      aria-label="Loading Highlights"
    >
      {Array.from({ length: count }, (_, i) => (
        <HighlightTileSkeleton key={i} />
      ))}
    </div>
  );
}

/** Related highlight / search result row (matches HighlightThumb size). */
export function HighlightRowSkeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn('border-border-subtle bg-surface flex items-center gap-3 rounded-panel border p-2.5', className)}
      aria-hidden
    >
      <Skeleton className="h-[46px] w-[78px] shrink-0 rounded-icon" />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <Skeleton className="h-2.5 w-4/5" />
        <Skeleton className="h-2 w-12" />
      </div>
    </div>
  );
}

type LoadingStateProps = {
  label?: string | undefined;
  description?: string | undefined;
  className?: string | undefined;
};

/** Indeterminate wait — prefer a matching Skeleton when you know the layout. */
export function LoadingState({ label = 'Loading', description, className }: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn('flex flex-col items-center justify-center gap-3 px-6 py-12 text-center', className)}
    >
      <Spinner size="lg" />
      <div>
        <p className="text-ink text-sm font-bold">{label}</p>
        {description ? <p className="text-muted mt-1 text-2xs leading-relaxed">{description}</p> : null}
      </div>
    </div>
  );
}
