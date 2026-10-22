import { useId, useState } from 'react';

import { useDismissalOptions } from '@/shared/api/enumsApi';
import {
  BaseDialog,
  DialogBody,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/dialogs/BaseDialog';
import { cn } from '@/shared/lib/cn';
import { Avatar } from '@/shared/ui/Avatar';
import { Button } from '@/shared/ui/Button';
import { Field } from '@/shared/ui/Field';
import { Form } from '@/shared/ui/Form';
import { InfoIcon } from '@/shared/ui/icons';
import { ErrorState, Skeleton } from '@/shared/ui/states';
import { Switch } from '@/shared/ui/Switch';

import { dismissalNeedsFielder } from '../lib/storeBallPayload';

export type WicketChoice = {
  dismissalType: string;
  outPlayerId: number;
  fielderId: number | null;
  isWide?: boolean | undefined;
  isNoBall?: boolean | undefined;
  /** Runs completed before the wicket — maps to `runout_extra_runs` for run out. */
  runoutExtraRuns?: number | undefined;
  dontCountBall?: boolean | undefined;
};

type EndKey = 'striker' | 'nonStriker';

type BatterFace = {
  id: number;
  name: string;
  runs?: number | undefined;
  balls?: number | undefined;
};

type FielderFace = {
  id: number;
  name: string;
  role?: string | undefined;
};

type WicketSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  freeHit: boolean;
  /** Illegal-ball wicket context from overflow. */
  fromExtra?: 'wd' | 'nb' | null | undefined;
  striker: BatterFace | null;
  nonStriker: BatterFace | null;
  fielders: FielderFace[];
  bowlerName?: string | null | undefined;
  overNumber?: number | undefined;
  ballInOver?: number | undefined;
  onConfirm: (choice: WicketChoice) => void;
};

/** How-out grid, then detail (who / fielder / runs / count ball). Summary after Record. */

export function WicketSheet({
  open,
  onOpenChange,
  freeHit,
  fromExtra = null,
  striker,
  nonStriker,
  fielders,
  bowlerName = null,
  overNumber,
  ballInOver,
  onConfirm,
}: WicketSheetProps) {
  const [step, setStep] = useState<'how' | 'detail'>('how');
  const [dismissal, setDismissal] = useState<string | null>(null);
  const [whoIsOut, setWhoIsOut] = useState<EndKey>('striker');
  const [fielderId, setFielderId] = useState<number | null>(null);
  const [runs, setRuns] = useState(0);
  const [countBall, setCountBall] = useState(true);
  const countBallId = useId();
  const { options: dismissals, enums, isLoading, isError, refetch } = useDismissalOptions();

  // Reset when sheet opens or illegal-ball context changes — render-time sync, not useEffect.
  const [prevOpen, setPrevOpen] = useState(open);
  const [prevFromExtra, setPrevFromExtra] = useState(fromExtra);
  if (open !== prevOpen || fromExtra !== prevFromExtra) {
    setPrevOpen(open);
    setPrevFromExtra(fromExtra);
    if (open) {
      setStep('how');
      setDismissal(null);
      setWhoIsOut('striker');
      setFielderId(null);
      setRuns(fromExtra ? 1 : 0);
      setCountBall(fromExtra == null);
    }
  }

  const needsFielder = dismissal != null && dismissalNeedsFielder(dismissal, enums);
  const eitherEnd = dismissal != null && allowsEitherEnd(dismissal);
  const labelFor = (value: string) => dismissals.find((d) => d.value === value)?.label ?? value;

  const howMeta = [
    overNumber != null ? `Over ${overNumber}` : null,
    ballInOver != null ? `Ball ${ballInOver}` : null,
    striker?.name ? `${striker.name} on strike` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  const detailMeta =
    bowlerName &&
    dismissal != null &&
    !['run_out', 'mankad', 'obstructing_the_field', 'retired_out', 'retired', 'retired_hurt', 'timed_out'].includes(
      dismissal
    )
      ? `Credited to ${bowlerName}`
      : `Who's out${needsFielder ? ', who fielded' : ''}, runs, ball count`;

  const selectedDismissal = dismissal != null ? dismissals.find((d) => d.value === dismissal) : undefined;
  const canContinue = dismissal != null && (!freeHit || Boolean(selectedDismissal?.valid_on_free_hit));
  const canRecord = dismissal != null && (!needsFielder || fielderId != null);

  function pickHow(value: string) {
    const option = dismissals.find((d) => d.value === value);
    if (freeHit && option && !option.valid_on_free_hit) return;
    setDismissal(value);
  }

  function goDetail() {
    if (!dismissal) return;
    setWhoIsOut(dismissal === 'mankad' ? 'nonStriker' : 'striker');
    setFielderId(null);
    setRuns(fromExtra ? 1 : 0);
    setCountBall(fromExtra == null);
    setStep('detail');
  }

  function commit() {
    if (!dismissal) return;
    if (needsFielder && fielderId == null) return;

    const outPlayerId =
      eitherEnd || dismissal === 'mankad'
        ? whoIsOut === 'nonStriker'
          ? (nonStriker?.id ?? null)
          : (striker?.id ?? null)
        : (striker?.id ?? null);

    if (outPlayerId == null) return;

    onConfirm({
      dismissalType: dismissal,
      outPlayerId,
      fielderId: needsFielder ? fielderId : null,
      isWide: fromExtra === 'wd',
      isNoBall: fromExtra === 'nb',
      ...(dismissal === 'run_out' ? { runoutExtraRuns: runs } : {}),
      ...(!countBall ? { dontCountBall: true } : {}),
    });
  }

  const subtitleHow = freeHit
    ? 'Free hit — only dismissals allowed on a free hit.'
    : fromExtra === 'wd'
      ? 'Wicket off a wide.'
      : fromExtra === 'nb'
        ? 'Wicket off a no-ball.'
        : howMeta || 'How was the batter out?';

  return (
    <BaseDialog open={open} onOpenChange={onOpenChange} sheet contentClassName="tab:max-w-dialog">
      {step === 'how' ? (
        <>
          <DialogHeader>
            <DialogTitle>How Was He Out?</DialogTitle>
            <DialogDescription className="font-mono text-3xs font-medium uppercase">{subtitleHow}</DialogDescription>
          </DialogHeader>

          <DialogBody>
            {freeHit ? (
              <p className="border-danger/45 bg-danger/12 text-danger-soft rounded-field border px-3 py-2 text-2xs font-semibold">
                Free hit — only a run out (or Mankad) counts. Everything else is dimmed.
              </p>
            ) : null}

            {isError ? (
              <ErrorState
                title="Couldn’t Load Dismissals"
                description="Wicket types come from the server."
                onRetry={() => void refetch()}
              />
            ) : isLoading && dismissals.length === 0 ? (
              <div className="grid grid-cols-3 gap-2" aria-busy="true" aria-label="Loading Dismissals">
                <Skeleton className="min-h-13 rounded-field" />
                <Skeleton className="min-h-13 rounded-field" />
                <Skeleton className="min-h-13 rounded-field" />
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {dismissals.map((item) => {
                  const blocked = freeHit && !item.valid_on_free_hit;
                  const on = dismissal === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      disabled={blocked || isLoading}
                      onClick={() => pickHow(item.value)}
                      className={cn(
                        'focus-visible:outline-brand flex min-h-13 items-center justify-center rounded-field border px-1.5 text-center text-2xs font-bold focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-30',
                        on ? 'border-brand bg-brand/14 text-brand-text' : 'border-border-subtle bg-surface text-body'
                      )}
                    >
                      {formatDismissalLabel(item.label)}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="text-dim flex gap-2 text-2xs leading-relaxed">
              <InfoIcon size="xs" className="text-dim mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={2} />
              <span>
                On a free hit or an illegal ball the grid dims everything the laws don&apos;t allow — the scorer
                can&apos;t record an impossible dismissal.
              </span>
            </div>
          </DialogBody>

          <DialogFooter>
            <Button variant="danger" size="md" disabled={!canContinue} onClick={goDetail}>
              {dismissal ? `Continue · ${labelFor(dismissal)}` : 'Continue'}
            </Button>
          </DialogFooter>
        </>
      ) : (
        <>
          <DialogHeader>
            <DialogTitle>{dismissal ? labelFor(dismissal) : 'Wicket'}</DialogTitle>
            <DialogDescription className="font-mono text-3xs font-medium uppercase">{detailMeta}</DialogDescription>
          </DialogHeader>

          <Form density="compact" onSubmit={(e) => e.preventDefault()}>
            <DialogBody>
              <Field label="Who Is Out" required>
                <div className="flex gap-2">
                  {(
                    [
                      ['striker', striker, 'Striker'],
                      ['nonStriker', nonStriker, 'Non-Striker'],
                    ] as const
                  ).map(([key, batter, label]) => {
                    if (!batter) return null;
                    const lockedOut = dismissal != null && !allowsEitherEnd(dismissal) && key !== 'striker';
                    const lockedMankad = dismissal === 'mankad' && key !== 'nonStriker';
                    const disabled = lockedOut || lockedMankad;
                    const on = whoIsOut === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        disabled={disabled}
                        onClick={() => setWhoIsOut(key)}
                        className={cn(
                          'focus-visible:outline-brand min-h-14 flex-1 rounded-field border px-2.5 py-2 text-left focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-40',
                          on ? 'border-danger bg-danger/14' : 'border-border-subtle bg-surface'
                        )}
                      >
                        <span
                          className={cn(
                            'font-mono mb-0.5 flex items-center gap-1.5 text-4xs font-bold tracking-eyebrow uppercase',
                            on ? 'text-danger' : 'text-dim'
                          )}
                        >
                          {on ? <span className="bg-danger inline-block h-1.5 w-1.5 rounded-full" /> : null}
                          {label}
                        </span>
                        <span className={cn('block truncate text-xs font-bold', on ? 'text-ink' : 'text-muted')}>
                          {batter.name}{' '}
                          <span className="font-mono text-3xs font-semibold">
                            {batter.runs ?? 0}({batter.balls ?? 0})
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </Field>

              {needsFielder ? (
                <Field label={fielderHeading(dismissal)} required>
                  <div className="border-border-subtle bg-surface max-h-55 overflow-y-auto rounded-panel border">
                    {fielders.length === 0 ? (
                      <p className="text-muted px-3 py-3 text-2xs">
                        No bowling XI loaded — the catch or run out cannot be filed yet.
                      </p>
                    ) : (
                      fielders.map((p) => {
                        const on = fielderId === p.id;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setFielderId(p.id)}
                            className={cn(
                              'border-border-subtle focus-visible:outline-brand flex min-h-13.5 w-full items-center gap-2.5 border-b px-3 last:border-b-0 focus-visible:outline-2 focus-visible:-outline-offset-2',
                              on && 'bg-brand/10'
                            )}
                          >
                            <Avatar name={p.name} size="sm" />
                            <span className="min-w-0 flex-1 text-left">
                              <span className="block truncate text-xs font-bold text-ink">{p.name}</span>
                              <span className="font-mono text-dim block text-4xs uppercase">{p.role || 'Fielder'}</span>
                            </span>
                          </button>
                        );
                      })
                    )}
                  </div>
                </Field>
              ) : null}

              <Field label="Runs Completed">
                <div className="grid grid-cols-4 gap-2">
                  {[0, 1, 2, 3].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setRuns(n)}
                      className={cn(
                        'font-mono focus-visible:outline-brand grid min-h-11 place-items-center rounded-icon border text-sm font-extrabold focus-visible:outline-2 focus-visible:outline-offset-2',
                        runs === n ? 'border-brand bg-brand text-white' : 'border-border-subtle bg-surface text-ink'
                      )}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </Field>

              <label
                htmlFor={countBallId}
                className="border-border-subtle bg-surface flex min-h-13 cursor-pointer items-center gap-3 rounded-field border px-3.5"
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-bold text-ink">Count This Ball</span>
                  <span className="text-dim mt-0.5 block text-3xs">
                    Off for a dismissal that didn&apos;t come off a legal delivery
                  </span>
                </span>
                <Switch id={countBallId} checked={countBall} onCheckedChange={setCountBall} />
              </label>
            </DialogBody>
          </Form>

          <DialogFooter>
            <Button variant="secondary" size="md" onClick={() => setStep('how')}>
              Back
            </Button>
            <Button variant="danger" size="md" disabled={!canRecord} onClick={commit}>
              Record the Wicket
            </Button>
          </DialogFooter>
        </>
      )}
    </BaseDialog>
  );
}

function allowsEitherEnd(dismissal: string): boolean {
  return (
    dismissal === 'run_out' ||
    dismissal === 'mankad' ||
    dismissal === 'retired_out' ||
    dismissal === 'retired' ||
    dismissal === 'retired_hurt' ||
    dismissal === 'obstructing_the_field' ||
    dismissal === 'timed_out'
  );
}

function fielderHeading(dismissal: string | null): string {
  if (dismissal === 'caught') return 'Caught By';
  if (dismissal === 'stumped') return 'Stumped By';
  if (dismissal === 'mankad') return 'Run Out By';
  return 'Fielder';
}

function formatDismissalLabel(label: string) {
  if (/retired\s*out/i.test(label)) {
    return (
      <span className="leading-tight">
        Retired
        <br />
        out
      </span>
    );
  }
  return label;
}
