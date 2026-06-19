import { describe, expect, it } from 'vitest';

import { processAnimation, processFstAnimation } from '../animation.processor';
import {
  processInningsBreak,
  processLunchBreak,
  processRainStopped,
  processStrategicTimeout,
  processTeaBreak,
} from '../break.processors';
import { processCustom, processOfficialsBanner, processPlatformBanner } from '../caption.processors';
import {
  processBattingSquad,
  processBowlingSquad,
  processManhattan,
  processNextMatch,
  processPlaying11,
  processRunRateChart,
  processWorm,
} from '../fullScreen.processors';
import {
  processAtStage,
  processFallOfWickets,
  processIntroLt,
  processLast12Balls,
  processLast30Balls,
  processMatchSummary,
  processNeedTarget,
  processPartnership,
  processPreviousOver,
  processResultLt,
  processRunRate,
  processThisOver,
  processTossLt,
  processWinPrediction,
} from '../lowerThird.processors';
import { processLtDefault } from '../LT_DEFAULT.processor.js';
import { processMiniScorecard } from '../MINI_SCORECARD.processor.js';
import {
  createLeaderboardProcessor,
  processBatsmanMatchFs,
  processBatsmanMatchLt,
  processBattingSummary,
  processBowlerCareer,
  processInningFigures,
  processMom,
  processPlayerIntro,
  processTourStat,
} from '../player.processors';
import { processMatchIntro, processMatchSummaryFs, processPointTable, processTournamentName } from '../tournament.processors';
import { processBatsmanWagonWheel, processWagonWheel } from '../wagonWheel.processors';
import { createTestSnapshot, testDeliveriesFromTokens } from './fixtures';

describe('RUN_RATE processor', () => {
  it('maps live run-rate fields onto the scoreboard base', () => {
    const snapshot = createTestSnapshot({
      active_command: { command_key: 'RUN_RATE' },
    });

    const props = processRunRate(snapshot);

    expect(props.battingTeam.score).toBe('120-3');
    expect(props.target).toBe(180);
    expect(props.currentRR).toBe('8.00');
    expect(props.requiredRR).toBe('9.50');
    expect(props.batters).toHaveLength(1);
  });
});

describe('TOSS_LT processor', () => {
  it('builds toss copy from normalized match fields', () => {
    const snapshot = createTestSnapshot({
      active_command: { command_key: 'TOSS_LT' },
      context: {
        match: {
          home_team_id: 1,
          away_team_id: 2,
          home_team_name: 'Home XI',
          away_team_name: 'Away XI',
          toss_winner_side: 'home',
          chose_to_bat_or_bowl: 'bat',
        },
      },
    });

    const props = processTossLt(snapshot);

    expect(props.tossWinnerName).toBe('Home XI');
    expect(props.choseToBatOrBowl).toBe('bat');
    expect(props.decisionOverride).toBeNull();
    expect(props.homeTeam.name).toBe('Home XI');
  });
});

describe('PLAYING_11 processor', () => {
  it('merges playing XI payload with match teams', () => {
    const snapshot = createTestSnapshot({
      active_command: {
        command_key: 'PLAYING_11',
        command_type: 'FULL_SCREEN',
        display_mode: 'FS',
        payload: {
          home_team: { players: [{ name: 'Player A' }] },
          away_team: { players: [{ name: 'Player B' }] },
        },
      },
    });

    const props = processPlaying11(snapshot);

    expect(props.homeTeam.players).toEqual([{ name: 'Player A' }]);
    expect(props.awayTeam.players).toEqual([{ name: 'Player B' }]);
    expect(props.side).toBe('both');
  });
});

describe('HIGHEST_RUNS processor', () => {
  it('reads leaderboard rows from normalized live context', () => {
    const snapshot = createTestSnapshot({
      active_command: { command_key: 'HIGHEST_RUNS', display_mode: 'FS' },
      context: {
        graphic_leaderboard_runs: [{ rank: 1, runs: 220, name: 'Star Batter', team: 'HOM' }],
      },
    });

    const props = createLeaderboardProcessor('HIGHEST_RUNS')(snapshot);

    expect(props.commandKey).toBe('HIGHEST_RUNS');
    expect(props.title).toBeNull();
    expect(props.rows).toHaveLength(1);
    expect(props.featured?.name).toBe('Star Batter');
  });
});

describe('POINT_TABLE processor', () => {
  it('reads standings rows from normalized live context', () => {
    const snapshot = createTestSnapshot({
      active_command: { command_key: 'POINT_TABLE', display_mode: 'FS' },
      context: {
        standings: [
          {
            rank: 1,
            team_name: 'Karachi',
            played: 2,
            won: 2,
            lost: 0,
            no_result: 0,
            points: 4,
            nrr: 2.833,
          },
          {
            rank: 2,
            team_name: 'Lahore',
            played: 1,
            won: 0,
            lost: 1,
            no_result: 0,
            points: 0,
            nrr: null,
          },
        ],
      },
    });

    const props = processPointTable(snapshot);

    expect(props.title).toBeNull();
    expect(props.rows).toHaveLength(2);
    expect(props.rows[0].name).toBe('Karachi');
    expect(props.rows[0].pts).toBe(4);
    expect(props.rows[1].nrr).toBeNull();
    expect(props.footerText).toBeNull();
  });

  it('prefers payload rows over live standings', () => {
    const snapshot = createTestSnapshot({
      active_command: {
        command_key: 'POINT_TABLE',
        payload: {
          rows: [{ rank: 1, name: 'Override FC', played: 3, won: 3, lost: 0, nr: 0, pts: 6, nrr: 1.5 }],
        },
      },
      context: {
        standings: [{ rank: 1, team_name: 'Live Team', played: 1, won: 1, lost: 0, points: 2, nrr: 0.5 }],
      },
    });

    const props = processPointTable(snapshot);

    expect(props.rows).toHaveLength(1);
    expect(props.rows[0].name).toBe('Override FC');
  });
});

describe('TOURNAMENT_NAME processor', () => {
  it('returns crest-strip fixture props with title and venue', () => {
    const snapshot = createTestSnapshot({
      active_command: {
        command_key: 'TOURNAMENT_NAME',
        payload: {
          match_label: 'PSLS3 - POLL B',
        },
      },
      context: {
        match: {
          home_team_id: 1,
          away_team_id: 2,
          home_team_name: 'Home XI',
          away_team_name: 'Away XI',
          home_team_short_code: 'HOM',
          away_team_short_code: 'AWY',
          venue: 'Sports Stadium Pallandri',
        },
      },
    });
    const props = processTournamentName(snapshot);

    expect(props.homeTeam?.name).toBeTruthy();
    expect(props.awayTeam?.name).toBeTruthy();
    expect(props.title).toBe('Pallandari Super League Season 3');
    expect(props.venue).toBe('Sports Stadium Pallandri');
    expect(props.venueDisplayLine).toBe('');
    expect(props).not.toHaveProperty('matchDetail');
  });

  it('passes venue_display_line separately from raw venue', () => {
    const snapshot = createTestSnapshot({
      active_command: { command_key: 'TOURNAMENT_NAME' },
      context: {
        match: {
          home_team_id: 1,
          away_team_id: 2,
          home_team_name: 'Home XI',
          away_team_name: 'Away XI',
          home_team_short_code: 'HOM',
          away_team_short_code: 'AWY',
          venue: 'Sports Stadium Pallandri',
          venue_display_line: 'LIVE FROM Sports Stadium Pallandri',
        },
      },
    });
    const props = processTournamentName(snapshot);

    expect(props.venue).toBe('Sports Stadium Pallandri');
    expect(props.venueDisplayLine).toBe('LIVE FROM Sports Stadium Pallandri');
  });
});

describe('LT_DEFAULT processor', () => {
  it('returns scoreboard base from snapshot.live', () => {
    const snapshot = createTestSnapshot();
    const props = processLtDefault(snapshot);

    expect(props.bowler.name).toBe('Bowler One');
    expect(props.currentOverDeliveries.map((d) => d.displayToken)).toEqual(['1', '4', '0']);
  });
});

describe('CUSTOM processor', () => {
  it('passes title and description as separate caption fields', () => {
    const snapshot = createTestSnapshot({
      active_command: {
        command_key: 'CUSTOM',
        payload: { title: 'Hello', description: 'World' },
      },
    });

    const props = processCustom(snapshot);

    expect(props).toEqual({ title: 'Hello', description: 'World' });
  });
});

describe('THIS_MATCH processor', () => {
  it('builds match intro props from normalized context', () => {
    const snapshot = createTestSnapshot({
      active_command: { command_key: 'THIS_MATCH', display_mode: 'FS' },
    });

    const props = processMatchIntro(snapshot);

    expect(props.homeTeam.name).toBe('Home XI');
    expect(props.awayTeam.name).toBe('Away XI');
  });
});

describe('BATSMAN_NAME_LT processor', () => {
  it('resolves player identity from payload', () => {
    const snapshot = createTestSnapshot({
      active_command: {
        command_key: 'BATSMAN_NAME_LT',
        payload: {
          player: { name: 'Star Batter', team: 'HOM', role: 'Batter' },
        },
      },
    });

    const props = processPlayerIntro(snapshot);

    expect(props.playerName).toBe('Star Batter');
    expect(props.playerTeam).toBe('HOM');
  });

  it('prefers batting style descriptor over playing role', () => {
    const snapshot = createTestSnapshot({
      active_command: {
        command_key: 'BATSMAN_NAME_LT',
        payload: {
          player: { name: 'Taimoor Mirza', batting_style: 'Right Handed Batter', role: 'Batsman' },
          batting_style: 'Right Handed Batter',
        },
      },
    });
    const props = processPlayerIntro(snapshot);
    expect(props.playerRole).toBe('Right Handed Batter');
  });

  it('includes match teams and resolves team side from team_id for NAME_FS', () => {
    const snapshot = createTestSnapshot({
      active_command: {
        command_key: 'BATSMAN_NAME_FS',
        payload: {
          user_id: 10,
          team_id: 1,
          player: { name: 'Star Batter', role: 'Batter' },
        },
      },
      context: {
        match: {
          home_team_id: 1,
          away_team_id: 2,
          home_team_name: 'Islamabad United',
          away_team_name: 'Lahore Qalandars',
          home_team_short_code: 'IU',
          away_team_short_code: 'LQ',
        },
      },
    });

    const props = processPlayerIntro(snapshot);

    expect(props.homeTeam.shortCode).toBe('IU');
    expect(props.awayTeam.shortCode).toBe('LQ');
    expect(props.teamCode).toBe('home');
    expect(props.playerTeam).toBe('IU');
  });

  it('includes match teams for BOWLER_NAME_LT and BATSMAN_MATCH_FS', () => {
    const context = {
      match: {
        home_team_id: 1,
        away_team_id: 2,
        home_team_name: 'Islamabad United',
        away_team_name: 'Lahore Qalandars',
        home_team_short_code: 'IU',
        away_team_short_code: 'LQ',
      },
    };

    const bowlerLt = processPlayerIntro(
      createTestSnapshot({
        active_command: {
          command_key: 'BOWLER_NAME_LT',
          payload: { user_id: 20, team_id: 2, player: { name: 'Bowler One' } },
        },
        context,
      }),
    );
    expect(bowlerLt.homeTeam.shortCode).toBe('IU');
    expect(bowlerLt.teamCode).toBe('away');
    expect(bowlerLt.playerTeam).toBe('LQ');

    const batsmanFs = processBatsmanMatchFs(
      createTestSnapshot({
        active_command: {
          command_key: 'BATSMAN_MATCH_FS',
          payload: { user_id: 10, team_id: 1, player: { name: 'Batter One' } },
        },
        context,
      }),
    );
    expect(batsmanFs.homeTeam.shortCode).toBe('IU');
    expect(batsmanFs.teamCode).toBe('home');
  });
});

describe('WAGON_WHEEL processor', () => {
  it('maps context wagon_wheel_balls to chart ball history', () => {
    const snapshot = createTestSnapshot({
      active_command: { command_key: 'WAGON_WHEEL', display_mode: 'FS' },
      context: {
        match: { wagon_wheel_enabled: true },
        wagon_wheel_balls: [
          { type: 'runs', shot_direction: 'deep_cover', runs: 4, striker_id: 10 },
          { type: 'runs', shot_direction: 'long_on', runs: 6, striker_id: 11 },
        ],
      },
    });

    const props = processWagonWheel(snapshot);

    expect(props.enabled).toBe(true);
    expect(props.ballHistory).toHaveLength(2);
    expect(props.ballHistory[0].shotDirection).toBe('deep_cover');
  });
});

describe('BATSMAN_WAGON_WHEEL processor', () => {
  it('filters wagon wheel balls to the selected batsman', () => {
    const snapshot = createTestSnapshot({
      active_command: {
        command_key: 'BATSMAN_WAGON_WHEEL',
        display_mode: 'FS',
        payload: { user_id: 10 },
      },
      context: {
        match: { wagon_wheel_enabled: true },
        wagon_wheel_balls: [
          { type: 'runs', shot_direction: 'deep_cover', runs: 4, striker_id: 10 },
          { type: 'runs', shot_direction: 'long_on', runs: 6, striker_id: 11 },
        ],
      },
    });

    const props = processBatsmanWagonWheel(snapshot);

    expect(props.ballHistory).toHaveLength(1);
    expect(props.ballHistory[0].runs).toBe(4);
    expect(props.homeTeam?.name).toBe('Home XI');
    expect(props.awayTeam?.name).toBe('Away XI');
  });
});

// ---------------------------------------------------------------------------
// Wagon wheel disabled guard (Fix 6 / STEP-C1)
// ---------------------------------------------------------------------------

describe('WAGON_WHEEL disabled guard', () => {
  it('returns null when wagon_wheel_enabled is false', () => {
    const snapshot = createTestSnapshot({
      active_command: { command_key: 'WAGON_WHEEL', display_mode: 'FS' },
      context: { match: { wagon_wheel_enabled: false } },
    });
    expect(processWagonWheel(snapshot)).toBeNull();
  });

  it('returns null for BATSMAN_WAGON_WHEEL when feature is disabled', () => {
    const snapshot = createTestSnapshot({
      active_command: { command_key: 'BATSMAN_WAGON_WHEEL', display_mode: 'FS' },
      context: { match: { wagon_wheel_enabled: false } },
    });
    expect(processBatsmanWagonWheel(snapshot)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Break processors
// ---------------------------------------------------------------------------

describe('TEA_BREAK processor', () => {
  it('returns break data without theme copy in core', () => {
    const snapshot = createTestSnapshot({ active_command: { command_key: 'TEA_BREAK' } });
    const props = processTeaBreak(snapshot);
    expect(props.commandKey).toBe('TEA_BREAK');
    expect(props.caption).toBeNull();
    expect(props.homeTeam.name).toBe('Home XI');
  });
});

describe('INNINGS_BREAK processor', () => {
  it('returns teams, break label, tournament name, and venue', () => {
    const snapshot = createTestSnapshot({
      active_command: { command_key: 'INNINGS_BREAK' },
      context: {
        match: {
          home_team_id: 1,
          away_team_id: 2,
          home_team_name: 'Home XI',
          away_team_name: 'Away XI',
          home_team_short_code: 'HOM',
          away_team_short_code: 'AWY',
          venue: 'Sports Stadium Pallandri',
        },
      },
    });
    const props = processInningsBreak(snapshot);
    expect(props.commandKey).toBe('INNINGS_BREAK');
    expect(props.caption).toBeNull();
    expect(props.tournamentName).toBe('Pallandari Super League Season 3');
    expect(props.venue).toBe('Sports Stadium Pallandri');
    expect(props.venueDisplayLine).toBe('');
    expect(props).toHaveProperty('homeTeam');
  });
});

describe('STRATEGIC_TIMEOUT processor', () => {
  it('returns teams, label, tournament name, and venue fields', () => {
    const snapshot = createTestSnapshot({
      active_command: {
        command_key: 'STRATEGIC_TIMEOUT',
        payload: { tournamentName: 'Custom League' },
      },
      context: {
        match: {
          home_team_id: 1,
          away_team_id: 2,
          home_team_name: 'Home XI',
          away_team_name: 'Away XI',
          home_team_short_code: 'HOM',
          away_team_short_code: 'AWY',
          venue: 'Sports Stadium Pallandri',
          venue_display_line: 'LIVE FROM Sports Stadium Pallandri',
        },
      },
    });

    const props = processStrategicTimeout(snapshot);

    expect(props.caption).toBeNull();
    expect(props.tournamentName).toBe('Custom League');
    expect(props.venue).toBe('Sports Stadium Pallandri');
    expect(props.venueDisplayLine).toBe('LIVE FROM Sports Stadium Pallandri');
    expect(props.homeTeam.shortCode).toBe('HOM');
    expect(props).not.toHaveProperty('footer');
  });
});

// ---------------------------------------------------------------------------
// Animation processor
// ---------------------------------------------------------------------------

describe('animation processor', () => {
  it('returns an empty props object', () => {
    const snapshot = createTestSnapshot({ active_command: { command_key: 'LT_FOUR' } });
    const props = processAnimation(snapshot);
    expect(props).toEqual({});
  });
});

describe('FST animation processor', () => {
  it('merges scoreboard base with event kind for FST_FOUR', () => {
    const snapshot = createTestSnapshot({
      active_command: { command_key: 'FST_FOUR', command_type: 'FULL_SCREEN_TRANSITION' },
    });

    const props = processFstAnimation(snapshot);

    expect(props.battingTeam.score).toBe('120-3');
    expect(props.event).toEqual({ kind: 'four' });
  });

  it('maps FST_OUT to wicket event kind', () => {
    const snapshot = createTestSnapshot({ active_command: { command_key: 'FST_OUT' } });
    expect(processFstAnimation(snapshot).event).toEqual({ kind: 'wicket' });
  });
});

describe('MINI_SCORECARD processor', () => {
  it('parses batting score and formats overs label', () => {
    const snapshot = createTestSnapshot({
      active_command: { command_key: 'MINI_SCORECARD' },
      context: { score: '88/4', overs: '12.3' },
    });

    const props = processMiniScorecard(snapshot);

    expect(props.total).toBe(88);
    expect(props.wkts).toBe(4);
    expect(props.scoreSep).toBe('/');
    expect(props.oversText).toBe('12.3 OVER');
    expect(props.teamCode).toBe('home');
    expect(props.homeTeam.name).toBe('Home XI');
  });
});

describe('AT_STAGE processor', () => {
  it('uses at_stage_mirror when present', () => {
    const snapshot = createTestSnapshot({
      active_command: { command_key: 'AT_STAGE' },
      context: {
        at_stage_mirror: {
          batting_team: 'home',
          score: '100-5',
          overs: '15.0',
          innings_label: '1st Innings',
          batters: [{ name: 'Striker', runs: 50, balls: 40, on_strike: true }],
          bowler: { name: 'Bowler', figures: '2/30', overs: '3.0' },
          current_over_deliveries: testDeliveriesFromTokens(['1', '0']),
        },
      },
    });

    const props = processAtStage(snapshot);

    expect(props.mirrorBattingTeam).toMatchObject({ score: '100-5', overs: '15.0' });
    expect(props.mirrorBatters).toHaveLength(1);
    expect(props.mirrorInningsLabel).toBe('1st Innings');
    expect(props.comparisonTeamName).toBe('');
  });

  it('falls back to payload comparison team when mirror absent', () => {
    const snapshot = createTestSnapshot({
      active_command: {
        command_key: 'AT_STAGE',
        payload: { comparison_team: { name: 'Away XI', score: '90-2', overs: '14.0' } },
      },
    });

    const props = processAtStage(snapshot);

    expect(props.mirrorBattingTeam).toBeNull();
    expect(props.comparisonTeamName).toBe('Away XI');
    expect(props.comparisonScore).toBe('90-2');
    expect(props.comparisonOvers).toBe('14.0');
  });
});

describe('WORM processor', () => {
  it('builds cumulative chart series from innings_chart', () => {
    const chart = [
      {
        team_name: 'Home XI',
        color_token: 'home',
        total_runs: 120,
        total_wickets: 3,
        display_overs: '15.0',
        overs_breakdown: [
          { cumulative: 40, runs: 40 },
          { cumulative: 120, runs: 80 },
        ],
      },
    ];
    const snapshot = createTestSnapshot({
      active_command: { command_key: 'WORM', display_mode: 'FS' },
      context: { innings_chart: chart },
    });

    const props = processWorm(snapshot);

    expect(props.chartMode).toBe('cumulative');
    expect(props.commandKey).toBe('WORM');
    expect(props.chartSeries[0].data).toEqual([40, 120]);
    expect(props.teams[0].displayName).toBe('Home XI');
  });
});

// ---------------------------------------------------------------------------
// Lower third processors not previously covered
// ---------------------------------------------------------------------------

describe('FOW / LAST_WICKET processor', () => {
  it('maps fall_of_wickets from context', () => {
    const snapshot = createTestSnapshot({
      active_command: { command_key: 'FOW' },
      context: {
        fall_of_wickets: [
          { number: '1', score: '22' },
          { number: '2', score: '55' },
        ],
      },
    });
    const props = processFallOfWickets(snapshot);
    expect(props.wickets).toHaveLength(2);
    expect(props.wickets[0].score).toBe('22');
  });

  it('falls back to empty array when fall_of_wickets absent', () => {
    const snapshot = createTestSnapshot({ active_command: { command_key: 'FOW' } });
    expect(processFallOfWickets(snapshot).wickets).toEqual([]);
  });

  it('includes batting order for last wicket FS enrichment', () => {
    const snapshot = createTestSnapshot({
      active_command: { command_key: 'LAST_WICKET_FS' },
      context: {
        fall_of_wickets: [{ number: '1st', score: '22', batsman_display_name: 'HAMEED' }],
        batting_order: [{ display_name: 'HAMEED', status: 'dismissed', runs: 56, balls: 32, dismissal_text: 'c Shah b Satti' }],
      },
    });
    const props = processFallOfWickets(snapshot);
    expect(props.wickets[0].batsman_display_name).toBe('HAMEED');
    expect(props.battingOrder).toHaveLength(1);
  });
});

describe('NEED_TARGET processor', () => {
  it('exposes runsToWin and ballsRemaining', () => {
    const snapshot = createTestSnapshot({ active_command: { command_key: 'NEED_TARGET' } });
    const props = processNeedTarget(snapshot);
    expect(props.runsToWin).toBe(61);
    expect(props.ballsRemaining).toBe(28);
  });
});

describe('CURRENT_PARTNERSHIP processor', () => {
  it('returns partnership runs and balls', () => {
    const snapshot = createTestSnapshot({
      active_command: { command_key: 'CURRENT_PARTNERSHIP' },
      context: { partnership: { runs: 45, balls: 32 } },
    });
    const props = processPartnership(snapshot);
    expect(props.partnershipRuns).toBe(45);
    expect(props.partnershipBalls).toBe(32);
  });

  it('passes partnership_history through for PARTNERSHIP_LIST', () => {
    const snapshot = createTestSnapshot({
      active_command: { command_key: 'PARTNERSHIP_LIST' },
      context: {
        partnership_history: [
          {
            batter1_display_name: 'KHAN',
            batter2_display_name: 'MIRZA',
            batter1_runs: 10,
            batter2_runs: 8,
            batter1_balls: 9,
            batter2_balls: 7,
            runs: 18,
            balls: 16,
          },
        ],
      },
    });
    const props = processPartnership(snapshot);
    expect(props.partnerships).toHaveLength(1);
    expect(props.partnerships[0].batter1_display_name).toBe('KHAN');
  });
});

describe('PREVIOUS_OVER processor', () => {
  it('reads previousOver runs from normalized live', () => {
    const snapshot = createTestSnapshot({
      active_command: { command_key: 'PREVIOUS_OVER' },
      context: { previous_over: { runs: 12 } },
    });
    const props = processPreviousOver(snapshot);
    expect(props.lastOverRuns).toBe(12);
  });
});

describe('WIN_PREDICTION processor', () => {
  it('returns null predictions when data absent', () => {
    const snapshot = createTestSnapshot({ active_command: { command_key: 'WIN_PREDICTION' } });
    const props = processWinPrediction(snapshot);
    expect(props.predictions).toBeNull();
  });

  it('maps win_probability to batting/bowling team codes when home is batting', () => {
    const snapshot = createTestSnapshot({
      active_command: { command_key: 'WIN_PREDICTION' },
      context: { win_probability: { home: 62, away: 38 }, batting_team: 'home' },
    });
    const props = processWinPrediction(snapshot);
    expect(props.predictions).toEqual([
      { teamCode: 'batting', percent: 62 },
      { teamCode: 'bowling', percent: 38 },
    ]);
  });

  it('swaps win_probability when away is batting', () => {
    const snapshot = createTestSnapshot({
      active_command: { command_key: 'WIN_PREDICTION' },
      context: { win_probability: { home: 62, away: 38 }, batting_team: 'away' },
    });
    const props = processWinPrediction(snapshot);
    expect(props.predictions).toEqual([
      { teamCode: 'batting', percent: 38 },
      { teamCode: 'bowling', percent: 62 },
    ]);
  });
});

describe('LAST_12_BALLS processor', () => {
  it('maps ball strip summary fields', () => {
    const snapshot = createTestSnapshot({
      active_command: { command_key: 'LAST_12_BALLS' },
      context: { last_12_balls: { dots: 4, fours: 2, sixes: 1, wickets: 1, runs: 24 } },
    });
    const props = processLast12Balls(snapshot);
    expect(props.commandKey).toBe('LAST_12_BALLS');
    expect(props.fours).toBe(2);
    expect(props.sixes).toBe(1);
    expect(props.runs).toBe(24);
  });
});

describe('RESULT_LT processor', () => {
  it('prefers payload result_line over context', () => {
    const snapshot = createTestSnapshot({
      active_command: {
        command_key: 'RESULT_LT',
        payload: { result_line: 'Home XI won by 5 wickets' },
      },
    });
    const props = processResultLt(snapshot);
    expect(props.resultLineOverride).toBe('Home XI won by 5 wickets');
    expect(props.matchDetailOverride).toBe('Home XI won by 5 wickets');
    expect(props.homeTeam?.name).toBeTruthy();
  });

  it('composes chase announcement from live chase fields', () => {
    const snapshot = createTestSnapshot({
      active_command: { command_key: 'RESULT_LT' },
      context: {
        runs_to_win: 31,
        balls_remaining: 7,
        wickets_remaining: 10,
        batting_team: 'home',
      },
    });
    const props = processResultLt(snapshot);
    expect(props.mode).toBe('chase');
    expect(props.chasingTeamAbbrev).toBe('HOM');
    expect(props.runsRequired).toBe(31);
    expect(props.ballsRemaining).toBe(7);
    expect(props.wicketsRemaining).toBe(10);
  });
});

// ---------------------------------------------------------------------------
// Caption / banner processors
// ---------------------------------------------------------------------------

describe('platform banner processor', () => {
  it('returns null text when payload has no copy (theme/layout supplies defaults)', () => {
    const snapshot = createTestSnapshot({ active_command: { command_key: 'FOLLOW_PLATFORM' } });
    const props = processPlatformBanner(snapshot);
    expect(props.commandKey).toBe('FOLLOW_PLATFORM');
    expect(props.text).toBeNull();
  });
});

describe('MATCH_SUMMARY processor', () => {
  it('builds two innings rows from live scoreboard when summaries are missing', () => {
    const snapshot = createTestSnapshot({
      active_command: { command_key: 'MATCH_SUMMARY' },
      context: {
        innings_number: 1,
        innings_summaries: [],
        score: '105-0',
        overs: '4.5',
        batting_team: 'home',
      },
    });

    const props = processMatchSummary(snapshot);
    expect(props.innings).toHaveLength(2);
    expect(props.innings[0].total).toBe(105);
    expect(props.innings[1].total).toBe(0);
  });
});

describe('officials banner processor', () => {
  it('returns heading + names from context.match.officials', () => {
    const snapshot = createTestSnapshot({
      active_command: { command_key: 'UMPIRES' },
      context: {
        match: {
          officials: {
            umpires: { text: 'John Smith\nJane Doe', lines: ['John Smith', 'Jane Doe'] },
            scorers: { text: '', lines: [] },
            commentators: { text: '', lines: [] },
          },
        },
      },
    });
    const props = processOfficialsBanner(snapshot);
    expect(props.commandKey).toBe('UMPIRES');
    expect(props.heading).toBeNull();
    expect(props.names).toEqual(['John Smith', 'Jane Doe']);
    expect(props.text).toBe('John Smith\nJane Doe');
  });

  it('returns empty names when officials not yet configured', () => {
    const snapshot = createTestSnapshot({ active_command: { command_key: 'SCORERS' } });
    const props = processOfficialsBanner(snapshot);
    expect(props.commandKey).toBe('SCORERS');
    expect(props.heading).toBeNull();
    expect(props.names).toEqual([]);
    expect(props.text).toBe('');
  });

  it('payload override takes precedence over context', () => {
    const snapshot = createTestSnapshot({
      active_command: {
        command_key: 'COMMENTATORS',
        payload: { text: 'Override Name' },
      },
      context: {
        match: {
          officials: {
            commentators: { text: 'Context Name', lines: ['Context Name'] },
          },
        },
      },
    });
    const props = processOfficialsBanner(snapshot);
    expect(props.names).toEqual(['Override Name']);
    expect(props.text).toBe('Override Name');
  });
});

// ---------------------------------------------------------------------------
// Player processors
// ---------------------------------------------------------------------------

describe('BOWLER_TOURNAMENT_LT processor (processBowlerCareer)', () => {
  it('returns player base and a headline', () => {
    const snapshot = createTestSnapshot({
      active_command: {
        command_key: 'BOWLER_TOURNAMENT_LT',
        payload: { player: { name: 'Speed Demon', team: 'AWY', role: 'Bowler' } },
      },
    });
    const props = processBowlerCareer(snapshot);
    expect(props.playerName).toBe('Speed Demon');
    expect(props.headline).toBe('Career Stats');
  });
});

describe('BATTING_SUMMARY processor', () => {
  it('maps batting order rows with dismissed and yet_to_bat states', () => {
    const snapshot = createTestSnapshot({
      active_command: { command_key: 'BATTING_SUMMARY' },
      context: {
        batting_order: [
          { display_name: 'MIRZA', status: 'not_out', runs: 28, balls: 10, dismissal_text: null, is_at_crease: true },
          { display_name: 'SATTI', status: 'dismissed', runs: 56, balls: 14, dismissal_text: 'c Mirza b X', is_at_crease: false },
          { display_name: 'IMTIAZ', status: 'yet_to_bat', runs: null, balls: null, dismissal_text: null, is_at_crease: false },
        ],
      },
    });
    const props = processBattingSummary(snapshot);
    expect(props.battingOrder).toHaveLength(3);
    expect(props.battingOrder[1].dismissal_text).toBe('c Mirza b X');
    expect(props.battingOrder[2].runs).toBeNull();
    expect(props.battingTeam.shortCode).toBe('HOM');
  });
});

describe('INNING_FIGURES processor', () => {
  it('passes live batting and bowling teams for adapter accent resolution', () => {
    const snapshot = createTestSnapshot({
      active_command: { command_key: 'INNING_FIGURES' },
    });
    const props = processInningFigures(snapshot);

    expect(props.battingTeam?.shortCode).toBe('HOM');
    expect(props.bowlingTeam?.shortCode).toBe('AWY');
    expect(props.matchHeader).toContain('VS');
    expect(props.innings.innings_number_label).toBe('1ST');
  });
});

describe('MATCH_SUMMARY_FS processor', () => {
  it('derives chase footer without wickets', () => {
    const snapshot = createTestSnapshot({
      active_command: { command_key: 'MATCH_SUMMARY_FS' },
      context: {
        match: { is_completed: false, home_team_name: 'Home XI', away_team_name: 'Away XI' },
        runs_to_win: 31,
        balls_remaining: 7,
      },
    });
    const props = processMatchSummaryFs(snapshot);
    expect(props.footerLine).toBe('Home XI NEEDED 31 RUNS IN 7 BALLS');
  });
});

describe('phase chart processors', () => {
  it('manhattan exposes wicket badges', () => {
    const chart = [
      {
        team_name: 'Friends',
        color_token: 'home',
        total_runs: 135,
        total_wickets: 3,
        display_overs: '6.0',
        fours: 1,
        sixes: 2,
        phase_stats: [
          { over_range: '1-4', runs: 85, wickets_in_phase: 3 },
          { over_range: '5-6', runs: 50, wickets_in_phase: 0 },
        ],
      },
      {
        team_name: 'Sardar',
        color_token: 'away',
        total_runs: 105,
        total_wickets: 0,
        display_overs: '6.0',
        fours: 0,
        sixes: 1,
        phase_stats: [
          { over_range: '1-4', runs: 96, wickets_in_phase: 0 },
          { over_range: '5-6', runs: 9, wickets_in_phase: 0 },
        ],
      },
    ];
    const snapshot = createTestSnapshot({
      active_command: { command_key: 'MANHATTAN' },
      context: { innings_chart: chart },
    });
    const manhattan = processManhattan(snapshot);
    expect(manhattan.showWicketBadges).toBe(true);
    expect(manhattan.wicketBadges[0][0]).toBe(3);
    expect(manhattan.teams[0].displayName).toBe('Friends');
    expect(manhattan.chartSeries[0].data).toEqual([85, 50]);
  });

  it('run rate chart uses per-over run_rate series', () => {
    const chart = [
      {
        team_name: 'Friends',
        color_token: 'home',
        total_runs: 135,
        total_wickets: 3,
        display_overs: '2.0',
        overs_breakdown: [
          { cumulative: 85, runs: 85, run_rate: 10.2 },
          { cumulative: 135, runs: 50, run_rate: 8.3 },
        ],
      },
      {
        team_name: 'Sardar',
        color_token: 'away',
        total_runs: 105,
        total_wickets: 0,
        display_overs: '2.0',
        overs_breakdown: [
          { cumulative: 96, runs: 96, run_rate: 12.0 },
          { cumulative: 105, runs: 9, run_rate: 4.5 },
        ],
      },
    ];
    const snapshot = createTestSnapshot({
      active_command: { command_key: 'RUN_RATE_CHART' },
      context: { innings_chart: chart },
    });
    const runRate = processRunRateChart(snapshot);
    expect(runRate.chartMode).toBe('run_rate');
    expect(runRate.commandKey).toBe('RUN_RATE_CHART');
    expect(runRate.chartSeries[0].data).toEqual([10.2, 8.3]);
    expect(runRate.chartSeries[1].data).toEqual([12.0, 4.5]);
    expect(runRate.teams[0].displayName).toBe('Friends');
  });
});

describe('remaining processor gaps', () => {
  it('INTRO_LT exposes match teams and label', () => {
    const snapshot = createTestSnapshot({ active_command: { command_key: 'INTRO_LT' } });
    const props = processIntroLt(snapshot);

    expect(props.homeTeam.name).toBe('Home XI');
    expect(props.awayTeam.name).toBe('Away XI');
    expect(props.matchLabel).toBeTruthy();
  });

  it('THIS_OVER maps this_over ball strip summary', () => {
    const snapshot = createTestSnapshot({
      active_command: { command_key: 'THIS_OVER' },
      context: { this_over: { dots: 2, fours: 1, sixes: 0, wickets: 0, runs: 8 } },
    });

    const props = processThisOver(snapshot);

    expect(props.commandKey).toBe('THIS_OVER');
    expect(props.dots).toBe(2);
    expect(props.fours).toBe(1);
    expect(props.runs).toBe(8);
  });

  it('LAST_30_BALLS maps last_30_balls ball strip summary', () => {
    const snapshot = createTestSnapshot({
      active_command: { command_key: 'LAST_30_BALLS' },
      context: { last_30_balls: { dots: 10, fours: 4, sixes: 2, wickets: 2, runs: 58 } },
    });

    const props = processLast30Balls(snapshot);

    expect(props.commandKey).toBe('LAST_30_BALLS');
    expect(props.wickets).toBe(2);
    expect(props.runs).toBe(58);
  });

  it('LUNCH_BREAK and RAIN_STOPPED return break labels', () => {
    expect(processLunchBreak(createTestSnapshot({ active_command: { command_key: 'LUNCH_BREAK' } })).commandKey).toBe(
      'LUNCH_BREAK',
    );
    expect(processRainStopped(createTestSnapshot({ active_command: { command_key: 'RAIN_STOPPED' } })).commandKey).toBe(
      'RAIN_STOPPED',
    );
  });

  it('BATTING_SQUAD resolves batting side squad', () => {
    const snapshot = createTestSnapshot({
      active_command: { command_key: 'BATTING_SQUAD', display_mode: 'FS' },
      context: {
        batting_team: 'home',
        squad_home: [{ name: 'Player A' }, { name: 'Player B' }],
      },
    });

    const props = processBattingSquad(snapshot);

    expect(props.team.name).toBe('Home XI');
    expect(props.players).toHaveLength(2);
    expect(props.requiredRunRate).toBe('9.50');
  });

  it('BOWLING_SQUAD resolves bowling side squad when home is batting', () => {
    const snapshot = createTestSnapshot({
      active_command: { command_key: 'BOWLING_SQUAD', display_mode: 'FS' },
      context: {
        batting_team: 'home',
        squad_away: [{ name: 'Away Player' }],
      },
    });

    const props = processBowlingSquad(snapshot);

    expect(props.team.name).toBe('Away XI');
    expect(props.players).toHaveLength(1);
  });

  it('NEXT_MATCH maps fixture payload', () => {
    const snapshot = createTestSnapshot({
      active_command: {
        command_key: 'NEXT_MATCH',
        payload: {
          fixture: {
            home_team: { display_name: 'Team A', short_code: 'TMA' },
            away_team: { display_name: 'Team B', short_code: 'TMB' },
            match_number: '12',
            venue_name: 'Main Ground',
          },
        },
      },
    });

    const props = processNextMatch(snapshot);

    expect(props.homeTeam.name).toBe('Team A');
    expect(props.awayTeam.name).toBe('Team B');
    expect(props.matchNumber).toBe('12');
    expect(props.venue).toBe('Main Ground');
  });

  it('TOUR_RUNS reads tournament aggregates', () => {
    const snapshot = createTestSnapshot({
      active_command: { command_key: 'TOUR_RUNS', display_mode: 'LT' },
      context: {
        tournament: { name: 'PSL', short: 'PSL', logo_url: 'https://example.com/psl.png' },
        tournament_aggregates: { total_runs: 4200 },
      },
    });

    const props = processTourStat(snapshot);

    expect(props.tourHit.statKey).toBe('totalRuns');
    expect(props.tourHit.value).toBe(4200);
    expect(props.tourHit.tournamentLogoUrl).toBe('https://example.com/psl.png');
    expect(props.tourHit.tournamentShortCode).toBe('PSL');
    expect(props.battingTeam.score).toBe('120-3');
  });

  it('TOUR_SIXES uses tournament short code when logo is absent', () => {
    const snapshot = createTestSnapshot({
      active_command: { command_key: 'TOUR_SIXES', display_mode: 'LT' },
      context: {
        tournament: { name: 'Pallandari Super League', short: 'PSL' },
        tournament_aggregates: { total_sixes: 88 },
      },
    });

    const props = processTourStat(snapshot);

    expect(props.tourHit.tournamentLogoUrl).toBeNull();
    expect(props.tourHit.tournamentShortCode).toBe('PSL');
    expect(props.tourHit.value).toBe(88);
  });

  it('TOUR_RUNS derives short code from tournament name when short is missing', () => {
    const snapshot = createTestSnapshot({
      active_command: { command_key: 'TOUR_RUNS', display_mode: 'LT' },
      context: {
        tournament: { name: 'Pallandari Super League' },
        tournament_aggregates: { total_runs: 120 },
      },
    });

    const props = processTourStat(snapshot);

    expect(props.tourHit.tournamentShortCode).toBe('PSL');
  });

  it('BATSMAN_MATCH_LT resolves batter stats from payload', () => {
    const snapshot = createTestSnapshot({
      active_command: {
        command_key: 'BATSMAN_MATCH_LT',
        payload: {
          user_id: 10,
          stats: [
            { label: 'Runs', value: 45 },
            { label: 'Balls', value: 30 },
          ],
        },
      },
    });

    const props = processBatsmanMatchLt(snapshot);

    expect(props.playerName ?? props.player?.name).toBeTruthy();
    expect(Array.isArray(props.stats)).toBe(true);
  });

  it('MOM resolves player from match player_of_match when payload is empty', () => {
    const snapshot = createTestSnapshot({
      context: {
        match: {
          player_of_match_user_id: 42,
          player_of_match_name: 'Star Player',
        },
      },
      active_command: {
        command_key: 'MOM',
        payload: { player: { name: 'Star Player', team: 'HOM', role: 'All-rounder' } },
      },
    });

    const props = processMom(snapshot);

    expect(props?.playerName ?? props?.player?.name).toBeTruthy();
    expect(props?.tournamentLabel).toBeTruthy();
  });

  it('MOM returns null when player of match is not set', () => {
    const snapshot = createTestSnapshot({
      active_command: { command_key: 'MOM', payload: null },
    });

    expect(processMom(snapshot)).toBeNull();
  });
});
