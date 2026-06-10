import { TeamLogo } from '@/components/TeamLogo';

/**
 * LiveScoreBox
 *
 * Batting team | score + overs | bowling team — benchmark-style three-column layout.
 *
 * @param {number} totalRuns
 * @param {number} totalWickets
 * @param {string} oversDisplay      e.g. "12.3"
 * @param {number|string|undefined} maxOvers
 * @param {string} [battingTeamName]
 * @param {string|null} [battingTeamLogo]
 * @param {string} [bowlingTeamName]
 * @param {string|null} [bowlingTeamLogo]
 */
export function LiveScoreBox({
  totalRuns = 0,
  totalWickets = 0,
  oversDisplay = '0',
  maxOvers,
  battingTeamName = '',
  battingTeamLogo = null,
  bowlingTeamName = '',
  bowlingTeamLogo = null,
}) {
  const maxOversDisplay = maxOvers != null && maxOvers !== '' ? maxOvers : '—';

  return (
    <div className="bg-surface flex items-center justify-between gap-3 rounded-[17px] px-4 py-4">
      <TeamColumn name={battingTeamName} logo={battingTeamLogo} />

      <div className="min-w-0 flex-1 text-center">
        <p className="text-[32px] leading-none font-bold text-white">
          {totalRuns} / {totalWickets}
        </p>
        <p className="text-muted mt-1 text-[13px]">
          ( Overs: {oversDisplay} / {maxOversDisplay} )
        </p>
      </div>

      <TeamColumn name={bowlingTeamName} logo={bowlingTeamLogo} />
    </div>
  );
}

function TeamColumn({ name, logo }) {
  return (
    <div className="flex w-[4.5rem] shrink-0 flex-col items-center gap-1.5">
      <TeamLogo name={name} logo={logo} variant="scoring" />
      <span className="w-full truncate text-center text-[10px] font-bold tracking-wide text-white uppercase">{name || '—'}</span>
    </div>
  );
}
