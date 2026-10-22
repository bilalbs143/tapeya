import { describe, expect, it } from 'vitest';

import type { ScoringSession } from '../model/scoringSession';
import {
  buildWicketSummaryModel,
  isCountableWicketBall,
  wicketSummaryBoundariesValue,
  wicketSummaryChipLabel,
  wicketSummaryOversLine,
  wicketSummaryPartnershipValue,
  wicketSummaryScoreHero,
} from './wicketSummary';

const session = {
  matchStatus: 'in_progress',
  matchComplete: false,
  resultSummary: null,
  needsNewBatter: true,
  needsNewBowler: false,
  vacantEnd: 'striker',
  inningsId: 1,
  inningsNumber: 1,
  battingTeamId: 10,
  bowlingTeamId: 11,
  striker: null,
  nonStriker: null,
  bowler: null,
  runs: 42,
  wickets: 3,
  oversDisplay: '8.2',
  overNumber: 8,
  ballsInOver: 2,
  freeHit: false,
  inningsComplete: false,
  target: null,
  runsToWin: null,
  ballsRemaining: null,
  currentRunRate: '5.1',
  requiredRunRate: null,
  deliveries: [],
  extras: 0,
  partnership: null,
  homeXi: [],
  awayXi: [],
  wagonWheelEnabled: false,
} satisfies ScoringSession;

describe('wicketSummary helpers', () => {
  it('builds chip labels', () => {
    expect(wicketSummaryChipLabel('bowled')).toBe('BOWLED');
    expect(wicketSummaryChipLabel('caught', '', { fielderId: 1, bowlerId: 1 })).toBe('CAUGHT BOWLED');
  });

  it('skips retired hurt for the summary gate', () => {
    expect(isCountableWicketBall({ is_wicket: true, dismissal_type: 'bowled' })).toBe(true);
    expect(isCountableWicketBall({ is_wicket: true, dismissal_type: 'retired_hurt' })).toBe(false);
  });

  it('builds a summary model from the stored ball', () => {
    const model = buildWicketSummaryModel({
      apiBall: {
        is_wicket: true,
        dismissal_type: 'caught',
        out_player_id: 5,
        out_player_name: 'Ali Khan',
        bowler_id: 9,
        fielder_id: 12,
        out_player_stats: { runs: 18, balls: 14, fours: 2, sixes: 0, strike_rate: '128.6' },
      },
      matchState: session,
      nameById: { '9': 'Omar', '12': 'Sara' },
      battingShort: 'BLU',
    });
    expect(model.chipLabel).toBe('CAUGHT');
    expect(model.scoreDisplay).toBe('42/3');
    expect(model.batter.name).toBe('Ali Khan');
    expect(model.batter.runs).toBe(18);
    expect(model.bowlerName).toBe('Omar');
    expect(model.fielderName).toBe('Sara');
  });

  it('formats hero / overs / partnership display strings', () => {
    expect(wicketSummaryScoreHero('42/3')).toBe('42-3');
    expect(wicketSummaryOversLine({ oversDisplay: '8.2', oversPerSide: 20, currentRunRate: '5.1' })).toBe(
      '8.2 / 20 overs · CRR 5.1'
    );
    expect(wicketSummaryOversLine({ oversDisplay: '8.2', oversPerSide: null, currentRunRate: null })).toBe('8.2 overs');
    expect(wicketSummaryPartnershipValue({ runs: 12, balls: 8 })).toBe('12(8)');
    expect(wicketSummaryPartnershipValue(null)).toBe('0(0)');
    expect(wicketSummaryBoundariesValue(2, 1)).toBe('2 / 1');
  });
});
