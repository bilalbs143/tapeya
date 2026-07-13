import { toNum } from '../utils.js';
import { buildMatchContext, tournamentLabelOnly } from './_shared/matchContext';
import { mergePlayerPropsFromSession } from './_shared/resolvePlayer';

/** @type {import('../types.js').GraphicProcessor} */
export function processWagonWheel(snapshot) {
  // Return null when the feature is disabled so the overlay stays fully
  // transparent rather than showing an empty chart frame on OBS.
  if (!snapshot.live.wagonWheelEnabled) return null;

  const mc = buildMatchContext(snapshot);
  return {
    homeTeam: mc.homeTeam,
    awayTeam: mc.awayTeam,
    tournamentLabel: tournamentLabelOnly(snapshot),
    ballHistory: snapshot.live.wagonWheelBalls,
    enabled: true,
  };
}

/** @type {import('../types.js').GraphicProcessor} */
export function processBatsmanWagonWheel(snapshot) {
  if (!snapshot.live.wagonWheelEnabled) return null;

  const p = snapshot.payload ?? {};
  const uid = toNum(p.user_id);
  const allBalls = snapshot.live.wagonWheelBalls;
  const ballHistory = uid != null ? allBalls.filter((ball) => ball.strikerId === uid) : allBalls;

  const mc = buildMatchContext(snapshot);

  return {
    ...mergePlayerPropsFromSession(snapshot, p),
    homeTeam: mc.homeTeam,
    awayTeam: mc.awayTeam,
    tournamentLabel: tournamentLabelOnly(snapshot),
    ballHistory,
    enabled: true,
  };
}
