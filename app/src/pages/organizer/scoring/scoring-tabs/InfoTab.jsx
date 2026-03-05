import teamMatchIcon from '@/assets/images/icons/team-match-icon.svg';

import { DEFAULT_MATCH_CONFIG } from '../matchConfig';

const DASH = '—';

export function InfoTab({ match: matchProp, matchId, liveScore: liveScoreProp }) {
  const match = { ...DEFAULT_MATCH_CONFIG, ...matchProp };
  const { teamA, teamB, venue, format, ballType, overs, playersPerSide, matchDate, matchTime, toss } = match;
  const teamATitle = teamA?.name || 'Team A';
  const teamBTitle = teamB?.name || 'Team B';
  const tossWinnerName = toss?.winner === 'A' ? (teamA?.name || 'Team A') : (teamB?.name || 'Team B');
  const tossDecisionLabel = toss?.decision === 'bat' ? 'Bat' : toss?.decision === 'bowl' ? 'Bowl' : DASH;
  const dateTimeLabel = [matchDate, matchTime].filter(Boolean).join(' ') || DASH;

  const matchIdLabel = matchId != null && String(matchId).trim() !== '' ? String(matchId) : DASH;
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
          <img src={teamMatchIcon} alt="" className="h-10 w-10 shrink-0" aria-hidden />
          <span className="text-[16px] font-bold uppercase tracking-wide text-white">
            {teamATitle}
          </span>
          {!teamA?.name && (
            <span className="text-[13px] font-normal text-[#A2A6AB]">Team A</span>
          )}
        </div>
        <div className="relative z-10 flex shrink-0 items-center -mx-3">
          <span className="flex h-13 w-13 shrink-0 items-center justify-center rounded-full border-[8px] border-black bg-[#DA9811] text-[12px] font-bold uppercase tracking-wide text-[#080807]">
            VS
          </span>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-1 rounded-[17px] border border-[#FFFFFF0F] bg-[#141412] p-4">
          <img src={teamMatchIcon} alt="" className="h-10 w-10 shrink-0" aria-hidden />
          <span className="text-[16px] font-bold uppercase tracking-wide text-white">
            {teamBTitle}
          </span>
          {!teamB?.name && (
            <span className="text-[13px] font-normal text-[#A2A6AB]">Team B</span>
          )}
        </div>
      </div>

      <div className="mt-6 py-5">
        <div className="space-y-4 text-[12px]">
          <InfoRow label="Format" value={format === 'tournament' ? 'Tournament' : format === 'club' ? 'Club' : format || DASH} />
          <InfoRow label="Ball type" value={ballType === 'leather' ? 'Leather Ball' : ballType === 'tennis' ? 'Tennis Ball' : ballType || DASH} />
          <InfoRow label="Playing" value={playersPerSide ? `${playersPerSide} per side` : DASH} />
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
      <span className="whitespace-nowrap text-[12px] font-bold uppercase text-[#A2A6AB]">
        {label}
      </span>
      <span className="mx-4 flex-1 border-b-2 border-dotted border-[#FFFFFF66]" />
      <span className="whitespace-nowrap text-[12px] font-normal text-[#A2A6AB]">{value}</span>
    </div>
  );
}
