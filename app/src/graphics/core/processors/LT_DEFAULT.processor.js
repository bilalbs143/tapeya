import { scoreboardBase } from './_shared/scoreboardBase';

/** @type {import('../../types.js').GraphicProcessor} */
export function processLtDefault(snapshot) {
  const { live } = snapshot;

  return {
    ...scoreboardBase(snapshot),
    inningsNumber: live.inningsNumber ?? 1,
    partnershipRuns: live.partnership?.runs ?? 0,
    partnershipBalls: live.partnership?.balls ?? 0,
    runsToWin: live.runsToWin ?? null,
    ballsRemaining: live.ballsRemaining ?? null,
    wicketsRemaining: live.wicketsRemaining ?? null,
    projectedScore: live.projectedScore ?? null,
  };
}
