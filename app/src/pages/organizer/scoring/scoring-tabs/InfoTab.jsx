const CLOUDFRONT_APP_BASE = 'https://d1nmw2vhka3zp0.cloudfront.net/app';

const teamMatchIcon = `${CLOUDFRONT_APP_BASE}/images/icons/team-match-icon.svg`;

const DASH = '—';

export function InfoTab({ match, matchId, liveScore: liveScoreProp }) {
  if (!match) return null;
  const {
    teamA,
    teamB,
    venue,
    overs,
    playersPerSide,
    matchDate,
    matchTime,
    toss,
  } = match;
  const teamATitle = teamA?.name ?? '';
  const teamBTitle = teamB?.name ?? '';
  const tossWinnerName =
    toss?.winner === 'A' ? (teamA?.name ?? '') : (teamB?.name ?? '');
  const tossDecisionLabel =
    toss?.decision === 'bat'
      ? 'Bat'
      : toss?.decision === 'bowl'
        ? 'Bowl'
        : DASH;
  const dateTimeLabel =
    [matchDate, matchTime].filter(Boolean).join(' ') || DASH;

  const matchIdLabel =
    matchId != null && String(matchId).trim() !== '' ? String(matchId) : DASH;
  const liveScore = liveScoreProp ?? null;
  const currentScoreLabel =
    liveScore &&
    typeof liveScore.totalRuns === 'number' &&
    typeof liveScore.totalWickets === 'number' &&
    typeof liveScore.oversDisplay === 'string'
      ? `${liveScore.totalRuns}/${liveScore.totalWickets} (${liveScore.oversDisplay} ov)`
      : null;

  return (
    <div className="mt-6 pb-10">
      <div className="flex items-stretch">
        <div className="flex flex-1 flex-col items-center justify-center gap-1 rounded-[17px] border border-[#FFFFFF0F] bg-[#141412] p-4">
          <img
            src={teamMatchIcon}
            alt=""
            className="h-10 w-10 shrink-0"
            aria-hidden
          />
          <span className="text-[16px] font-bold tracking-wide text-white uppercase">
            {teamATitle || DASH}
          </span>
        </div>
        <div className="relative z-10 -mx-3 flex shrink-0 items-center">
          <span className="flex h-13 w-13 shrink-0 items-center justify-center rounded-full border-[8px] border-black bg-[#DA9811] text-[12px] font-bold tracking-wide text-[#080807] uppercase">
            VS
          </span>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-1 rounded-[17px] border border-[#FFFFFF0F] bg-[#141412] p-4">
          <img
            src={teamMatchIcon}
            alt=""
            className="h-10 w-10 shrink-0"
            aria-hidden
          />
          <span className="text-[16px] font-bold tracking-wide text-white uppercase">
            {teamBTitle || DASH}
          </span>
        </div>
      </div>

      <div className="mt-6 py-5">
        <div className="space-y-4 text-[12px]">
          <InfoRow
            label="Playing"
            value={playersPerSide ? `${playersPerSide} per side` : DASH}
          />
          <InfoRow label="Overs" value={overs ?? DASH} />
          <InfoRow label="Venue" value={venue || DASH} />
          <InfoRow label="Date & time" value={dateTimeLabel} />
          <InfoRow label="Toss won by" value={tossWinnerName} />
          <InfoRow label="Decided to" value={tossDecisionLabel} />
          {currentScoreLabel != null && (
            <InfoRow label="Current score" value={currentScoreLabel} />
          )}
          <InfoRow label="Match ID" value={matchIdLabel} />
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center text-[12px]">
      <span className="text-[12px] font-bold whitespace-nowrap text-[#A2A6AB] uppercase">
        {label}
      </span>
      <span className="mx-4 flex-1 border-b-2 border-dotted border-[#FFFFFF66]" />
      <span className="text-[12px] font-normal whitespace-nowrap text-[#A2A6AB]">
        {value}
      </span>
    </div>
  );
}
