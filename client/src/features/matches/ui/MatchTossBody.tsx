import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';

import type { ScoringSide } from '../model/scoringFixture';
import type { useMatchToss } from './useMatchToss';

type MatchTossFlow = ReturnType<typeof useMatchToss>;

type MatchTossBodyProps = {
  flow: MatchTossFlow;
};

function TeamOption({ team, selected, onClick }: { team: ScoringSide; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative flex flex-1 flex-col items-center rounded-card border px-3 py-4 text-center',
        selected ? 'border-brand bg-brand/12' : 'border-border-subtle bg-surface'
      )}
    >
      <span className="border-border bg-surface text-brand-text font-mono mb-2 grid h-12 w-12 place-items-center rounded-panel border text-sm font-extrabold">
        {team.short.slice(0, 2)}
      </span>
      <span className="truncate text-sm font-extrabold text-ink">{team.short}</span>
      <span className="text-dim mt-0.5 truncate text-4xs">{team.name}</span>
    </button>
  );
}

function Decision({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex min-h-14 flex-1 items-center justify-center rounded-panel border text-body-lg font-extrabold',
        selected ? 'border-brand bg-brand text-white' : 'border-border-subtle bg-surface text-body'
      )}
    >
      {label}
    </button>
  );
}

/** Bottom sheet: winner, bat/bowl, start scoring. */
export function MatchTossBody({ flow }: MatchTossBodyProps) {
  const {
    home,
    away,
    winner,
    setWinner,
    decision,
    setDecision,
    decisions,
    ready,
    subtitle,
    summary,
    saving,
    save,
    dismiss,
  } = flow;

  if (!home || !away) return null;

  return (
    <div className="bg-veil-deep relative flex h-full flex-col justify-end">
      <button type="button" aria-label="Dismiss" className="absolute inset-0" onClick={dismiss} />
      <div className="border-border-subtle bg-surface relative z-10 max-h-[92%] overflow-y-auto rounded-t-sheet border-t px-4 pt-2 pb-5 tab:mx-auto tab:mb-8 tab:w-full tab:max-w-[420px] tab:rounded-card tab:border">
        <span aria-hidden className="bg-border mx-auto mt-1 mb-4 block h-1 w-9 rounded-full" />
        <h1 className="text-title font-extrabold tracking-tight text-ink">Toss</h1>
        <p className="font-mono text-dim mt-1 truncate text-3xs font-medium tracking-eyebrow uppercase">{subtitle}</p>

        <p className="font-mono text-dim mt-5 mb-2.5 text-4xs font-bold tracking-eyebrow uppercase">
          Who won the toss?
        </p>
        <div className="mb-5 flex gap-2.5">
          <TeamOption team={home} selected={winner === 'home'} onClick={() => setWinner('home')} />
          <TeamOption team={away} selected={winner === 'away'} onClick={() => setWinner('away')} />
        </div>

        <p className="font-mono text-dim mb-2.5 text-4xs font-bold tracking-eyebrow uppercase">And Decided To</p>
        <div className="mb-4 flex gap-2.5">
          {decisions.map((option) => (
            <Decision
              key={option.value}
              label={option.label}
              selected={decision === option.value}
              onClick={() => setDecision(option.value)}
            />
          ))}
        </div>

        {ready && summary ? (
          <p className="border-border-subtle bg-surface mb-4 rounded-panel border px-3.5 py-3.5 text-xs font-semibold text-ink">
            {summary}
          </p>
        ) : (
          <p className="text-dim mb-4 text-2xs leading-relaxed">
            Saving the toss locks this fixture and opens the scoring pad.
          </p>
        )}

        <Button
          variant="positive"
          className="min-h-14 w-full font-extrabold"
          disabled={!ready}
          loading={saving}
          onClick={() => void save()}
        >
          Start Scoring
        </Button>
      </div>
    </div>
  );
}
