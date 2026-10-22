import { Skeleton } from '@/shared/ui/states';

/** Scorer pad chrome — sticky navy header + pill tabs + keypad grid. */

export function MatchScoreSkeleton() {
  return (
    <div className="bg-surface flex h-full min-h-0 flex-col" aria-busy="true" aria-label="Loading Score Pad">
      <header
        data-surface="navy"
        className="bg-brand-deep border-ink/10 shrink-0 border-b px-4 pt-[max(10px,env(safe-area-inset-top))] pb-3.5"
      >
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-10 w-10 rounded-icon bg-white/10" />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <Skeleton className="h-3 w-40 bg-white/15" />
            <Skeleton className="h-2 w-24 bg-white/10" />
          </div>
          <Skeleton className="h-10 w-10 rounded-icon bg-white/10" />
        </div>
        <div className="mt-3 flex items-start gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full bg-white/15" />
            <Skeleton className="h-4 w-16 bg-white/15" />
            <Skeleton className="h-5 w-10 rounded-chip bg-white/10" />
          </div>
          <Skeleton className="h-8 w-20 bg-white/20" />
        </div>
        <div className="mt-1 flex items-baseline justify-between gap-3">
          <Skeleton className="h-2.5 w-28 bg-white/10" />
          <Skeleton className="h-2.5 w-16 bg-white/10" />
        </div>
      </header>

      <div className="mx-4 mt-3 flex shrink-0 items-center gap-2">
        <Skeleton className="h-9 min-w-0 flex-1 rounded-full" />
        <Skeleton className="h-5 w-10" />
      </div>

      <div className="mt-3 flex min-h-0 flex-1 flex-col gap-3 px-3.5 pb-4">
        <Skeleton className="h-12 w-full rounded-card" />
        <div className="flex gap-2">
          <Skeleton className="h-16 flex-1 rounded-panel" />
          <Skeleton className="h-16 flex-1 rounded-panel" />
          <Skeleton className="h-16 flex-1 rounded-panel" />
        </div>
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="aspect-square w-full rounded-panel" />
          ))}
        </div>
        <div className="mt-auto grid grid-cols-3 gap-2">
          <Skeleton className="h-11 rounded-field" />
          <Skeleton className="h-11 rounded-field" />
          <Skeleton className="h-11 rounded-field" />
        </div>
      </div>
    </div>
  );
}

/** Fan match card — score band + chip tabs + panel. */

export function MatchCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 px-4 py-4" aria-busy="true" aria-label="Loading Match">
      <div className="border-border-subtle bg-surface flex flex-col gap-3 rounded-card border p-3.5">
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-2.5 w-16" />
          <Skeleton className="h-5 w-12 rounded-chip" />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="h-3.5 w-16" />
          </div>
          <Skeleton className="h-8 w-16" />
          <div className="flex min-w-0 flex-1 flex-col items-end gap-1.5">
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="h-3.5 w-16" />
          </div>
        </div>
        <Skeleton className="h-2.5 w-2/3" />
      </div>
      <div className="flex gap-2 overflow-hidden">
        {['Live', 'Card', 'Comm', 'Stats'].map((label) => (
          <Skeleton key={label} className="h-8 w-16 shrink-0 rounded-full" />
        ))}
      </div>
      <Skeleton className="h-40 w-full rounded-card" />
    </div>
  );
}
