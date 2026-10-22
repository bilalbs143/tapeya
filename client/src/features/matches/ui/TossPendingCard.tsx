import { Button } from '@/shared/ui/Button';

import { timeOf } from '../lib/format';
import type { Match } from '../model/schemas';

type TossPendingCardProps = {
  match: Match;
  onSaveToss: () => void;
};

export function TossPendingCard({ match, onSaveToss }: TossPendingCardProps) {
  const home = match.home?.short ?? 'HOME';
  const away = match.away?.short ?? 'AWAY';
  const when = timeOf(match.matchTime) || (match.matchDate ? match.matchDate : null) || 'Toss Not Saved';
  const meta = [
    when,
    match.overs != null ? `${match.overs} overs` : match.formatLabel,
    match.tournamentShort ?? 'Quick Match',
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="border-brand/45 bg-surface flex items-center gap-3 rounded-card border px-3.5 py-3.5">
      <div className="min-w-0 flex-1">
        <p className="truncate text-body-sm font-bold tracking-tight text-ink">
          {home} <span className="text-dim">vs</span> {away}
        </p>
        <p className="font-mono text-dim mt-1 truncate text-4xs font-medium tracking-wide uppercase">{meta}</p>
      </div>
      <Button
        size="sm"
        className="h-9 shrink-0 rounded-icon px-3.5 text-xs leading-normal font-extrabold"
        onClick={onSaveToss}
      >
        Save Toss
      </Button>
    </div>
  );
}
