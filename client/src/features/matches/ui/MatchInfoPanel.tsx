import { useNavigate } from 'react-router-dom';

import type { ScoringFixture } from '../model/scoringFixture';
import { matchRoutes } from '../routes';

type MatchInfoPanelProps = {
  matchId: number;
  fixture: ScoringFixture;
};

/** Info tab — venue, overs, sides, toss, settings link. */

export function MatchInfoPanel({ matchId, fixture }: MatchInfoPanelProps) {
  const navigate = useNavigate();
  const rows: Array<[string, string]> = [
    ['Match ID', String(matchId)],
    ['Venue', fixture.venue?.trim() || '—'],
    ['Overs', fixture.overs != null ? String(fixture.overs) : '—'],
    ['Players / side', fixture.playersPerSide != null ? String(fixture.playersPerSide) : '—'],
    ['Home', fixture.home?.name ?? '—'],
    ['Away', fixture.away?.name ?? '—'],
  ];

  if (fixture.tossWinnerId != null) {
    const winner =
      fixture.home?.id === fixture.tossWinnerId
        ? fixture.home.name
        : fixture.away?.id === fixture.tossWinnerId
          ? fixture.away.name
          : '—';
    rows.push(['Toss', `${winner}${fixture.choseTo ? ` · chose to ${fixture.choseTo}` : ''}`]);
  }

  return (
    <div className="flex flex-col gap-3 py-3">
      <p className="font-mono text-dim text-4xs font-bold tracking-eyebrow uppercase">Match Info</p>
      <ul className="border-border-subtle bg-surface overflow-hidden rounded-card border">
        {rows.map(([label, value], i) => (
          <li
            key={label}
            className={`flex min-h-11 items-center justify-between gap-3 px-3.5 ${
              i < rows.length - 1 ? 'border-border-subtle border-b' : ''
            }`}
          >
            <span className="font-mono text-dim text-4xs font-bold tracking-eyebrow uppercase">{label}</span>
            <span className="truncate text-right text-xs font-bold text-ink">{value}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => navigate(matchRoutes.settings(matchId))}
        className="border-border-subtle bg-surface focus-visible:outline-brand flex min-h-11 items-center justify-between rounded-panel border px-3.5 py-2.5 focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <span className="text-xs font-bold text-ink">Match Settings</span>
        <span className="text-dim font-mono text-3xs">Wagon Wheel · officials ›</span>
      </button>
    </div>
  );
}
