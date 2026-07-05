import { processGraphicCommand } from '@tapeya/graphics-core/GraphicCommandProcessor.js';
import { normalizeSession } from '@tapeya/graphics-core/normalizeSession/index.js';

import { getThemeCommandComponent, getThemeMeta } from '@/graphics/exit/themeRegistry';

/** @typedef {import('@/graphics/types.js').GraphicRenderPlan} GraphicRenderPlan */

export const THEME_SLUG = 'theme1';

/** Realistic HTTP-shaped session used across smoke commands. */
export function createRawSession(overrides = {}) {
  const activeCommand = {
    id: 99,
    command_key: 'LT_DEFAULT',
    command_type: 'LOWER_THIRD',
    display_mode: 'LT',
    payload: null,
    ...(overrides.active_command ?? {}),
  };

  const context = {
    match: {
      home_team_id: 1,
      away_team_id: 2,
      home_team_name: 'Home XI',
      away_team_name: 'Away XI',
      home_team_short_code: 'HOM',
      away_team_short_code: 'AWY',
      player_of_match_user_id: 10,
      player_of_match_name: 'Batter One',
      venue: 'National Stadium',
      venue_display_line: 'National Stadium, Karachi',
    },
    tournament: { name: 'Tapeya Premier League' },
    batting_team: 'home',
    score: '120-3',
    overs: '15.2',
    batters: [{ id: 10, name: 'Batter One', runs: 45, balls: 30, on_strike: true }],
    bowler: { name: 'Bowler One', figures: '2/28', overs: '4.0', user_id: 20 },
    current_over_deliveries: [
      { display_token: '1', chip_type: 'single', over_number: 15, ball_in_over: 1 },
      { display_token: '4', chip_type: 'boundary_four', over_number: 15, ball_in_over: 2 },
      { display_token: '0', chip_type: 'dot', over_number: 15, ball_in_over: 3 },
    ],
    target: 180,
    current_rr: '8.00',
    required_rr: '9.50',
    runs_to_win: 61,
    balls_remaining: 28,
    ...(overrides.context ?? {}),
  };

  return {
    active_command: activeCommand,
    context_hash: overrides.context_hash ?? 'integration-fixture-hash',
    config: {
      homeBgColor: '#0055ff',
      awayBgColor: '#ff5500',
      homeTextColor: '#ffffff',
      awayTextColor: '#ffffff',
      enableImages: true,
      ...(overrides.config ?? {}),
    },
    context: {
      ...context,
      match: { ...context.match, ...(overrides.context?.match ?? {}) },
    },
  };
}

/** @param {string} commandKey */
export function contextOverridesForCommand(commandKey) {
  if (commandKey === 'WAGON_WHEEL' || commandKey === 'BATSMAN_WAGON_WHEEL') {
    return {
      match: { wagon_wheel_enabled: true },
      wagon_wheel_balls: [{ type: 'four', shot_direction: 'cover', runs: 4, striker_id: 10 }],
    };
  }

  if (commandKey === 'AT_STAGE') {
    return {
      at_stage_mirror: {
        batting_team: 'home',
        score: '100-5',
        overs: '15.0',
        innings_label: '1st Innings',
        batters: [{ name: 'A', runs: 50, balls: 40, on_strike: true }],
        bowler: { name: 'B', figures: '2/30', overs: '3.0' },
        current_over_deliveries: [
          { display_token: '1', chip_type: 'single', over_number: 15, ball_in_over: 1 },
          { display_token: '0', chip_type: 'dot', over_number: 15, ball_in_over: 2 },
        ],
      },
    };
  }

  if (commandKey.startsWith('HIGHEST_') || commandKey.startsWith('TOP_')) {
    return {
      graphic_leaderboard_runs: [{ rank: 1, runs: 220, name: 'Star Batter', team: 'HOM' }],
    };
  }

  if (commandKey === 'TOSS_LT') {
    return {
      match: {
        toss_winner_side: 'home',
        chose_to_bat_or_bowl: 'bat',
      },
    };
  }

  if (commandKey === 'FOW') {
    return {
      fall_of_wickets: [
        { number: '1', score: '22', batsman_display_name: 'Hameed' },
        { number: '2', score: '55', batsman_display_name: 'Ali' },
      ],
    };
  }

  if (commandKey === 'LAST_WICKET') {
    return {
      fall_of_wickets: [{ number: '1', score: '22', batsman_display_name: 'Hameed' }],
      batting_order: [{ display_name: 'Hameed', status: 'dismissed', runs: 56, balls: 32, dismissal_text: 'c Shah b Satti' }],
    };
  }

  if (commandKey === 'UMPIRES') {
    return {
      match: {
        officials: {
          umpires: { text: 'Ump One\nUmp Two', lines: ['Ump One', 'Ump Two'] },
        },
      },
    };
  }

  if (commandKey === 'SCORERS') {
    return {
      match: {
        officials: {
          scorers: { text: 'Scorer One', lines: ['Scorer One'] },
        },
      },
    };
  }

  if (commandKey === 'COMMENTATORS') {
    return {
      match: {
        officials: {
          commentators: { text: 'Comm One', lines: ['Comm One'] },
        },
      },
    };
  }

  return undefined;
}

/** @param {{ key: string, type: string, displayMode: string|null, requires?: Record<string, unknown> }} command */
function payloadOverridesForCommand(command) {
  if (command.key === 'PLAYING_11') {
    return {
      payload: {
        home_team: { players: [{ name: 'Player A' }] },
        away_team: { players: [{ name: 'Player B' }] },
      },
    };
  }

  if (command.key === 'CUSTOM') {
    return { payload: { title: 'Hello', description: 'World' } };
  }

  const playerPick = command.requires?.player_pick;
  if (playerPick === 'batsman') {
    return {
      payload: {
        user_id: 10,
        player: { name: 'Star Batter', team: 'HOM', role: 'Batter' },
      },
    };
  }

  if (playerPick === 'bowler') {
    return {
      payload: {
        user_id: 20,
        player: { name: 'Bowler One', team: 'AWY', role: 'Bowler' },
      },
    };
  }

  if (playerPick === 'any') {
    return {
      payload: {
        player: { name: 'Star Player', team: 'HOM', role: 'All-rounder' },
      },
    };
  }

  return {};
}

/** @param {{ key: string, type: string, displayMode: string|null, requires?: Record<string, unknown> }} command */
export function createRawSessionForCommand(command) {
  const payloadOverrides = payloadOverridesForCommand(command);

  return createRawSession({
    active_command: {
      command_key: command.key,
      command_type: command.type,
      display_mode: command.displayMode,
      ...payloadOverrides,
    },
    context: contextOverridesForCommand(command.key),
  });
}

/**
 * @param {Record<string, unknown>} rawSession
 */
export function runGraphicPipeline(rawSession) {
  const snapshot = normalizeSession(rawSession, THEME_SLUG);
  const plan = snapshot ? processGraphicCommand(snapshot) : null;
  const component = plan ? getThemeCommandComponent(plan.themeSlug, plan.commandType, plan.commandKey) : null;
  const themeMeta = plan ? getThemeMeta(plan.themeSlug) : null;

  return { snapshot, plan, component, themeMeta };
}
