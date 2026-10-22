import { useState } from 'react';

import { useExtraTypeOptions } from '@/shared/api/enumsApi';
import { BaseDialog } from '@/shared/dialogs/BaseDialog';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { Form } from '@/shared/ui/Form';
import { LockIcon, StumpsIcon } from '@/shared/ui/icons';
import { Input } from '@/shared/ui/Input';

import { type OverflowAction, OverflowSheet } from './OverflowSheet';

const RUNS = [0, 1, 2, 3, 4, 6] as const;

export type ExtraCode = 'wd' | 'nb' | 'bye' | 'lb';

function isExtraCode(value: string): value is ExtraCode {
  return value === 'wd' || value === 'nb' || value === 'bye' || value === 'lb';
}

type ScoringPadProps = {
  onRuns: (runs: number) => void;
  onExtra: (extra: ExtraCode) => void;
  onWicket: () => void;
  onOverflowAction: (action: OverflowAction) => void;
  onUndo: () => void;
  canUndo: boolean;
  freeHit?: boolean | undefined;
  freeHitBall?: number | null | undefined;
  overNum?: number | undefined;
  ballInOver?: number | undefined;
  strikerName?: string | null | undefined;
  locked?: boolean | undefined;
  lockNote?: string | undefined;
  saving?: boolean | undefined;
  /** Hide Custom score on the first ball. */
  showCustom?: boolean | undefined;
  savingLabel?: string | undefined;
  className?: string | undefined;
};

/** One-short omitted — no API field. */
export function ScoringPad({
  onRuns,
  onExtra,
  onWicket,
  onOverflowAction,
  onUndo,
  canUndo,
  freeHit = false,
  freeHitBall = null,
  overNum = 1,
  ballInOver = 1,
  strikerName = null,
  locked = false,
  lockNote = 'Pad unlocks once the crease is set',
  saving = false,
  showCustom = true,
  savingLabel = 'Saving…',
  className,
}: ScoringPadProps) {
  const { options: extras } = useExtraTypeOptions();
  const [customOpen, setCustomOpen] = useState(false);
  const [custom, setCustom] = useState('');
  const [overflowOpen, setOverflowOpen] = useState(false);
  const blocked = locked || saving;

  function submitCustom() {
    const runs = Number(custom);
    if (!Number.isInteger(runs) || runs < 0 || runs > 255) return;
    setCustomOpen(false);
    setCustom('');
    onRuns(runs);
  }

  return (
    <div className={cn('relative flex flex-col gap-2', className)}>
      {locked ? (
        <div className="border-border-subtle bg-page-deep flex min-h-9 items-center justify-center gap-2 rounded-icon border px-3">
          <LockIcon size="xs" className="text-dim h-3.5 w-3.5 shrink-0" strokeWidth={1.9} />
          <span className="font-mono text-dim text-2xs font-semibold tracking-eyebrow uppercase">{lockNote}</span>
        </div>
      ) : null}

      {freeHit && !locked ? (
        <div className="border-border-subtle bg-page-deep flex min-h-9 items-center gap-2 rounded-icon border px-3">
          <span className="bg-muted h-1.5 w-1.5 shrink-0 rounded-full" aria-hidden />
          <span className="font-mono text-muted text-3xs font-extrabold tracking-eyebrow uppercase">
            Free hit{freeHitBall != null ? ` · Ball ${freeHitBall}` : ''}
          </span>
          <span className="font-mono text-muted ml-auto text-4xs font-semibold uppercase">Run Out Only</span>
        </div>
      ) : null}

      {saving ? (
        <div
          className="bg-surface-raised border-border flex min-h-9 items-center justify-center gap-2.5 rounded-icon border"
          role="status"
        >
          <span className="border-brand h-3 w-3 animate-spin rounded-full border-2 border-t-transparent" />
          <span className="font-mono text-brand-text text-3xs font-bold tracking-eyebrow uppercase">{savingLabel}</span>
        </div>
      ) : null}

      <div className={cn('grid grid-cols-6 gap-2', blocked && 'pointer-events-none opacity-40')}>
        {RUNS.map((runs) => (
          <button
            key={runs}
            type="button"
            onClick={() => onRuns(runs)}
            className={cn(
              'font-mono focus-visible:outline-brand flex min-h-14 items-center justify-center rounded-panel text-lg font-extrabold transition-transform active:scale-[.985] focus-visible:outline-2',
              runs === 4 || runs === 6
                ? 'border-brand bg-brand/18 text-brand-text border'
                : 'bg-surface-raised border-border-subtle text-ink border'
            )}
          >
            {runs}
          </button>
        ))}
      </div>

      {showCustom ? (
        <button
          type="button"
          disabled={blocked}
          onClick={() => setCustomOpen(true)}
          className={cn(
            'border-border-subtle text-dim hover:text-ink focus-visible:outline-brand font-mono flex h-9 items-center justify-center rounded-field border border-dashed text-3xs font-bold tracking-eyebrow uppercase focus-visible:outline-2',
            blocked && 'pointer-events-none opacity-40'
          )}
        >
          + Custom score
        </button>
      ) : null}

      <div className={cn('grid grid-cols-4 gap-2', blocked && 'pointer-events-none opacity-40')}>
        {extras.map((extra) => (
          <button
            key={extra.value}
            type="button"
            disabled={!isExtraCode(extra.value)}
            onClick={() => {
              if (isExtraCode(extra.value)) onExtra(extra.value);
            }}
            aria-label={extra.label}
            className="border-border-subtle bg-surface font-mono focus-visible:outline-brand hover:border-brand/40 flex h-11 items-center justify-center rounded-field border text-xs font-bold text-body uppercase focus-visible:outline-2 disabled:opacity-40"
          >
            {extra.short_label}
          </button>
        ))}
      </div>

      <div className={cn('grid grid-cols-[2fr_1fr_1fr] gap-2', blocked && 'pointer-events-none opacity-40')}>
        <Button
          size="lg"
          variant="danger"
          className={cn('h-12 gap-2 rounded-field text-sm font-extrabold', freeHit && 'opacity-55')}
          onClick={onWicket}
        >
          <StumpsIcon size="sm" className="h-4 w-4" strokeWidth={2.2} />
          {freeHit ? 'Wicket · limited' : 'Wicket'}
        </Button>
        <Button
          size="lg"
          variant="secondary"
          className="h-12 rounded-field px-0"
          aria-label="More Ball Outcomes"
          disabled={blocked}
          onClick={() => setOverflowOpen(true)}
        >
          <span className="text-body-lg leading-normal font-extrabold tracking-[.2em]">···</span>
        </Button>
        <Button
          size="lg"
          variant="secondary"
          className="border-danger/50 text-danger-soft h-12 rounded-field"
          disabled={blocked || !canUndo}
          onClick={onUndo}
        >
          Undo
        </Button>
      </div>

      <BaseDialog open={customOpen} onOpenChange={setCustomOpen} sheet>
        <Form
          density="compact"
          className="px-4 pt-2 pb-4"
          onSubmit={(event) => {
            event.preventDefault();
            submitCustom();
          }}
        >
          <h2 className="text-title-sm font-extrabold text-ink">Custom Score</h2>
          <Input
            label="Runs off the Bat"
            required
            inputMode="numeric"
            value={custom}
            onChange={(event) => setCustom(event.target.value.replace(/\D/g, '').slice(0, 3))}
            className="font-mono min-h-12 text-lg font-extrabold"
          />
          <Button type="submit" className="min-h-12 font-bold" disabled={custom === ''}>
            Save {custom || 'runs'}
          </Button>
        </Form>
      </BaseDialog>

      <OverflowSheet
        open={overflowOpen}
        onOpenChange={setOverflowOpen}
        overNum={overNum}
        ballInOver={ballInOver}
        strikerName={strikerName}
        onAction={onOverflowAction}
      />
    </div>
  );
}
