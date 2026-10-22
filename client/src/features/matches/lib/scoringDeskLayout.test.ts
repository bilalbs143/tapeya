import { describe, expect, it } from 'vitest';

import type { ScoringFixture } from '../model/scoringFixture';
import type { ScoringSession } from '../model/scoringSession';
import { deriveScoringDeskLayout } from './scoringDeskLayout';

function fixture(partial: Partial<ScoringFixture> = {}): ScoringFixture {
  return {
    id: 1,
    status: 'live',
    tournamentId: null,
    kind: null,
    overs: 20,
    venue: null,
    canOperate: true,
    playersPerSide: 11,
    home: { id: 10, name: 'Home', short: 'HOM' },
    away: { id: 20, name: 'Away', short: 'AWY' },
    tossWinnerId: 10,
    choseTo: 'bat',
    resultSummary: null,
    analytics: { wagonWheelEnabled: false, umpires: '', scorers: '', commentators: '' },
    stream: null,
    ...partial,
  };
}

function session(partial: Partial<ScoringSession> = {}): ScoringSession {
  return {
    matchStatus: 'live',
    matchComplete: false,
    resultSummary: null,
    needsNewBatter: false,
    needsNewBowler: false,
    vacantEnd: null,
    inningsId: 1,
    inningsNumber: 1,
    battingTeamId: 10,
    bowlingTeamId: 20,
    striker: { id: 1, name: 'A', runs: 0, balls: 0, fours: 0, sixes: 0 },
    nonStriker: { id: 2, name: 'B', runs: 0, balls: 0, fours: 0, sixes: 0 },
    bowler: { id: 3, name: 'C', overs: '0.0', maidens: 0, runs: 0, wickets: 0, econ: '0.00' },
    runs: 0,
    wickets: 0,
    oversDisplay: '0.0',
    overNumber: 0,
    ballsInOver: 0,
    freeHit: false,
    inningsComplete: false,
    target: null,
    runsToWin: null,
    ballsRemaining: null,
    currentRunRate: '0.00',
    requiredRunRate: null,
    extras: 0,
    partnership: null,
    deliveries: [],
    homeXi: [
      { id: 1, name: 'A' },
      { id: 2, name: 'B' },
    ],
    awayXi: [{ id: 3, name: 'C' }],
    wagonWheelEnabled: false,
    ...partial,
  } as ScoringSession;
}

describe('deriveScoringDeskLayout', () => {
  it('marks first-ball setup when crease incomplete and no balls yet', () => {
    const layout = deriveScoringDeskLayout({
      session: session({
        striker: null,
        nonStriker: null,
        bowler: null,
        needsNewBatter: true,
        needsNewBowler: true,
        homeXi: Array.from({ length: 11 }, (_, i) => ({ id: i + 1, name: `P${i}` })),
        awayXi: Array.from({ length: 11 }, (_, i) => ({ id: i + 20, name: `A${i}` })),
      }),
      fixture: fixture(),
      tab: 'pad',
      summaryOpen: false,
      declareOpen: false,
      creaseOpen: true,
      connectionState: 'online',
    });
    expect(layout.settingFirstBall).toBe(true);
    expect(layout.showCreaseDialog).toBe(true);
    expect(layout.battersDone).toBe(false);
  });

  it('locks pad note when connection is stale', () => {
    const layout = deriveScoringDeskLayout({
      session: session(),
      fixture: fixture(),
      tab: 'pad',
      summaryOpen: false,
      declareOpen: false,
      creaseOpen: false,
      connectionState: 'stale',
    });
    expect(layout.lockNote).toMatch(/sync conflict/i);
    expect(layout.canUndo).toBe(false);
  });
});
