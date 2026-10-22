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
import { IconButton } from '@/shared/ui/IconButton';
import { CheckIcon, ChevronLeftIcon, TrophyIcon } from '@/shared/ui/icons';

import type { MatchOverInnings } from '../lib/matchOver';
import type { useMatchOver } from './useMatchOver';

type MatchOverFlow = ReturnType<typeof useMatchOver>;

type MatchOverBodyProps = {
  flow: MatchOverFlow;
  resultSummary: string | null;
  homeShort: string;
  awayShort: string;
  canOperate: boolean;
  innings?: MatchOverInnings[] | undefined;
  subtitle?: string | null | undefined;
};

function ScoreRow({ inn }: { inn: MatchOverInnings }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="bg-surface-raised font-mono text-ink grid h-7 w-7 shrink-0 place-items-center rounded-lg text-4xs font-extrabold">
        {inn.short.slice(0, 2)}
      </span>
      <span className="min-w-0 flex-1 truncate text-sm leading-normal font-bold text-ink">{inn.short}</span>
      <span className="font-mono text-base font-bold tabular-nums text-ink">
        {inn.runs}-{inn.wickets} <span className="text-muted text-3xs font-semibold">({inn.overs})</span>
      </span>
    </div>
  );
}

/** Complete match hero, MotM card, actions, and picker dialog. */
export function MatchOverBody({
  flow,
  resultSummary,
  homeShort,
  awayShort,
  canOperate,
  innings = [],
  subtitle,
}: MatchOverBodyProps) {
  const {
    picking,
    setPicking,
    motmName,
    selectedId,
    setSelectedId,
    isLoading,
    candidates,
    saveMotm,
    share,
    goList,
    goCard,
  } = flow;

  const homeInn = innings.find((i) => i.side === 'home');
  const awayInn = innings.find((i) => i.side === 'away');

  return (
    <div className="bg-surface flex min-h-0 flex-1 flex-col overflow-y-auto">
      <header
        data-surface="navy"
        className="bg-brand-deep border-ink/10 shrink-0 border-b px-3.5 pt-[max(10px,env(safe-area-inset-top))] pb-3.5"
      >
        <div className="flex items-center gap-2">
          <IconButton
            label="Back"
            size="lg"
            variant="ghost"
            onClick={() => goList()}
            className="focus-visible:outline-ink text-body hover:text-ink -m-1.5"
          >
            <ChevronLeftIcon className="h-4 w-4" strokeWidth={2.2} />
          </IconButton>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="bg-surface-raised font-mono rounded-chip px-1.5 py-0.5 text-4xs font-bold tracking-eyebrow text-body uppercase">
                Complete
              </span>
              <h1 className="truncate text-body-sm font-extrabold text-ink">
                {homeShort} vs {awayShort}
              </h1>
            </div>
            {subtitle ? (
              <p className="font-mono text-muted mt-0.5 truncate text-4xs font-medium uppercase">{subtitle}</p>
            ) : null}
          </div>
        </div>

        {(homeInn || awayInn) && (
          <div className="mt-3.5 flex flex-col gap-2.5">
            {homeInn ? <ScoreRow inn={homeInn} /> : null}
            {awayInn ? <ScoreRow inn={awayInn} /> : null}
          </div>
        )}

        {resultSummary ? (
          <div className="border-positive/50 bg-positive/14 mt-3.5 rounded-field border px-3.5 py-2.5">
            <p className="text-sm leading-normal font-extrabold text-ink">{resultSummary}</p>
          </div>
        ) : null}
      </header>

      <div className="flex flex-1 flex-col gap-3 px-3.5 pt-3.5 pb-4">
        <div className="border-brand/45 bg-surface flex items-center gap-3 rounded-2xl border p-3.5">
          <span className="bg-brand/16 text-brand-text grid h-10 w-10 shrink-0 place-items-center rounded-xl">
            <TrophyIcon className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-body-sm font-bold text-ink">Man of the Match</p>
            {motmName ? (
              <p className="text-muted truncate text-3xs">{motmName}</p>
            ) : (
              <p className="text-dim text-3xs">Not set — the only thing left to do</p>
            )}
          </div>
          {canOperate && !motmName ? (
            <Button
              size="sm"
              className="h-9 shrink-0 rounded-field px-3.5 text-xs font-bold"
              onClick={() => setPicking(true)}
            >
              Pick
            </Button>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <Button variant="secondary" className="h-12 w-full justify-between rounded-field font-bold" onClick={goCard}>
            Full scorecard <span aria-hidden>›</span>
          </Button>
          <Button
            variant="secondary"
            className="h-12 w-full justify-between rounded-field font-bold"
            onClick={() => void share()}
          >
            Share the result <span aria-hidden>›</span>
          </Button>
        </div>

        <div className="mt-auto flex flex-col gap-2.5 pt-4">
          <p className="text-dim font-mono flex items-center justify-center gap-2 text-2xs font-semibold tracking-eyebrow uppercase">
            Scoring closed · Action locked
          </p>
          <Button variant="secondary" className="h-12 w-full rounded-field font-bold" onClick={() => goList(true)}>
            Back to fixtures
          </Button>
        </div>
      </div>

      <BaseDialog open={picking} onOpenChange={setPicking} sheet showClose contentClassName="tab:max-w-dialog">
        <DialogHeader>
          <DialogTitle>Man of the Match</DialogTitle>
          <DialogDescription className="font-mono text-3xs font-medium uppercase">
            Anyone from either playing XI
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          {candidates.length === 0 ? (
            <p className="text-muted text-sm" role="status">
              No playing eleven found. You can set Man of the Match later from the match card.
            </p>
          ) : (
            <ul className="border-border-subtle bg-surface max-h-[42vh] overflow-y-auto rounded-2xl border">
              {candidates.map((player) => {
                const picked = selectedId === player.id;
                return (
                  <li key={player.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(player.id)}
                      aria-pressed={picked}
                      className={cn(
                        'border-border-subtle focus-visible:outline-brand flex min-h-16.5 w-full items-center gap-2.5 border-b px-3.5 py-2.5 text-left last:border-b-0 focus-visible:outline-2 focus-visible:-outline-offset-2',
                        picked && 'bg-brand/10'
                      )}
                    >
                      <Avatar name={player.name} size="md" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm leading-normal font-bold text-ink">{player.name}</span>
                        {player.detail ? (
                          <span
                            className={cn(
                              'font-mono block truncate text-3xs font-medium',
                              picked ? 'text-brand-text' : 'text-dim'
                            )}
                          >
                            {player.detail}
                          </span>
                        ) : null}
                      </span>
                      {picked ? (
                        <span
                          className="bg-brand grid h-5.5 w-5.5 shrink-0 place-items-center rounded-full text-white"
                          aria-hidden
                        >
                          <CheckIcon className="h-3 w-3" strokeWidth={3.4} />
                        </span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          <p className="text-dim mt-3 text-center text-3xs leading-relaxed">
            Skippable — the result stands without it.
          </p>
        </DialogBody>
        <DialogFooter className="flex flex-col gap-2">
          <Button
            className="min-h-12"
            disabled={selectedId == null || isLoading}
            loading={isLoading}
            onClick={() => void saveMotm()}
          >
            Save Man of the Match
          </Button>
          <Button className="min-h-12" variant="secondary" disabled={isLoading} onClick={() => setPicking(false)}>
            Skip for now
          </Button>
        </DialogFooter>
      </BaseDialog>
    </div>
  );
}
