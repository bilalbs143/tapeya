/**
 * LiveScoreBox
 *
 * Displays the current innings score (runs-wickets, overs).
 * Pure presentational — no state, no side effects.
 *
 * @param {number} totalRuns
 * @param {number} totalWickets
 * @param {string} oversDisplay      e.g. "12.3"
 * @param {number|string|undefined} maxOvers
 */
export function LiveScoreBox({
  totalRuns = 0,
  totalWickets = 0,
  oversDisplay = '0',
  maxOvers,
}) {
  const maxOversDisplay = maxOvers != null && maxOvers !== '' ? maxOvers : '—';

  return (
    <div className="m-auto max-w-fit rounded-[17px] bg-[#141412] px-6 py-4 text-center">
      {/* Score */}
      <div className="flex items-baseline justify-center gap-1">
        <span className="text-[36px] leading-none font-bold text-white">
          {totalRuns}-{totalWickets}
        </span>
        <span className="text-[16px] font-bold text-white/90">
          ({oversDisplay} / {maxOversDisplay})
        </span>
      </div>
    </div>
  );
}
