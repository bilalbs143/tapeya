import { Link } from 'react-router-dom';

import { useGetPlayerRecentMatchesQuery } from '@/store/api/playerApi';
import { LoaderBlock } from '@/ui/Loader';

/**
 * Recent matches on player profile — Quick badge when kind=quick.
 */
export function ProfileRecentMatches({ userId }) {
  const { data: matches = [], isLoading } = useGetPlayerRecentMatchesQuery({ userId, limit: 8 }, { skip: !userId });

  if (!userId || isLoading) {
    return isLoading ? <LoaderBlock label="Loading recent matches" className="mt-4 py-4" /> : null;
  }

  if (matches.length === 0) return null;

  return (
    <div className="mt-6">
      <p className="text-muted mb-3 text-[12px] font-bold tracking-wide uppercase">Recent Matches</p>
      <ul className="space-y-2">
        {matches.map((m) => {
          const title = `${m.home_team ?? 'Home'} vs ${m.away_team ?? 'Away'}`;
          const href =
            m.kind === 'quick'
              ? `/scorecard/match/${m.match_id}`
              : m.tournament_id
                ? `/scorecard/${m.tournament_id}/match/${m.match_id}`
                : `/scorecard/match/${m.match_id}`;

          return (
            <li key={m.match_id}>
              <Link
                to={href}
                className="bg-surface flex items-center justify-between gap-2 rounded-[12px] border border-[#FFFFFF0F] px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold text-white">{title}</p>
                  <p className="text-muted text-[11px]">
                    {m.match_date ?? '—'}
                    {m.runs != null ? ` · ${m.runs}(${m.balls})` : ''}
                  </p>
                </div>
                {m.kind === 'quick' ? (
                  <span className="bg-brand/20 text-brand shrink-0 rounded px-2 py-0.5 text-[10px] font-bold uppercase">
                    Quick
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
