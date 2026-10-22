import { useId, useState } from 'react';

import { useGetEnumsQuery } from '@/shared/api/enumsApi';
import {
  BaseDialog,
  DialogBody,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/dialogs/BaseDialog';
import { cn } from '@/shared/lib/cn';
import { enumOptions } from '@/shared/model/enums';
import { Button } from '@/shared/ui/Button';
import { Field } from '@/shared/ui/Field';
import { Form } from '@/shared/ui/Form';
import { Textarea } from '@/shared/ui/Input';
import { ErrorState, Skeleton } from '@/shared/ui/states';
import { Switch } from '@/shared/ui/Switch';

export type MatchStateAction = 'revise_target' | 'end_innings';

type MatchStateSheetProps = {
  action: MatchStateAction | null;
  onOpenChange: (open: boolean) => void;
  battingShort: string;
  scoreLine: string;
  oversDisplay: string | null;
  oversPerSide: number | null;
  currentTarget: number | null;
  runsNow: number;
  ballsLeft: number | null;
  saving?: boolean | undefined;
  onReviseTarget: (payload: { target: number; then: 'continue' | 'end_innings' }) => void;
  onEndInnings: (payload: { reason: string; comments: string; pointsAwardedEach: boolean }) => void;
};

/** 2a — Revise Target and End Innings. API fields from app lifecycle. */

export function MatchStateSheet({
  action,
  onOpenChange,
  battingShort,
  scoreLine,
  oversDisplay,
  oversPerSide,
  currentTarget,
  runsNow,
  ballsLeft,
  saving = false,
  onReviseTarget,
  onEndInnings,
}: MatchStateSheetProps) {
  const open = action === 'revise_target' || action === 'end_innings';
  const { data: enums, isLoading, isError, refetch } = useGetEnumsQuery(undefined, { skip: !open });
  const endReasons = enumOptions(enums, 'innings_end_reason').filter((o) =>
    ['rain', 'captain', 'referee', 'out_of_time'].includes(o.value)
  );

  const [target, setTarget] = useState(String(currentTarget ?? 1));
  const [then, setThen] = useState<'continue' | 'end_innings'>('continue');
  const [reason, setReason] = useState('rain');
  const [comments, setComments] = useState('');
  const [pointsEach, setPointsEach] = useState(false);
  const pointsEachId = useId();

  // Reseat on open, action switch, or server target change — render-time sync, not useEffect.
  const [prevOpen, setPrevOpen] = useState(open);
  const [prevAction, setPrevAction] = useState(action);
  const [prevCurrentTarget, setPrevCurrentTarget] = useState(currentTarget);
  if (open !== prevOpen || action !== prevAction || currentTarget !== prevCurrentTarget) {
    setPrevOpen(open);
    setPrevAction(action);
    setPrevCurrentTarget(currentTarget);
    if (open) {
      setTarget(String(currentTarget ?? 1));
      setThen('continue');
      setReason(endReasons[0]?.value ?? 'rain');
      setComments('');
      setPointsEach(false);
    }
  }

  if (!open) return null;

  const targetNum = Number(target) || 0;
  const needMore = Math.max(0, targetNum - runsNow);
  const showPoints = reason === 'rain' || reason === 'out_of_time';

  function bump(delta: number) {
    setTarget(String(Math.min(999, Math.max(1, targetNum + delta))));
  }

  function commit() {
    if (action === 'revise_target') {
      const n = Math.min(999, Math.max(1, targetNum || 1));
      onReviseTarget({ target: n, then });
      return;
    }
    if (!reason) return;
    onEndInnings({
      reason,
      comments: comments.trim(),
      pointsAwardedEach: showPoints ? pointsEach : false,
    });
  }

  return (
    <BaseDialog open onOpenChange={onOpenChange} sheet contentClassName="tab:max-w-dialog">
      {action === 'revise_target' ? (
        <>
          <DialogHeader>
            <DialogTitle>Revise Target</DialogTitle>
            <DialogDescription>
              {battingShort} are chasing. A new target rewrites the chase header and every runs-to-win figure from the
              next ball on.
            </DialogDescription>
          </DialogHeader>

          <Form density="compact" onSubmit={(e) => e.preventDefault()}>
            <DialogBody>
              <div className="border-border-subtle flex gap-3 rounded-field border px-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-dim text-4xs font-semibold tracking-eyebrow uppercase">Current Target</p>
                  <p className="font-mono mt-0.5 text-title leading-normal font-extrabold text-ink">
                    {currentTarget ?? '—'}
                  </p>
                </div>
                <div className="bg-border-subtle w-px shrink-0 self-stretch" />
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-dim text-4xs font-semibold tracking-eyebrow uppercase">Score Now</p>
                  <p className="font-mono mt-0.5 text-title leading-normal font-extrabold text-ink">{scoreLine}</p>
                </div>
              </div>

              <Field
                label="New Target (Runs to Win)"
                required
                hint={`1–999. ${battingShort} would need ${needMore} more${ballsLeft != null ? ` from ${ballsLeft} balls` : ''}.`}
              >
                {({ id }) => (
                  <div className="border-brand bg-surface focus-within:outline-brand flex min-h-13 items-center rounded-field border pr-1.5 pl-3.5 focus-within:outline-2 focus-within:outline-offset-2">
                    <input
                      id={id}
                      inputMode="numeric"
                      value={target}
                      onChange={(e) => setTarget(e.target.value.replace(/\D/g, '').slice(0, 3))}
                      className="font-mono min-w-0 flex-1 bg-transparent text-display-sm font-extrabold text-ink outline-none"
                    />
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => bump(-1)}
                        aria-label="Lower Target"
                        className="border-border-subtle bg-surface text-muted focus-visible:outline-brand grid h-11 w-11 place-items-center rounded-icon border font-mono text-base font-bold focus-visible:outline-2 focus-visible:outline-offset-2"
                      >
                        −
                      </button>
                      <button
                        type="button"
                        onClick={() => bump(1)}
                        aria-label="Raise Target"
                        className="border-border-subtle bg-surface text-muted focus-visible:outline-brand grid h-11 w-11 place-items-center rounded-icon border font-mono text-base font-bold focus-visible:outline-2 focus-visible:outline-offset-2"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}
              </Field>

              <Field label="Then" required>
                <div className="flex flex-col gap-1.5">
                  <ThenOption
                    selected={then === 'continue'}
                    title="Continue Innings"
                    hint="Back to the pad, new target live"
                    onClick={() => setThen('continue')}
                  />
                  <ThenOption
                    selected={then === 'end_innings'}
                    title="End Innings"
                    hint="Settle the result against the new target"
                    onClick={() => setThen('end_innings')}
                  />
                </div>
              </Field>
            </DialogBody>
          </Form>

          <DialogFooter>
            <Button size="md" loading={saving} onClick={commit}>
              Save Target
            </Button>
          </DialogFooter>
        </>
      ) : (
        <>
          <DialogHeader>
            <DialogTitle>End Innings Early</DialogTitle>
            <DialogDescription>
              {battingShort} {scoreLine} after {oversDisplay ?? '—'} of {oversPerSide ?? 20}. Ending here is final for
              this innings.
            </DialogDescription>
          </DialogHeader>

          <Form density="compact" onSubmit={(e) => e.preventDefault()}>
            <DialogBody>
              {isError ? (
                <ErrorState title="Couldn’t Load End Reasons" onRetry={() => void refetch()} />
              ) : isLoading && endReasons.length === 0 ? (
                <Skeleton className="h-24 w-full rounded-field" />
              ) : (
                <Field label="Reason" required>
                  <div className="flex flex-col gap-1.5">
                    {endReasons.map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setReason(item.value)}
                        className={cn(
                          'focus-visible:outline-brand flex min-h-11 items-center gap-2.5 rounded-icon border px-3 text-left text-xs font-semibold focus-visible:outline-2 focus-visible:outline-offset-2',
                          reason === item.value
                            ? 'border-brand bg-surface text-ink'
                            : 'border-border-subtle bg-surface text-body'
                        )}
                      >
                        <span
                          className={cn(
                            'grid h-4 w-4 shrink-0 place-items-center rounded-full border-[1.5px]',
                            reason === item.value ? 'border-brand border-[4.5px]' : 'border-dim'
                          )}
                        />
                        {item.label}
                      </button>
                    ))}
                  </div>
                </Field>
              )}

              {showPoints ? (
                <label
                  htmlFor={pointsEachId}
                  className="border-border-subtle bg-surface flex min-h-13 cursor-pointer items-center gap-3 rounded-field border px-3.5"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-bold text-ink">Award 1 point each</span>
                    <span className="text-dim mt-0.5 block text-3xs">
                      For rain / time no-results the league needs points for
                    </span>
                  </span>
                  <Switch id={pointsEachId} checked={pointsEach} onCheckedChange={setPointsEach} />
                </label>
              ) : null}

              <Textarea
                label="Comments"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Play stopped 19:04, ground unfit…"
                className="min-h-15.5 text-2xs"
              />
            </DialogBody>
          </Form>

          <DialogFooter>
            <Button variant="secondary" size="md" disabled={saving} onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="md" loading={saving} disabled={!reason} onClick={commit}>
              End Innings
            </Button>
          </DialogFooter>
        </>
      )}
    </BaseDialog>
  );
}

function ThenOption({
  selected,
  title,
  hint,
  onClick,
}: {
  selected: boolean;
  title: string;
  hint: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'focus-visible:outline-brand flex min-h-11.5 items-center gap-2.5 rounded-field border px-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2',
        selected ? 'border-brand bg-surface' : 'border-border-subtle bg-surface'
      )}
    >
      <span
        className={cn(
          'grid h-4 w-4 shrink-0 place-items-center rounded-full border-[1.5px]',
          selected ? 'border-brand border-[4.5px]' : 'border-dim'
        )}
      />
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-bold text-ink">{title}</span>
        <span className="text-dim block text-4xs">{hint}</span>
      </span>
    </button>
  );
}
