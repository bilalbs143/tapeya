/**
 * Shared adapter bundle contracts for theme1.
 *
 * Each entry maps a manifest command key → adapter fn + required top-level keys
 * on the returned bundle. Future themes can reuse the same shape assertions.
 */

import { toBreakBundle, toNextMatchBundle } from './break.adapter';
import { toCustomCaptionData } from './caption.adapter';
import { toPhaseChartData, toWagonWheelData, toWormChartData } from './chart.adapter';
import { toFallOfWicketsData } from './fallOfWickets.adapter';
import {
  toBattingSummaryBundle,
  toBowlingSummaryBundle,
  toInningFiguresBundle,
  toNeedTargetBundle,
  toPlaying11Bundle,
} from './fullScreen.adapter';
import { toLeaderboardData } from './leaderboard.adapter';
import { toMatchFixtureBundle } from './matchFixture.adapter';
import { toMiniScoreCardBundle } from './miniScoreCard.adapter';
import { toOfficialsData } from './officials.adapter';
import { toBatsmanMatchLt, toBatsmanTournamentLt, toBowlerTournamentLt } from './player.adapter';
import { toPointTableData } from './pointTable.adapter';
import { toScoreBarBundle, toTourHitBundle } from './scoreBar.adapter';
import { toSquadBundle } from './squad.adapter';
import { toStrategicTimeoutBundle } from './strategicTimeout.adapter';

/** @typedef {{ commandKey: string, adapter: (props: object, tokens: object) => object, requireKeys: string[], snapshotOverrides?: Record<string, unknown> }} AdapterContract */

/** @type {object} */
export const TEST_TOKENS = {
  homeTextColor: '#ffffff',
  homeBgColor: '#0055ff',
  awayTextColor: '#ffffff',
  awayBgColor: '#ff5500',
  enableImages: true,
};

/** @type {AdapterContract[]} */
export const THEME1_ADAPTER_CONTRACTS = [
  {
    commandKey: 'LT_DEFAULT',
    adapter: (props, tokens) => toScoreBarBundle(props, tokens),
    requireKeys: ['frame', 'teams', 'match'],
  },
  {
    commandKey: 'MINI_SCORECARD',
    adapter: (props, tokens) => toMiniScoreCardBundle(props, tokens),
    requireKeys: ['miniScoreCard', 'teams'],
    snapshotOverrides: {
      active_command: { command_key: 'MINI_SCORECARD' },
      context: { score: '88/4', overs: '12.3' },
    },
  },
  {
    commandKey: 'UMPIRES',
    adapter: (props) => toOfficialsData(props),
    requireKeys: ['heading', 'names'],
    snapshotOverrides: {
      active_command: { command_key: 'UMPIRES' },
      context: {
        match: {
          officials: {
            umpires: { text: 'Umpire One\nUmpire Two', lines: ['Umpire One', 'Umpire Two'] },
          },
        },
      },
    },
  },
  {
    commandKey: 'PLAYING_11',
    adapter: (props, tokens) => toPlaying11Bundle(props, tokens),
    requireKeys: ['teams', 'data'],
    snapshotOverrides: {
      active_command: {
        command_key: 'PLAYING_11',
        payload: {
          home_team: { players: [{ name: 'Player A' }] },
          away_team: { players: [{ name: 'Player B' }] },
        },
      },
    },
  },
  {
    commandKey: 'BATTING_SUMMARY',
    adapter: (props, tokens) => toBattingSummaryBundle(props, tokens),
    requireKeys: ['teams', 'data'],
    snapshotOverrides: {
      active_command: { command_key: 'BATTING_SUMMARY' },
      context: {
        batting_order: [
          { display_name: 'MIRZA', status: 'not_out', runs: 28, balls: 10, is_at_crease: true },
          { display_name: 'SATTI', status: 'dismissed', runs: 56, balls: 14, dismissal_text: 'c Mirza b X' },
        ],
      },
    },
  },
  {
    commandKey: 'BOWLING_SUMMARY',
    adapter: (props, tokens) => toBowlingSummaryBundle(props, tokens),
    requireKeys: ['teams', 'data'],
    snapshotOverrides: {
      active_command: { command_key: 'BOWLING_SUMMARY' },
      context: {
        bowlers: [{ name: 'Bowler One', overs: '4.0', figures: '2/28' }],
      },
    },
  },
  {
    commandKey: 'INNING_FIGURES',
    adapter: (props, tokens) => toInningFiguresBundle(props, tokens),
    requireKeys: ['teams', 'data'],
    snapshotOverrides: { active_command: { command_key: 'INNING_FIGURES' } },
  },
  {
    commandKey: 'NEED_TARGET_FS',
    adapter: (props, tokens) => toNeedTargetBundle(props, tokens),
    requireKeys: ['teams', 'data'],
    snapshotOverrides: { active_command: { command_key: 'NEED_TARGET_FS', display_mode: 'FS' } },
  },
  {
    commandKey: 'WORM',
    adapter: (props, tokens) => toWormChartData(props, tokens),
    requireKeys: ['title', 'chart', 'teams'],
    snapshotOverrides: {
      active_command: { command_key: 'WORM', display_mode: 'FS' },
      context: {
        innings_chart: [
          {
            team_name: 'Home XI',
            color_token: 'home',
            total_runs: 120,
            total_wickets: 3,
            display_overs: '2.0',
            overs_breakdown: [
              { cumulative: 60, runs: 60 },
              { cumulative: 120, runs: 60 },
            ],
          },
          {
            team_name: 'Away XI',
            color_token: 'away',
            total_runs: 80,
            total_wickets: 1,
            display_overs: '2.0',
            overs_breakdown: [
              { cumulative: 40, runs: 40 },
              { cumulative: 80, runs: 40 },
            ],
          },
        ],
      },
    },
  },
  {
    commandKey: 'MANHATTAN',
    adapter: (props, tokens) => toPhaseChartData(props, tokens),
    requireKeys: ['title', 'chart'],
    snapshotOverrides: {
      active_command: { command_key: 'MANHATTAN', display_mode: 'FS' },
      context: {
        innings_chart: [
          {
            team_name: 'Home XI',
            color_token: 'home',
            total_runs: 135,
            total_wickets: 3,
            display_overs: '6.0',
            phase_stats: [{ over_range: '1-4', runs: 85, wickets_in_phase: 3 }],
          },
          {
            team_name: 'Away XI',
            color_token: 'away',
            total_runs: 105,
            total_wickets: 0,
            display_overs: '6.0',
            phase_stats: [{ over_range: '1-4', runs: 96, wickets_in_phase: 0 }],
          },
        ],
      },
    },
  },
  {
    commandKey: 'WAGON_WHEEL',
    adapter: (props, tokens) => toWagonWheelData(props, tokens),
    requireKeys: ['title', 'shots'],
    snapshotOverrides: {
      active_command: { command_key: 'WAGON_WHEEL', display_mode: 'FS' },
      context: {
        match: { wagon_wheel_enabled: true },
        wagon_wheel_balls: [{ type: 'runs', shot_direction: 'deep_cover', runs: 4, striker_id: 10 }],
      },
    },
  },
  {
    commandKey: 'FOW',
    adapter: (props, tokens) => toFallOfWicketsData(props, tokens),
    requireKeys: ['data', 'teams'],
    snapshotOverrides: {
      active_command: { command_key: 'FOW' },
      context: {
        fall_of_wickets: [{ number: '1', score: '22', batsman_display_name: 'Player A' }],
        score: '105-1',
        overs: '12.0',
      },
    },
  },
  {
    commandKey: 'POINT_TABLE',
    adapter: (props) => toPointTableData(props),
    requireKeys: ['title', 'data'],
    snapshotOverrides: {
      active_command: { command_key: 'POINT_TABLE' },
      context: {
        standings: [{ rank: 1, team_name: 'Karachi', played: 2, won: 2, lost: 0, points: 4, nrr: 2.833 }],
      },
    },
  },
  {
    commandKey: 'TOUR_RUNS',
    adapter: (props, tokens) => toTourHitBundle(props, tokens),
    requireKeys: ['frame', 'teams', 'match'],
    snapshotOverrides: {
      active_command: { command_key: 'TOUR_RUNS', display_mode: 'LT' },
      context: { tournament_aggregates: { total_runs: 4200 } },
    },
  },
  {
    commandKey: 'BATTING_SQUAD',
    adapter: (props, tokens) => toSquadBundle(props, tokens, 'batting'),
    requireKeys: ['data', 'teams'],
    snapshotOverrides: {
      active_command: { command_key: 'BATTING_SQUAD', display_mode: 'FS' },
      context: {
        squad_home: [{ player_id: 1, name: 'Player One', role: 'batsman' }],
        batting_team: 'home',
      },
    },
  },
  {
    commandKey: 'LUNCH_BREAK',
    adapter: (props, tokens) => toBreakBundle(props, tokens),
    requireKeys: ['breakData', 'teams'],
    snapshotOverrides: { active_command: { command_key: 'LUNCH_BREAK' } },
  },
  {
    commandKey: 'STRATEGIC_TIMEOUT',
    adapter: (props, tokens) => toStrategicTimeoutBundle(props, tokens),
    requireKeys: ['data', 'teams'],
    snapshotOverrides: { active_command: { command_key: 'STRATEGIC_TIMEOUT' } },
  },
  {
    commandKey: 'NEXT_MATCH',
    adapter: (props, tokens) => toNextMatchBundle(props, tokens),
    requireKeys: ['breakData', 'teams'],
    snapshotOverrides: { active_command: { command_key: 'NEXT_MATCH' } },
  },
  {
    commandKey: 'INTRO_LT',
    adapter: (props, tokens) => toMatchFixtureBundle(props, tokens),
    requireKeys: ['teams', 'fixture'],
    snapshotOverrides: { active_command: { command_key: 'INTRO_LT' } },
  },
  {
    commandKey: 'BATSMAN_MATCH_LT',
    adapter: (props, tokens) => toBatsmanMatchLt(props, tokens),
    requireKeys: ['batter', 'teams'],
    snapshotOverrides: {
      active_command: {
        command_key: 'BATSMAN_MATCH_LT',
        payload: { user_id: 10, team_id: 1 },
      },
      context: {
        batters: [{ id: 10, name: 'Taimoor Mirza', runs: 28, balls: 10, is_dismissed: false }],
      },
    },
  },
  {
    commandKey: 'BATSMAN_TOURNAMENT_LT',
    adapter: (props, tokens) => toBatsmanTournamentLt(props, tokens),
    requireKeys: ['batter', 'teams'],
    snapshotOverrides: {
      active_command: {
        command_key: 'BATSMAN_TOURNAMENT_LT',
        payload: {
          user_id: 10,
          team_id: 1,
          player: { name: 'Taimoor Mirza', team: 'HOM', role: 'Batsman' },
          tournament_batting: {
            matches: 6,
            runs: 198,
            fours: 4,
            sixes: 27,
            fifties: 0,
            hundreds: 1,
            strike_rate: 295.52,
          },
        },
      },
    },
  },
  {
    commandKey: 'BOWLER_TOURNAMENT_LT',
    adapter: (props, tokens) => toBowlerTournamentLt(props, tokens),
    requireKeys: ['bowler', 'teams'],
    snapshotOverrides: {
      active_command: {
        command_key: 'BOWLER_TOURNAMENT_LT',
        payload: {
          user_id: 20,
          team_id: 2,
          player: { name: 'Itsham Satti', team: 'AWY', role: 'Bowler' },
          tournament_bowling: {
            matches: 4,
            overs: 6,
            wickets: 1,
            runs_conceded: 107,
            average: 107,
            economy: 17.83,
          },
        },
      },
    },
  },
  {
    commandKey: 'RUN_RATE',
    adapter: (props, tokens) => toScoreBarBundle(props, tokens),
    requireKeys: ['frame', 'teams', 'match'],
    snapshotOverrides: { active_command: { command_key: 'RUN_RATE' } },
  },
  {
    commandKey: 'TOSS_LT',
    adapter: (props, tokens) => toMatchFixtureBundle(props, tokens, 'decision'),
    requireKeys: ['teams', 'fixture'],
    snapshotOverrides: {
      active_command: { command_key: 'TOSS_LT' },
      context: {
        match: {
          toss_winner_side: 'home',
          chose_to_bat_or_bowl: 'bat',
        },
      },
    },
  },
  {
    commandKey: 'RESULT_LT',
    adapter: (props, tokens) => toMatchFixtureBundle(props, tokens, 'matchDetail'),
    requireKeys: ['teams', 'fixture'],
    snapshotOverrides: {
      active_command: {
        command_key: 'RESULT_LT',
        payload: { result_line: 'Home XI won by 5 wickets' },
      },
    },
  },
  {
    commandKey: 'HIGHEST_RUNS',
    adapter: (props) => toLeaderboardData(props),
    requireKeys: ['title', 'data'],
    snapshotOverrides: {
      active_command: { command_key: 'HIGHEST_RUNS', display_mode: 'FS' },
      context: {
        graphic_leaderboard_runs: [{ rank: 1, runs: 220, name: 'Star Batter', team: 'HOM' }],
      },
    },
  },
  {
    commandKey: 'CUSTOM',
    adapter: (props) => toCustomCaptionData(props),
    requireKeys: ['title', 'description'],
    snapshotOverrides: {
      active_command: { command_key: 'CUSTOM', payload: { title: 'Hello', description: 'World' } },
    },
  },
];
