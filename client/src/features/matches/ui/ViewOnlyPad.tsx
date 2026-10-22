import { EyeIcon } from '@/shared/ui/icons';

type ViewOnlyPadProps = {
  battingShort: string;
  runs: number;
  wickets: number;
  oversDisplay: string | null;
};

export function ViewOnlyPad({ battingShort, runs, wickets, oversDisplay }: ViewOnlyPadProps) {
  return (
    <div className="flex flex-col gap-3 px-1 py-2">
      <div className="border-border-subtle bg-page-deep flex items-center gap-2.5 rounded-card border px-3.5 py-3">
        <span className="bg-muted/30 text-muted grid h-8 w-8 shrink-0 place-items-center rounded-icon" aria-hidden>
          <EyeIcon size="sm" className="h-4 w-4" strokeWidth={1.9} />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-bold text-ink">View Only</p>
          <p className="text-muted text-3xs leading-snug">
            You&apos;re watching this match. Scorecard and ball log stay open; the pad stays locked.
          </p>
        </div>
      </div>

      <div className="border-border-subtle bg-surface rounded-card border px-3.5 py-3.5">
        <p className="font-mono text-dim text-4xs font-bold tracking-eyebrow uppercase">{battingShort} batting</p>
        <p className="font-mono mt-1.5 text-score font-extrabold text-ink tabular-nums">
          {runs}
          <span className="text-muted">/{wickets}</span>
        </p>
        <p className="font-mono text-muted mt-1 text-2xs font-semibold uppercase">{oversDisplay ?? '0.0'} ov</p>
      </div>

      <div className="border-border-subtle bg-page-deep rounded-card border border-dashed px-3.5 py-6 text-center">
        <p className="font-mono text-dim text-3xs font-bold tracking-eyebrow uppercase">Scoring Pad Locked</p>
        <p className="text-muted mt-1.5 text-2xs leading-relaxed">
          Only the match scorer can enter balls from this device.
        </p>
      </div>
    </div>
  );
}
