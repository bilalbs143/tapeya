import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { WifiOffIcon } from '@/shared/ui/icons';

export type ConnectionState = 'online' | 'reconnecting' | 'offline' | 'stale';

export type ConnectionBannerProps = {
  state?: ConnectionState | undefined;
  queued?: number | undefined;
  lastSent?: string | null | undefined;
  crowdScore?: string | null | undefined;
  serverOvers?: string | null | undefined;
  localOvers?: string | null | undefined;
  conflictSince?: string | null | undefined;
  onDiscard?: (() => void) | undefined;
  onReview?: (() => void) | undefined;
  className?: string | undefined;
};

/** Connection strip faces. Only `stale` (double-count conflict) blocks the pad; network drops keep scoring live. */

export function ConnectionBanner({
  state = 'online',
  queued = 0,
  lastSent,
  crowdScore,
  serverOvers,
  localOvers,
  conflictSince,
  onDiscard,
  onReview,
  className,
}: ConnectionBannerProps) {
  if (!state || state === 'online') return null;

  if (state === 'reconnecting') {
    return (
      <div role="status" className={cn('border-danger/45 bg-danger/14 border-b px-3.5 py-0', className)}>
        <div className="flex min-h-8.5 items-center gap-2">
          <span className="bg-danger-soft h-1.5 w-1.5 shrink-0 rounded-full" aria-hidden />
          <span className="font-mono text-danger-soft text-4xs font-extrabold tracking-eyebrow uppercase">
            Reconnecting
          </span>
          {queued > 0 ? (
            <span className="font-mono text-danger-soft ml-auto text-4xs font-bold tracking-eyebrow uppercase tabular-nums">
              {queued} queued
            </span>
          ) : null}
        </div>
      </div>
    );
  }

  if (state === 'offline') {
    return (
      <div role="status" className={cn('border-danger/45 bg-danger/14 border-b px-3.5 py-2.5', className)}>
        <div className="flex min-h-5.5 items-center gap-2">
          <WifiOffIcon size="xs" className="text-danger-soft h-3 w-3 shrink-0" strokeWidth={2.2} />
          <span className="font-mono text-danger-soft text-4xs font-extrabold tracking-eyebrow uppercase">Offline</span>
          {queued > 0 ? (
            <span className="font-mono text-danger-soft ml-auto text-4xs font-bold tracking-eyebrow uppercase tabular-nums">
              {queued} queued
            </span>
          ) : null}
        </div>
        <div className="border-border-subtle bg-page-deep text-muted mt-2.5 rounded-panel border px-2.5 py-2.5 text-3xs leading-snug">
          {lastSent || crowdScore ? (
            <p>
              Followers and the broadcast overlay are showing{' '}
              <span className="font-mono font-bold text-ink">{crowdScore || `last sent at ${lastSent}`}</span> until
              this reconnects.
            </p>
          ) : (
            <p>Scoring continues on this phone. Balls queue locally until the signal returns.</p>
          )}
        </div>
      </div>
    );
  }

  if (state === 'stale') {
    const local = localOvers ?? '—';
    const server = serverOvers ?? '—';
    const since = conflictSince ?? local;
    return (
      <div
        // Inline strip — not alertdialog (no focus trap). `alert` announces the conflict.
        role="alert"
        className={cn('border-danger/50 bg-danger/12 border-b px-3.5 py-3', className)}
      >
        <div className="border-danger/55 bg-danger/14 mb-3 flex min-h-8.5 items-center gap-2 rounded-icon border px-2.5">
          <span className="bg-danger-soft h-1.5 w-1.5 shrink-0 rounded-full" aria-hidden />
          <p className="font-mono text-danger-soft text-4xs font-extrabold tracking-eyebrow uppercase">Out of Date</p>
        </div>
        <p className="text-ink text-sm font-extrabold leading-snug">This Match Moved On Without You</p>
        <p className="text-muted mt-1.5 text-2xs leading-relaxed">
          The server is at <span className="font-mono font-bold text-ink">{server}</span>, this phone is at{' '}
          <span className="font-mono font-bold text-ink">{local}</span>. Another scorer has been recording since{' '}
          <span className="font-mono font-bold text-ink">{since}</span>
          {queued > 0 ? (
            <>
              , so your <span className="font-mono font-bold text-ink">{queued}</span> queued ball
              {queued === 1 ? '' : 's'} would double-count.
            </>
          ) : (
            '.'
          )}
        </p>
        <div className="mt-3 flex flex-col gap-2">
          <Button type="button" variant="primary" size="md" className="h-11 w-full" onClick={onDiscard}>
            Discard Mine, Load the Match
          </Button>
          <Button type="button" variant="secondary" size="md" className="h-11 w-full" onClick={onReview}>
            Review my {queued > 0 ? `${queued} ` : ''}ball{queued === 1 ? '' : 's'} first
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
