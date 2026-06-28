import { describe, expect, it } from 'vitest';

import { normalizeBatters, normalizeSession, normalizeTeam, resolveContextTeams } from '@/graphics/core/normalizeSession';
import { normalizeTournament } from '@/graphics/core/normalizeSession/match';

describe('normalizeTournament', () => {
  it('maps broadcast short and API short_name to shortCode', () => {
    expect(
      normalizeTournament({
        tournament: { name: 'Pakistan Super League', short: 'PSL', logo_url: 'https://example.com/psl.png' },
      }),
    ).toMatchObject({
      name: 'Pakistan Super League',
      shortCode: 'PSL',
      logoUrl: 'https://example.com/psl.png',
    });

    expect(
      normalizeTournament({
        tournament: { name: 'Pakistan Super League', short_name: 'PSL' },
      }),
    ).toMatchObject({
      shortCode: 'PSL',
    });
  });
});

describe('resolveContextTeams', () => {
  it('fills team names and codes from context.match when team objects are absent', () => {
    const teams = resolveContextTeams({
      match: {
        home_team_id: 1,
        away_team_id: 2,
        home_team_name: 'Home XI',
        away_team_name: 'Away XI',
        home_team_short_code: 'HOM',
        away_team_short_code: 'AWY',
        home_team_logo_url: 'https://example.com/home.png',
        away_team_logo_url: null,
      },
    });

    expect(teams.home_team).toMatchObject({
      id: 1,
      name: 'Home XI',
      short_code: 'HOM',
      logo_url: 'https://example.com/home.png',
    });
    expect(teams.away_team).toMatchObject({
      id: 2,
      name: 'Away XI',
      short_code: 'AWY',
      logo_url: null,
    });
  });

  it('prefers explicit home_team / away_team over match fallbacks', () => {
    const teams = resolveContextTeams({
      match: { home_team_name: 'From Match', away_team_name: 'Away Match' },
      home_team: { name: 'From Team Object', short_code: 'HTO' },
      away_team: { name: 'Away Team Object', short_code: 'ATO' },
    });

    expect(teams.home_team.name).toBe('From Team Object');
    expect(teams.home_team.short_code).toBe('HTO');
    expect(teams.away_team.name).toBe('Away Team Object');
  });
});

describe('normalizeTeam', () => {
  it('maps snake_case API fields to camelCase', () => {
    expect(
      normalizeTeam({
        id: 5,
        name: 'Lions',
        short_code: 'LIO',
        abbrev_display: 'L',
        logo_url: 'https://example.com/logo.png',
      }),
    ).toEqual({
      id: 5,
      name: 'Lions',
      shortCode: 'LIO',
      abbrevDisplay: 'L',
      logoUrl: 'https://example.com/logo.png',
    });
  });
});

describe('normalizeBatters', () => {
  it('normalizes striker flags and stat fields', () => {
    const batters = normalizeBatters([
      { user_id: 10, name: 'Striker', runs: 40, balls: 25, on_strike: true },
      { id: 11, name: 'Non-striker', runs: 12, balls: 8, on_strike: false },
    ]);

    expect(batters[0]).toMatchObject({ id: 10, onStrike: true, runs: 40 });
    expect(batters[1]).toMatchObject({ id: 11, onStrike: false, runs: 12 });
  });

  it('returns empty array for non-array input', () => {
    expect(normalizeBatters(null)).toEqual([]);
  });

  it('maps player image fields to imageUrl', () => {
    const batters = normalizeBatters([
      { name: 'Left', image_url: 'https://cdn.example/left.jpg' },
      { name: 'Right', avatar_url: 'https://cdn.example/right.jpg' },
    ]);

    expect(batters[0].imageUrl).toBe('https://cdn.example/left.jpg');
    expect(batters[1].imageUrl).toBe('https://cdn.example/right.jpg');
  });
});

describe('normalizeSession', () => {
  it('returns null for invalid session input', () => {
    expect(normalizeSession(null, 'theme1')).toBeNull();
    expect(normalizeSession(undefined, 'theme1')).toBeNull();
  });

  it('maps active command and live scoreboard fields from a full HTTP-shaped session', () => {
    const snapshot = normalizeSession(
      {
        active_command: {
          id: 42,
          command_key: 'LT_DEFAULT',
          command_type: 'LOWER_THIRD',
          display_mode: 'LT',
          payload: { note: 'operator override' },
        },
        context_hash: 'server-hash-abc',
        config: {
          homeBgColor: '#111',
          awayBgColor: '#222',
          homeTextColor: '#fff',
          awayTextColor: '#eee',
          enableImages: true,
        },
        context: {
          match: {
            home_team_id: 1,
            away_team_id: 2,
            home_team_name: 'Home XI',
            away_team_name: 'Away XI',
            officials: {
              umpires: { text: 'Ump 1, Ump 2', lines: ['Ump 1', 'Ump 2'] },
            },
          },
          batting_team: 'home',
          score: '120-3',
          overs: '15.2',
          batters: [{ id: 10, name: 'Batter One', runs: 45, balls: 30, on_strike: true }],
          bowler: { name: 'Bowler One', figures: '2/28', overs: '4.0', user_id: 20 },
          current_over_deliveries: [
            {
              display_token: '4',
              chip_type: 'four',
              is_free_hit: false,
              runs_total: 4,
              over_number: 14,
              ball_in_over: 3,
              is_legal: true,
            },
          ],
          target: 180,
          current_rr: '8.00',
          required_rr: '9.50',
        },
      },
      'theme1',
    );

    expect(snapshot).toMatchObject({
      commandKey: 'LT_DEFAULT',
      commandId: 42,
      commandType: 'LOWER_THIRD',
      displayMode: 'LT',
      themeSlug: 'theme1',
      contextHash: 'server-hash-abc',
      payload: { note: 'operator override' },
      config: {
        homeTextColor: '#fff',
        enableImages: true,
      },
      match: {
        homeTeamName: 'Home XI',
        officials: {
          umpires: { text: 'Ump 1, Ump 2', lines: ['Ump 1', 'Ump 2'] },
        },
      },
      live: {
        battingTeamSide: 'home',
        battingTeam: expect.objectContaining({ score: '120-3', overs: '15.2' }),
        target: 180,
        currentRR: '8.00',
        currentOverDeliveries: [
          expect.objectContaining({
            displayToken: '4',
            chipType: 'four',
            overNumber: 14,
            ballInOver: 3,
          }),
        ],
      },
    });
  });

  it('supports Reverb-minimal context with match-only team fields', () => {
    const snapshot = normalizeSession(
      {
        active_command: {
          id: 7,
          command_key: 'RUN_RATE',
          command_type: 'LOWER_THIRD',
          display_mode: 'LT',
        },
        context: {
          match: {
            home_team_id: 1,
            away_team_id: 2,
            home_team_name: 'Home XI',
            away_team_name: 'Away XI',
            home_team_short_code: 'HOM',
            away_team_short_code: 'AWY',
          },
          batting_team: 'away',
          score: '88-4',
          overs: '10.0',
        },
      },
      'theme1',
    );

    expect(snapshot?.live.battingTeamSide).toBe('away');
    expect(snapshot?.live.battingTeam).toMatchObject({
      name: 'Away XI',
      shortCode: 'AWY',
      score: '88-4',
    });
    expect(snapshot?.live.bowlingTeam).toMatchObject({
      name: 'Home XI',
      shortCode: 'HOM',
    });
  });

  it('computes contextHash when session omits context_hash', () => {
    const context = { score: '50-1', overs: '5.0', batting_team: 'home' };
    const a = normalizeSession({ active_command: { command_key: 'LT_DEFAULT' }, context }, 'theme1');
    const b = normalizeSession({ active_command: { command_key: 'LT_DEFAULT' }, context: { ...context } }, 'theme1');

    expect(a?.contextHash).toBeTruthy();
    expect(a?.contextHash).toBe(b?.contextHash);
  });

  it('maps wagon wheel flag and ball payloads from match + context', () => {
    const snapshot = normalizeSession(
      {
        active_command: { command_key: 'WAGON_WHEEL' },
        context: {
          match: { wagon_wheel_enabled: true },
          wagon_wheel_balls: [{ type: 'four', shot_direction: 'cover', runs: 4, striker_id: 99 }],
        },
      },
      'theme1',
    );

    expect(snapshot?.live.wagonWheelEnabled).toBe(true);
    expect(snapshot?.live.wagonWheelBalls).toEqual([{ type: 'four', shotDirection: 'cover', runs: 4, strikerId: 99 }]);
  });

  it('normalizes at-stage mirror innings for AT_STAGE processors', () => {
    const snapshot = normalizeSession(
      {
        active_command: { command_key: 'AT_STAGE' },
        context: {
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
        },
      },
      'theme1',
    );

    expect(snapshot?.live.atStageMirror).toMatchObject({
      battingTeam: 'home',
      score: '100-5',
      inningsLabel: '1st Innings',
      batters: [expect.objectContaining({ name: 'A', onStrike: true })],
    });
  });
});
