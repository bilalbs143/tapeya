import { Link } from 'react-router-dom';

import { TeamLogo } from '@/components/TeamLogo';
import { formatDateTime } from '@/lib/utils/dateUtils';
import { StatusPill } from '@/ui/StatusPill';
import { matchStatusTone } from '@/ui/statusPillTones';

function matchHref(match) {
  const status = match.status;
  if (status === 'scheduled') return `/quick-match/${match.id}`;
  if (status === 'completed' || status === 'cancelled') {
    return `/scorecard/match/${match.id}`;
  }
  return `/organizer/scoring/match/${match.id}`;
}

function canShareScorecard(status) {
  return status === 'in_progress' || status === 'toss_done' || status === 'completed';
}

function DetailChevron({ className = '' }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ShareGlyph({ className = '' }) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" />
    </svg>
  );
}

function TeamRow({ team, fallback }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <TeamLogo name={team?.name} logo={team?.logo} variant="match" />
      <span className="truncate text-[15px] font-bold tracking-wide text-white uppercase">{team?.name ?? fallback}</span>
    </div>
  );
}

/**
 * My Matches list card — fixture-first layout with status pill + meta footer.
 */
export function QuickMatchListCard({ match, onShare }) {
  const home = match.home_team;
  const away = match.away_team;
  const status = match.status;
  const showShare = canShareScorecard(status);
  const when = formatDateTime(match.created_at);
  const formatLabel = match.cricket_format_label ?? match.cricket_format;
  const oversLabel = match.overs != null ? `${match.overs} ov` : null;

  const metaParts = [when || null, formatLabel || null, oversLabel].filter(Boolean);

  return (
    <Link
      to={matchHref(match)}
      className="bg-surface block overflow-hidden rounded-[17px] border border-[#FFFFFF0F] transition-colors active:bg-white/5"
    >
      <div className="flex items-start gap-3 p-4 pb-3.5">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <TeamRow team={home} fallback="Home" />
          <span className="text-muted pl-[2.125rem] text-[11px] font-semibold tracking-wider uppercase">vs</span>
          <TeamRow team={away} fallback="Away" />
        </div>

        <div className="flex shrink-0 flex-col items-end gap-3 pt-0.5">
          <StatusPill tone={matchStatusTone(status)} pulse={status === 'in_progress'} label={match.status_label ?? status} />

          {showShare ? (
            <button
              type="button"
              className="text-brand inline-flex items-center gap-1.5 text-[12px] font-bold tracking-wide uppercase"
              onClick={(event) => onShare?.(event, match)}
            >
              <ShareGlyph />
              Share
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-3 border-t border-white/5 px-4 py-2.5">
        {metaParts.length > 0 ? (
          <p className="text-muted flex min-w-0 flex-1 flex-wrap items-center gap-x-2.5 gap-y-1 text-[12px]">
            {metaParts.map((part, index) => (
              <span key={`${part}-${index}`} className="inline-flex items-center gap-2.5">
                {index > 0 ? <span className="h-3 w-px shrink-0 bg-white/20" aria-hidden /> : null}
                <span className={index === metaParts.length - 1 ? 'whitespace-nowrap' : undefined}>{part}</span>
              </span>
            ))}
          </p>
        ) : (
          <span className="flex-1" />
        )}
        <DetailChevron className="text-muted shrink-0" />
      </div>
    </Link>
  );
}

export default QuickMatchListCard;
