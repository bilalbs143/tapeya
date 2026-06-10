import { TeamLogo } from '@/components/TeamLogo';
import { useScoringMatch } from '@/context/ScoringMatchContext';

const DASH = '—';

export function InfoTab({ liveScore: liveScoreProp }) {
  const { match, matchId } = useScoringMatch();
  if (!match) return null;
  const { homeTeam, awayTeam, venue, overs, playersPerSide, matchDate, matchTime, toss } = match;
  const homeName = (homeTeam?.name ?? '').trim() || DASH;
  const awayName = (awayTeam?.name ?? '').trim() || DASH;
  const tossWinnerName = toss?.winner === 'A' ? homeName : toss?.winner === 'B' ? awayName : DASH;
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
    <div className="mt-4 pb-10">
      <div className="mx-auto flex w-full max-w-2xl items-stretch">
        <div className="bg-surface flex flex-1 flex-col items-center justify-center gap-1 rounded-[17px] border border-[#FFFFFF0F] p-4">
          <TeamLogo team={homeTeam} name={homeName} variant="match" />
          <span className="text-center text-[16px] font-bold tracking-wide text-white uppercase">{homeName}</span>
        </div>
        <div className="relative z-10 -mx-3 flex shrink-0 items-center">
          <span className="bg-brand text-ink flex h-13 w-13 shrink-0 items-center justify-center rounded-full border-[8px] border-black text-[12px] font-bold tracking-wide uppercase">
            VS
          </span>
        </div>
        <div className="bg-surface flex flex-1 flex-col items-center justify-center gap-1 rounded-[17px] border border-[#FFFFFF0F] p-4">
          <TeamLogo team={awayTeam} name={awayName} variant="match" />
          <span className="text-center text-[16px] font-bold tracking-wide text-white uppercase">{awayName}</span>
        </div>
      </div>

      <div className="mt-6 py-5">
        <div className="space-y-4 text-[12px]">
          <InfoRow label="Playing" value={playersPerSide ? `${playersPerSide} per side` : DASH} />
          <InfoRow label="Overs" value={overs ?? DASH} />
          <InfoRow label="Venue" value={venue || DASH} />
          <InfoRow label="Date & Time" value={dateTimeLabel} />
          <InfoRow label="Toss Won By" value={tossWinnerName} />
          <InfoRow label="Decided To" value={tossDecisionLabel} />
          {currentScoreLabel != null && <InfoRow label="Current Score" value={currentScoreLabel} />}
          <InfoRow label="Match ID" value={matchIdLabel} />
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center text-[12px]">
      <span className="text-muted text-[12px] font-bold whitespace-nowrap uppercase">{label}</span>
      <span className="mx-4 flex-1 border-b-2 border-dotted border-[#FFFFFF66]" />
      <span className="text-muted text-[12px] font-normal whitespace-nowrap">{value}</span>
    </div>
  );
}
