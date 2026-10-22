import { describe, expect, it } from 'vitest';

import type { ScoringFixture } from '../model/scoringFixture';
import type { ScoringSession } from '../model/scoringSession';
import {
  chaseCommentary,
  defaultFanTab,
  fanPhase,
  fanTabDefs,
  isNotStarted,
  resolveFanTab,
  toMatchBandModel,
} from './fanMatchView';

const fixture: ScoringFixture = {
  id: 1,
  status: 'in_progress',
  tournamentId: 1,
  kind: 'tournament',
  overs: 20,
  venue: 'Gaddafi Stadium',
  canOperate: false,
  playersPerSide: 11,
  home: { id: 10, name: 'City Blues', short: 'CBL' },
  away: { id: 11, name: 'Karachi Kings', short: 'KKR' },
  tossWinnerId: 10,
  choseTo: 'bat',
  resultSummary: null,
  analytics: {
    wagonWheelEnabled: false,
    umpires: '',
    scorers: '',
    commentators: '',
  },
  stream: null,
};

const session: ScoringSession = {
  matchStatus: 'in_progress',
  matchComplete: false,
  resultSummary: null,
  needsNewBatter: false,
  needsNewBowler: false,
  vacantEnd: null,
  inningsId: 1,
  inningsNumber: 2,
  battingTeamId: 11,
  bowlingTeamId: 10,
  striker: { id: 1, name: 'Ali', runs: 12, balls: 8, fours: 1, sixes: 0 },
  nonStriker: { id: 2, name: 'Bilal', runs: 4, balls: 6, fours: 0, sixes: 0 },
  bowler: { id: 3, name: 'Sara', overs: '2.3', maidens: 0, runs: 18, wickets: 1, econ: '7.20' },
  runs: 48,
  wickets: 2,
  oversDisplay: '6.3',
  overNumber: 7,
  ballsInOver: 3,
  freeHit: false,
  inningsComplete: false,
  target: 121,
  runsToWin: 73,
  ballsRemaining: 81,
  currentRunRate: '7.38',
  requiredRunRate: '5.40',
  deliveries: [
    { token: '4', chip: null },
    { token: '1', chip: null },
  ],
  extras: 4,
  partnership: { runs: 30, balls: 24 },
  homeXi: [],
  awayXi: [],
  wagonWheelEnabled: true,
};

describe('fanMatchView', () => {
  it('maps phase and not-started tabs', () => {
    expect(fanPhase('in_progress')).toBe('live');
    expect(fanPhase('completed')).toBe('result');
    expect(isNotStarted('scheduled')).toBe(true);
    expect(fanTabDefs('scheduled').map((t) => t.id)).toEqual(['info', 'squads', 'fixture']);
    expect(fanTabDefs('scheduled', { hasTable: true }).map((t) => t.id)).toEqual([
      'info',
      'squads',
      'fixture',
      'table',
    ]);
    expect(defaultFanTab('completed')).toBe('live');
    expect(fanTabDefs('in_progress').map((t) => t.id)).toEqual([
      'live',
      'scorecard',
      'commentary',
      'partnership',
      'stats',
      'squads',
      'info',
    ]);
    expect(fanTabDefs('in_progress', { hasTable: true }).map((t) => t.id)).toContain('table');
    expect(resolveFanTab('stats', 'in_progress')).toBe('stats');
    expect(resolveFanTab('partnership', 'in_progress')).toBe('partnership');
    expect(resolveFanTab('fixture', 'in_progress')).toBe('live');
    expect(resolveFanTab('commentary', 'in_progress')).toBe('commentary');
    expect(resolveFanTab('table', 'in_progress', { hasTable: true })).toBe('table');
    expect(resolveFanTab('table', 'in_progress')).toBe('live');
  });

  it('builds band + chase commentary from live session', () => {
    const band = toMatchBandModel(fixture, session, [{ runs: 120, wickets: 8, overs: '20.0', battingSide: 'home' }]);
    expect(band.live).toBe(true);
    expect(band.battingShort).toBe('KKR');
    expect(band.runs).toBe(48);
    expect(band.chase?.need).toBe(73);
    expect(band.firstInnings?.label).toContain('CBL');
    expect(chaseCommentary(session)).toContain('Need 73');
  });
});
