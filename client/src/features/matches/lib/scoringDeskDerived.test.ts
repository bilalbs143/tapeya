import { describe, expect, it } from 'vitest';

import { deriveChaseView, deriveOverView } from './scoringDeskDerived';

describe('deriveOverView', () => {
  it('counts legal balls and sums last-six runs from tokens', () => {
    const view = deriveOverView({
      deliveries: [{ token: '1' }, { token: 'wd' }, { token: '4' }, { token: 'nb+1' }],
      overNumber: 3,
      freeHit: true,
    });
    expect(view.overNum).toBe(3);
    expect(view.overBalls).toEqual(['1', 'wd', '4', 'nb+1']);
    expect(view.legalBallsInOver).toBe(2);
    expect(view.freeHitBall).toBe(3);
    expect(view.lastSix).toBe(6);
  });

  it('floors over number at 1 and clears lastSix when empty', () => {
    const view = deriveOverView({ deliveries: [], overNumber: 0, freeHit: false });
    expect(view.overNum).toBe(1);
    expect(view.freeHitBall).toBeNull();
    expect(view.lastSix).toBeNull();
  });
});

describe('deriveChaseView', () => {
  it('returns chase only in 2nd+ innings with target', () => {
    expect(deriveChaseView({ inningsNumber: 1, runsToWin: 40, target: 120, ballsRemaining: 30 })).toBeNull();
    expect(deriveChaseView({ inningsNumber: 2, runsToWin: 40, target: 120, ballsRemaining: 30 })).toEqual({
      need: 40,
      ballsLeft: 30,
      target: 120,
    });
  });
});
