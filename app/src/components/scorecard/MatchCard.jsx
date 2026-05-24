import { Link } from 'react-router-dom';

import { CommentaryText } from '@/components/scorecard/CommentaryText';
import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';

const karachiFlag = `${CLOUDFRONT_APP_BASE}/images/icons/karachi-flag.png`;
const rawalpindiFlag = `${CLOUDFRONT_APP_BASE}/images/icons/rawalpindi-flag.png`;

const FLAGS = { karachi: karachiFlag, rawalpindi: rawalpindiFlag };

const STATUS_STYLES = {
  upcoming: 'text-[#DA9811]',
  live: 'text-[#DA9811]',
  result: 'text-[#DA9811]',
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

function TeamLogo({ initial, accent = 'green' }) {
  const bg = accent === 'green' ? 'bg-emerald-600' : 'bg-amber-500';
  return (
    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${bg} text-xs font-bold text-white`}>
      {initial}
    </div>
  );
}

function TeamAvatar({ team, accent }) {
  const flagSrc = team.flag ? FLAGS[team.flag] : null;
  if (flagSrc) {
    return <img src={flagSrc} alt="" className="h-5 w-5 shrink-0 rounded-md object-cover" aria-hidden />;
  }
  return <TeamLogo initial={team.initial} accent={accent} />;
}

/** Parse score2 like "27/1 (4.4/50 OV, T:235)" into current score and overs */
function parseLiveScore2(score2) {
  if (!score2 || typeof score2 !== 'string') return { current: score2, overs: null };
  const idx = score2.indexOf(' (');
  if (idx === -1) return { current: score2, overs: null };
  return {
    current: score2.slice(0, idx),
    overs: score2.slice(idx),
  };
}

function normalizeTeam(team, fallbackName = 'Team', fallbackInitial = 'T') {
  if (team && typeof team === 'object') {
    return {
      name: team.name ?? fallbackName,
      initial: (team.initial ?? String(fallbackName).charAt(0)).toUpperCase(),
      flag: team.flag ?? null,
    };
  }
  return { name: fallbackName, initial: fallbackInitial, flag: null };
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

export function MatchCard({ match, showScheduleTableLinks = true, to = null }) {
  if (!match || typeof match !== 'object') return null;

  const { status, matchId, league, t1, t2, score1, score2, meta } = getMatchDisplay(match);
  const isUpcoming = status === 'upcoming';
  const isLive = status === 'live';
  const isStreamLive = match.stream?.status === 'live';
  const isResult = status === 'result';
  const useLiveLayout = isLive || isResult;
  const liveScore2 = useLiveLayout ? parseLiveScore2(score2) : null;

  const cardInner = (
    <>
      {/* Top row: status left, group badge (optional), match title right */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {(isLive || isStreamLive) && <LiveIcon />}
          <span className={`text-[12px] font-bold uppercase ${STATUS_STYLES[status]}`}>{status}</span>
          {isStreamLive && (
            <span className="rounded bg-[#E53935] px-1.5 py-0.5 text-[10px] font-bold text-white uppercase">Live</span>
          )}
          {match.group_index != null && (
            <span className="rounded bg-[#1A1A1A] px-2 py-0.5 text-[11px] font-medium text-[#A2A6AB]">
              Group {match.group_index}
            </span>
          )}
        </div>
        <p className={`text-right text-[13px] ${useLiveLayout ? 'text-[#A2A6AB]' : 'text-white'}`}>{matchId}</p>
      </div>

      {/* Middle: horizontal for UPCOMING, vertical stacked for LIVE/RESULT */}
      {isUpcoming ? (
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <TeamAvatar team={t1} accent="green" />
            <span className="truncate text-[14px] font-semibold text-white">{t1.name}</span>
          </div>
          <span className="shrink-0 text-[14px] font-semibold text-[#DA9811]">VS</span>
          <div className="flex min-w-0 items-center justify-end gap-2">
            <TeamAvatar team={t2} accent="orange" />
            <span className="truncate text-[14px] font-semibold text-white">{t2.name}</span>
          </div>
        </div>
      ) : (
        <div className="mb-4 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <TeamAvatar team={t1} accent="green" />
              <span className="truncate text-[14px] font-semibold text-white">{t1.name}</span>
            </div>
            {score1 != null && score1 !== '' && <span className="shrink-0 text-[14px] font-medium text-white">{score1}</span>}
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <TeamAvatar team={t2} accent="orange" />
              <span className="truncate text-[14px] font-semibold text-white">{t2.name}</span>
            </div>
            {score2 != null && score2 !== '' && (
              <span className="shrink-0 text-right">
                {liveScore2?.overs && <span className="text-[13px] text-[#A2A6AB]">{liveScore2.overs}</span>}
                {liveScore2?.overs && ' '}
                <span className="text-[14px] font-bold text-[#DA9811]">{liveScore2?.current ?? score2}</span>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Bottom: time row (upcoming) or commentary (live/result) */}
      {isUpcoming && (meta?.startsIn || meta?.time) && (
        <div className="mb-3 flex items-center gap-4 text-[13px]">
          {meta?.startsIn && <span className="text-[#BBBBBB]">Starts in {meta.startsIn}</span>}
          {meta?.time && <span className="text-[#DA9811]">{meta.time}</span>}
        </div>
      )}
      {(isLive || isResult) && meta?.commentary && (
        <p className="mb-3">
          <CommentaryText
            text={meta.commentary}
            className="text-[13px] text-[#BBBBBB]"
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
                <Link
                  to={`/scorecard/${leagueId}?tab=schedule`}
                  className="text-[14px] text-[#A2A6AB] underline underline-offset-2"
                >
                  Schedule
                </Link>
                <Link to={`/scorecard/${leagueId}?tab=table`} className="text-[14px] text-[#A2A6AB] underline underline-offset-2">
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
      <Link to={to} className="block rounded-[17px] bg-[#141412] p-4 transition-opacity active:opacity-90">
        {cardInner}
      </Link>
    );
  }

  return <div className="rounded-[17px] bg-[#141412] p-4">{cardInner}</div>;
}
