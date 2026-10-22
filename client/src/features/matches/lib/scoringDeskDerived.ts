/** Pure display derivations for the scoring desk — no React, no API. */

export type ScoringChaseView = {
  need: number;
  ballsLeft: number | null;
  target: number;
};

export type ScoringOverView = {
  overBalls: string[];
  overNum: number;
  legalBallsInOver: number;
  freeHitBall: number | null;
  lastSix: number | null;
};

export function deriveOverView(session: {
  deliveries: { token: string }[];
  overNumber: number;
  freeHit: boolean;
}): ScoringOverView {
  const overBalls = session.deliveries.map((d) => d.token);
  const overNum = Math.max(1, session.overNumber);
  const legalBallsInOver = session.deliveries.filter((d) => {
    const t = d.token.toLowerCase();
    return !t.includes('wd') && !t.includes('nb');
  }).length;
  const freeHitBall = session.freeHit ? legalBallsInOver + 1 : null;
  const lastSix =
    overBalls.length > 0
      ? overBalls.reduce((sum, token) => {
          const n = Number(String(token).replace(/\D/g, ''));
          return sum + (Number.isFinite(n) ? n : 0);
        }, 0)
      : null;

  return { overBalls, overNum, legalBallsInOver, freeHitBall, lastSix };
}

export function deriveChaseView(session: {
  inningsNumber: number;
  runsToWin: number | null;
  target: number | null;
  ballsRemaining: number | null;
}): ScoringChaseView | null {
  if (session.inningsNumber >= 2 && session.runsToWin != null && session.target != null) {
    return {
      need: session.runsToWin,
      ballsLeft: session.ballsRemaining,
      target: session.target,
    };
  }
  return null;
}
