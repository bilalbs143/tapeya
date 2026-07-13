import { normalizeSession } from '../../normalizeSession/index.js';
import { PROCESSOR_MAP } from '../../processorMap.js';

/** @param {string[]} tokens @param {number} [overNumber] */
export function testDeliveriesFromTokens(tokens, overNumber = 15) {
  return tokens.map((display_token, i) => ({
    display_token,
    chip_type:
      display_token === '4' ? 'boundary_four' : display_token === '6' ? 'boundary_six' : display_token === '0' ? 'dot' : 'single',
    is_free_hit: false,
    runs_total: Number(display_token) || 0,
    is_legal: true,
    over_number: overNumber,
    ball_in_over: i + 1,
  }));
}

/** @returns {import('../../types.js').GraphicSessionSnapshot} */
export function createTestSnapshot(overrides = {}) {
  const defaultContext = {
    match: {
      home_team_id: 1,
      away_team_id: 2,
      home_team_name: 'Home XI',
      away_team_name: 'Away XI',
      home_team_short_code: 'HOM',
      away_team_short_code: 'AWY',
    },
    home_team: { id: 1, name: 'Home XI', short_code: 'HOM' },
    away_team: { id: 2, name: 'Away XI', short_code: 'AWY' },
    tournament: { name: 'Pallandari Super League Season 3' },
    batting_team: 'home',
    score: '120-3',
    overs: '15.2',
    batters: [{ id: 10, name: 'Batter One', runs: 45, balls: 30, on_strike: true }],
    bowler: { name: 'Bowler One', figures: '2/28', overs: '4.0', user_id: 20 },
    current_over_deliveries: testDeliveriesFromTokens(['1', '4', '0']),
    target: 180,
    current_rr: '8.00',
    required_rr: '9.50',
    runs_to_win: 61,
    balls_remaining: 28,
  };
  const overrideContext = overrides.context ?? {};

  const rawSession = {
    active_command: {
      command_key: 'LT_DEFAULT',
      command_type: 'LOWER_THIRD',
      display_mode: 'LT',
      payload: null,
      id: 1,
      ...(overrides.active_command ?? {}),
    },
    context: {
      ...defaultContext,
      ...overrideContext,
      match: {
        ...defaultContext.match,
        ...(overrideContext.match ?? {}),
      },
    },
    config: overrides.config ?? {},
    context_hash: overrides.context_hash,
  };

  return normalizeSession(rawSession, overrides.themeSlug ?? 'theme1');
}

export { PROCESSOR_MAP };
