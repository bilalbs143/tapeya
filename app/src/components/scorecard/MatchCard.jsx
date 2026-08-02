import { Link } from 'react-router-dom';

import { CommentaryText } from '@/components/scorecard/CommentaryText';
import { TeamLogo } from '@/components/TeamLogo';

const STATUS_STYLES = {
  upcoming: 'text-brand',
  live: 'text-brand',
  result: 'text-brand',
};

/** Live indicator: circle with white border, white & red waving bars */
function LiveIcon() {
  return (
    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-white bg-transparent">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <rect x="3" y="4" width="2" height="4" rx="1" fill="white" className="live-icon-bar" style={{ animationDelay: '0ms' }} />
        <rect
          x="7"
          y="3"
          width="2"
          height="6"
          rx="1"
          fill="#E53935"
          className="live-icon-bar"
          style={{ animationDelay: '200ms' }}
        />
      </svg>
    </div>
  );
}

function TeamAvatar({ team, accent }) {
  return <TeamLogo team={team} variant="scorecardCard" accent={accent} />;
}

/** Parse annotated scores like "27/1 (4.4/50 OV, T:235)" into current score and overs */
function parseAnnotatedScore(score) {
  if (!score || typeof score !== 'string') return { current: score, overs: null };
  const idx = score.indexOf(' (');
  if (idx === -1) return { current: score, overs: null };
  return {
    current: score.slice(0, idx),
    overs: score.slice(idx),
  };
}

function ScoreValue({ score, emphasize }) {
  if (score == null || score === '') return null;
  const parsed = emphasize ? parseAnnotatedScore(score) : { current: score, overs: null };
  if (!parsed.overs) {
    return (
      <span className={`shrink-0 text-[14px] ${emphasize ? 'text-brand font-bold' : 'font-medium text-white'}`}>{score}</span>
    );
  }
  return (
    <span className="shrink-0 text-right">
      <span className="text-muted text-[13px]">{parsed.overs}</span>{' '}
      <span className="text-brand text-[14px] font-bold">{parsed.current}</span>
    </span>
  );
}

function normalizeTeam(team, fallbackName = 'Team', fallbackInitial = 'T') {
  if (team && typeof team === 'object') {
    return {
      name: team.name ?? fallbackName,
      initial: (team.initial ?? String(fallbackName).charAt(0)).toUpperCase(),
      flag: team.flag ?? null,
      logo: team.logo ?? null,
    };
  }
  return { name: fallbackName, initial: fallbackInitial, flag: null, logo: null };
}

/** Normalise API status to MatchCard status */
function normaliseStatus(raw) {
  if (raw === 'in_progress' || raw === 'live') return 'live';
  if (raw === 'completed' || raw === 'finished') return 'result';
  return 'upcoming';
}

/** Support both API shape (home_team, away_team, id) and normalised shape (team1, team2, matchId) */
function getMatchDisplay(match) {
  const team1 = match.team1 ?? match.home_team ?? match.homeTeam;
  const team2 = match.team2 ?? match.away_team ?? match.awayTeam;
  const rawStatus = match.status ?? 'scheduled';
  const status =
    rawStatus === 'upcoming' || rawStatus === 'live' || rawStatus === 'result' ? rawStatus : normaliseStatus(rawStatus);
  const matchId =
    match.matchId ??
    (team1?.name && team2?.name ? `${team1.name} vs ${team2.name}` : null) ??
    (match.id != null ? `Match ${match.id}` : '');
  return {
    status,
    matchId,
    league: match.league ?? match.tournament_id,
    t1: normalizeTeam(team1, 'Home team', 'H'),
    t2: normalizeTeam(team2, 'Away team', 'A'),
    score1: match.score1,
    score2: match.score2,
    meta: match.meta ?? {},
  };
}

export function MatchCard({ match, showScheduleTableLinks = true, to = null, compact = false }) {
  if (!match || typeof match !== 'object') return null;

  const { status, matchId, league, t1, t2, score1, score2, meta } = getMatchDisplay(match);
  const isUpcoming = status === 'upcoming';
  const isLive = status === 'live';
  const isStreamLive = match.stream?.status === 'live';
  const isResult = status === 'result';
  const useLiveLayout = isLive || isResult;
  const score1Annotated = useLiveLayout && typeof score1 === 'string' && score1.includes(' (');
  const score2Annotated = useLiveLayout && typeof score2 === 'string' && score2.includes(' (');
  const emphasizeScore1 = score1Annotated;
  const emphasizeScore2 = score2Annotated || (useLiveLayout && !score1Annotated);
  const topRowClass = compact ? 'mb-3 flex items-center justify-between gap-2' : 'mb-4 flex items-center justify-between gap-3';
  const liveRowsClass = compact ? 'mb-3 flex flex-col gap-2' : 'mb-4 flex flex-col gap-3';
  const commentaryClass = compact ? 'truncate' : 'mb-3';
  const surfaceClass = compact
    ? 'bg-surface block h-full rounded-[17px] p-3 transition-opacity active:opacity-90'
    : 'bg-surface block rounded-[17px] p-4 transition-opacity active:opacity-90';

  const cardInner = (
    <>
      {/* Top row: status left, group badge (optional), match title right */}
      <div className={topRowClass}>
        <div className="flex items-center gap-2">
          {(isLive || isStreamLive) && <LiveIcon />}
          <span className={`text-[12px] font-bold uppercase ${STATUS_STYLES[status]}`}>{status}</span>
          {isStreamLive && (
            <span className="rounded bg-[#E53935] px-1.5 py-0.5 text-[10px] font-bold text-white uppercase">Live</span>
          )}
          {match.group_index != null && (
            <span className="bg-surface-border text-muted rounded px-2 py-0.5 text-[11px] font-medium">
              Group {match.group_index}
            </span>
          )}
        </div>
        <p className={`text-right text-[13px] ${useLiveLayout ? 'text-muted' : 'text-white'}`}>{matchId}</p>
      </div>

      {/* Middle: horizontal for UPCOMING, vertical stacked for LIVE/RESULT */}
      {isUpcoming ? (
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <TeamAvatar team={t1} accent="green" />
            <span className="truncate text-[14px] font-semibold text-white">{t1.name}</span>
          </div>
          <span className="text-brand shrink-0 text-[14px] font-semibold">VS</span>
          <div className="flex min-w-0 items-center justify-end gap-2">
            <TeamAvatar team={t2} accent="orange" />
            <span className="truncate text-[14px] font-semibold text-white">{t2.name}</span>
          </div>
        </div>
      ) : (
        <div className={liveRowsClass}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <TeamAvatar team={t1} accent="green" />
              <span className="truncate text-[14px] font-semibold text-white">{t1.name}</span>
            </div>
            <ScoreValue score={score1} emphasize={emphasizeScore1} />
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <TeamAvatar team={t2} accent="orange" />
              <span className="truncate text-[14px] font-semibold text-white">{t2.name}</span>
            </div>
            <ScoreValue score={score2} emphasize={emphasizeScore2} />
          </div>
        </div>
      )}

      {/* Bottom: time row (upcoming) or commentary (live/result) */}
      {isUpcoming && (meta?.startsIn || meta?.time) && (
        <div className="mb-3 flex items-center gap-4 text-[13px]">
          {meta?.startsIn && <span className="text-[#BBBBBB]">Starts in {meta.startsIn}</span>}
          {meta?.time && <span className="text-brand">{meta.time}</span>}
        </div>
      )}
      {(isLive || isResult) && meta?.commentary && (
        <p className={commentaryClass}>
          <CommentaryText
            text={meta.commentary}
            className={compact ? 'text-muted text-[12px]' : 'text-[13px] text-[#BBBBBB]'}
            numberClassName="font-semibold text-[#CCCCCC]"
          />
        </p>
      )}

      {showScheduleTableLinks && (
        <div className="flex gap-3">
          {(() => {
            const leagueId = match.tournament_id ?? league;
            if (!leagueId) return null;
            return (
              <>
                <Link to={`/scorecard/${leagueId}?tab=schedule`} className="text-muted text-[14px] underline underline-offset-2">
                  Schedule
                </Link>
                <Link to={`/scorecard/${leagueId}?tab=table`} className="text-muted text-[14px] underline underline-offset-2">
                  Table
                </Link>
              </>
            );
          })()}
        </div>
      )}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={surfaceClass}>
        {cardInner}
      </Link>
    );
  }

  return <div className={compact ? 'bg-surface h-full rounded-[17px] p-3' : 'bg-surface rounded-[17px] p-4'}>{cardInner}</div>;
}
