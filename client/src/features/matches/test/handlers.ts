import { http, HttpResponse } from 'msw';

import { env } from '@/shared/config/env';

import type { QuickMatchWire } from '../model/schemas';

export const matchFixtures: QuickMatchWire[] = [
  {
    id: 1,
    status: 'in_progress',
    status_label: 'In progress',
    cricket_format: 'limited_overs',
    cricket_format_label: 'Limited overs',
    overs: 10,
    venue_name: 'Gaddafi Stadium',
    match_date: '2026-09-16',
    match_time: '16:00',
    created_at: '2026-09-16T10:00:00+00:00',
    tournament: null,
    home_team: { id: 10, name: 'City Blues', logo: null },
    away_team: { id: 11, name: 'Karachi Kings', logo: null },
    toss_winner_team_id: 10,
    can_operate: true,
    is_owner: true,
  },
  {
    id: 2,
    status: 'scheduled',
    status_label: 'Scheduled',
    cricket_format: 'limited_overs',
    cricket_format_label: 'Limited overs',
    overs: 8,
    venue_name: 'Model Town Ground',
    match_date: '2026-09-18',
    match_time: '09:30',
    created_at: '2026-09-15T08:00:00+00:00',
    tournament: null,
    home_team: { id: 12, name: 'Lahore Lions', logo: null },
    away_team: { id: 13, name: 'Multan Heat', logo: null },
    toss_winner_team_id: null,
    can_operate: true,
    is_owner: true,
  },
  {
    id: 3,
    status: 'toss_done',
    status_label: 'Toss done',
    cricket_format: 'limited_overs',
    cricket_format_label: 'Limited overs',
    overs: 12,
    venue_name: null,
    match_date: '2026-09-21',
    match_time: '14:00',
    created_at: '2026-09-14T12:00:00+00:00',
    tournament: { id: 1, name: 'Ramzan Cup', short_name: 'RC' },
    home_team: { id: 14, name: 'Iqbal Club', logo: null },
    away_team: { id: 15, name: 'Defence XI', logo: null },
    toss_winner_team_id: 14,
    can_operate: true,
    is_owner: false,
  },
  {
    id: 4,
    status: 'completed',
    status_label: 'Completed',
    cricket_format: 'limited_overs',
    cricket_format_label: 'Limited overs',
    overs: 10,
    venue_name: 'Oval',
    match_date: '2026-09-10',
    match_time: '11:00',
    created_at: '2026-09-10T06:00:00+00:00',
    tournament: null,
    home_team: { id: 16, name: 'North Zone', logo: null },
    away_team: { id: 17, name: 'South Zone', logo: null },
    toss_winner_team_id: 16,
    can_operate: false,
    is_owner: true,
  },
];

export const matchesHandlers = [
  http.get(`${env.VITE_API_URL}/quick-matches`, () => {
    return HttpResponse.json({
      data: matchFixtures,
      meta: { current_page: 1, last_page: 1, per_page: 50, total: matchFixtures.length },
    });
  }),

  http.post(`${env.VITE_API_URL}/tournaments/:id/matches`, async () => {
    return HttpResponse.json({ data: { id: 901 }, message: 'Match created.', type: 'CREATED' }, { status: 201 });
  }),

  http.patch(`${env.VITE_API_URL}/matches/:id/player-of-match`, () => {
    return HttpResponse.json({ message: 'Man of the match saved.', type: 'SUCCESS' });
  }),

  http.get(`${env.VITE_API_URL}/teams/:teamId/squad`, ({ params }) => {
    const teamId = Number(params.teamId);
    const base = teamId % 2 === 0 ? 10 : 20;
    return HttpResponse.json({
      data: Array.from({ length: 11 }, (_, i) => ({
        id: base + i,
        name: `Player ${base + i}`,
        nickname: null,
        playing_role: i === 0 ? 'Batter' : 'Player',
        batting_style: 'Right Hand',
      })),
      type: 'SUCCESS',
    });
  }),

  http.post(`${env.VITE_API_URL}/teams/:teamId/squad`, async ({ request }) => {
    const body = (await request.json()) as { player_ids?: number[] };
    return HttpResponse.json({
      data: {
        team_id: 0,
        player_ids: body.player_ids ?? [],
      },
      message: 'Team squad updated.',
      type: 'SUCCESS',
    });
  }),

  http.get(`${env.VITE_API_URL}/matches/:id/teams/:teamId/squad`, ({ params }) => {
    const teamId = Number(params.teamId);
    const base = teamId % 2 === 0 ? 10 : 20;
    return HttpResponse.json({
      data: {
        match_id: Number(params.id),
        team_id: teamId,
        player_ids: Array.from({ length: 11 }, (_, i) => base + i),
        captain_id: base,
        wicket_keeper_id: base + 1,
      },
      type: 'SUCCESS',
    });
  }),

  http.post(`${env.VITE_API_URL}/matches/:id/teams/:teamId/squad`, () => {
    return HttpResponse.json({ message: 'Match squad updated.', type: 'SUCCESS' });
  }),

  http.post(`${env.VITE_API_URL}/matches/:id/teams/:teamId/playing-eleven`, () => {
    return HttpResponse.json({ message: 'Playing eleven updated.', type: 'SUCCESS' });
  }),

  http.patch(`${env.VITE_API_URL}/matches/:id/captain`, () => {
    return HttpResponse.json({ message: 'Captain updated.', type: 'SUCCESS' });
  }),

  http.patch(`${env.VITE_API_URL}/matches/:id/wicket-keeper`, () => {
    return HttpResponse.json({ message: 'Wicket keeper updated.', type: 'SUCCESS' });
  }),

  http.post(`${env.VITE_API_URL}/quick-matches/:id/teams/:teamId/players`, async ({ request }) => {
    const body = (await request.json()) as { user_id?: number; name?: string };
    return HttpResponse.json(
      {
        data: {
          player: {
            id: body.user_id ?? 9001,
            name: body.name ?? 'Walk-up',
            nickname: null,
          },
        },
        message: 'Player added.',
        type: 'CREATED',
      },
      { status: 201 }
    );
  }),

  http.get(`${env.VITE_API_URL}/matches/:id/match-state`, ({ params }) => {
    const id = Number(params.id);
    return HttpResponse.json({
      data: {
        match_id: id,
        match_status: 'in_progress',
        active_innings: {
          innings_id: 1,
          innings_number: 2,
          batting_team_id: 11,
          bowling_team_id: 10,
          total_runs: 48,
          total_wickets: 2,
          overs_display: '6.3',
          over_number: 7,
          target: 121,
          runs_to_win: 73,
          balls_remaining: 81,
          current_run_rate: '7.38',
          required_run_rate: '5.40',
          striker: { id: 11, name: 'Ali Khan', runs: 24, balls: 18, fours: 2, sixes: 1 },
          non_striker: { id: 13, name: 'Omar Raza', runs: 12, balls: 14, fours: 1, sixes: 0 },
          bowler: { id: 21, name: 'Sara Ali', overs: '3.3', maidens: 0, runs: 28, wickets: 1 },
          current_over_deliveries: [
            { display_token: '4', chip_type: 'boundary_four' },
            { display_token: '1', chip_type: 'run' },
          ],
        },
        playing_eleven: {
          home: {
            team_id: 10,
            players: [
              { id: 11, name: 'Ali Khan', role: 'batter' },
              { id: 12, name: 'Bilal Ahmed', role: 'all_rounder' },
            ],
          },
          away: {
            team_id: 11,
            players: [
              { id: 21, name: 'Sara Ali', role: 'bowler' },
              { id: 22, name: 'Hassan Khan', role: 'batter' },
            ],
          },
        },
        match_complete: false,
        analytics_settings: { wagon_wheel_enabled: true },
      },
      type: 'SUCCESS',
    });
  }),

  http.get(`${env.VITE_API_URL}/matches/:id`, ({ params }) => {
    const id = Number(params.id);
    const row = matchFixtures.find((m) => m.id === id) ?? matchFixtures[0];
    if (!row) {
      return HttpResponse.json({ message: 'Match not found.', type: 'NOT_FOUND' }, { status: 404 });
    }
    return HttpResponse.json({
      data: {
        id,
        status: row.status,
        overs: row.overs,
        venue_name: row.venue_name,
        players_per_side: 11,
        tournament_id: 1,
        kind: 'tournament',
        can_operate: row.can_operate,
        home_team_id: row.home_team?.id ?? null,
        away_team_id: row.away_team?.id ?? null,
        home_team: row.home_team ? { id: row.home_team.id, name: row.home_team.name, code: null } : null,
        away_team: row.away_team ? { id: row.away_team.id, name: row.away_team.name, code: null } : null,
        toss_winner_team_id: row.toss_winner_team_id,
        chose_to_bat_or_bowl: row.toss_winner_team_id != null ? 'bat' : null,
        result_summary: row.status === 'completed' ? 'North Zone won by 18 runs' : null,
        player_of_match: row.status === 'completed' ? { id: 99, name: 'Sara Ali' } : null,
        analytics_settings: {
          wagon_wheel_enabled: true,
          umpires: 'A. Umpire',
          scorers: null,
          commentators: null,
        },
      },
      type: 'SUCCESS',
    });
  }),

  http.patch(`${env.VITE_API_URL}/matches/:id/analytics-settings`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      data: {
        analytics_settings: {
          wagon_wheel_enabled: Boolean(body.wagon_wheel_enabled ?? true),
          umpires: typeof body.umpires === 'string' ? body.umpires : body.umpires === null ? null : 'A. Umpire',
          scorers: typeof body.scorers === 'string' ? body.scorers : null,
          commentators: typeof body.commentators === 'string' ? body.commentators : null,
        },
      },
      message: 'Settings updated.',
      type: 'SUCCESS',
    });
  }),

  http.get(`${env.VITE_API_URL}/graphic-themes`, () =>
    HttpResponse.json({
      data: [
        {
          id: 1,
          slug: 'broadcast-blue',
          name: 'Broadcast Blue',
          config_schema: {
            properties: [
              { key: 'primaryColor', label: 'Primary', type: 'color', default: '#0063BF' },
              { key: 'enableImages', label: 'Show player photos', type: 'boolean', default: true },
            ],
          },
          default_config: { primaryColor: '#0063BF', enableImages: true },
          is_active: true,
        },
        {
          id: 2,
          slug: 'night-amber',
          name: 'Night Amber',
          config_schema: {
            properties: [{ key: 'primaryColor', label: 'Primary', type: 'color', default: '#2AA449' }],
          },
          default_config: { primaryColor: '#2AA449' },
          is_active: true,
        },
      ],
      type: 'SUCCESS',
    })
  ),

  http.get(`${env.VITE_API_URL}/matches/:id/graphic-session`, () =>
    HttpResponse.json({ message: 'Graphic session not configured for this match.', type: 'NOT_FOUND' }, { status: 404 })
  ),

  http.put(`${env.VITE_API_URL}/matches/:id/graphic-session`, async ({ request, params }) => {
    const body = (await request.json()) as {
      graphic_theme_id?: number;
      config?: Record<string, unknown>;
    };
    const id = Number(params.id);
    return HttpResponse.json({
      data: {
        id: 1,
        match_id: id,
        graphic_theme_id: body.graphic_theme_id ?? 1,
        config: body.config ?? { primaryColor: '#0063BF' },
        signed_overlay_url: `https://graphics.example/overlay?match=${id}&k=abcd1234efgh5678`,
        signed_overlay_expires_at: new Date(Date.now() + 86_400_000).toISOString(),
      },
      message: 'Graphic session ready.',
      type: 'SUCCESS',
    });
  }),

  http.get(`${env.VITE_API_URL}/matches/:id/graphic-session/signed-url`, ({ params }) => {
    const id = Number(params.id);
    return HttpResponse.json({
      data: {
        url: `https://graphics.example/overlay?match=${id}&k=zzzz9999yyyy8888`,
        expires_at: new Date(Date.now() + 86_400_000).toISOString(),
      },
      type: 'SUCCESS',
    });
  }),

  http.post(`${env.VITE_API_URL}/matches/:id/innings/:inningsId/balls`, async ({ request, params }) => {
    const body = (await request.json()) as { is_wicket?: boolean; dismissal_type?: string | null };
    const id = Number(params.id);
    return HttpResponse.json({
      type: 'SUCCESS',
      message: null,
      data: {
        ball: {
          id: 1,
          is_wicket: Boolean(body.is_wicket),
          dismissal_type: body.dismissal_type ?? null,
          dismissal_type_label: body.dismissal_type ? 'Bowled' : null,
          out_player_id: body.is_wicket ? 11 : null,
          out_player_name: body.is_wicket ? 'Ali Khan' : null,
          bowler_id: 21,
          fielder_id: null,
          out_player_stats: body.is_wicket ? { runs: 12, balls: 10, fours: 1, sixes: 0, strike_rate: '120.0' } : null,
        },
        match_state: {
          match_id: id,
          match_status: 'in_progress',
          needs_new_batter: Boolean(body.is_wicket),
          active_innings: {
            innings_id: 1,
            innings_number: 1,
            total_runs: 48,
            total_wickets: body.is_wicket ? 3 : 2,
            overs_display: '6.4',
          },
          match_complete: false,
          analytics_settings: { wagon_wheel_enabled: true },
        },
      },
    });
  }),

  http.get(`${env.VITE_API_URL}/matches/:id/scorecard`, ({ params }) => {
    const id = Number(params.id);
    return HttpResponse.json({
      type: 'SUCCESS',
      data: {
        match_id: id,
        innings: [
          {
            id: 1,
            innings_number: 1,
            status: 'in_progress',
            batting_team: { id: 10, name: 'City Blues' },
            bowling_team: { id: 11, name: 'Karachi Kings' },
            total_runs: 48,
            total_wickets: 2,
            overs_display: '6.3',
            batting_stats: [
              {
                id: 11,
                name: 'Ali Khan',
                runs: 24,
                balls: 18,
                fours: 2,
                sixes: 1,
                strike_rate: 133.3,
                dismissal_type: null,
                dismissal_label: null,
                bowler_name: null,
                fielder_name: null,
                is_on_crease: true,
                is_retired_hurt: false,
              },
              {
                id: 12,
                name: 'Bilal Ahmed',
                runs: 12,
                balls: 10,
                fours: 1,
                sixes: 0,
                strike_rate: 120.0,
                dismissal_type: 'bowled',
                dismissal_label: 'Bowled',
                bowler_name: 'Sara Ali',
                fielder_name: null,
                is_on_crease: false,
                is_retired_hurt: false,
              },
            ],
            bowling_stats: [
              {
                id: 21,
                name: 'Sara Ali',
                overs: '3.3',
                maidens: 0,
                runs: 28,
                wickets: 1,
                economy: 8.0,
              },
            ],
            fall_of_wickets: [{ wicket_number: 1, batsman_name: 'Bilal Ahmed', score: 18, overs: '2.4' }],
            extras_breakdown: { wides: 2, no_balls: 1, byes: 0, leg_byes: 1, penalty_runs: 0 },
            total_extras: 4,
            run_rate: 7.38,
            current_striker_id: 11,
            partnerships: [
              {
                player_1_id: 12,
                player_2_id: 11,
                player_1_runs: 12,
                player_1_balls: 10,
                player_2_runs: 6,
                player_2_balls: 8,
                runs: 18,
                balls: 18,
                wicket_number: 1,
              },
              {
                player_1_id: 11,
                player_2_id: 13,
                player_1_runs: 18,
                player_1_balls: 10,
                player_2_runs: 12,
                player_2_balls: 14,
                runs: 30,
                balls: 24,
                wicket_number: null,
              },
            ],
            balls: [
              {
                id: 100,
                over: 0,
                ball_in_over: 1,
                striker_id: 11,
                bowler_id: 21,
                runs: 4,
                runs_off_bat: 4,
                is_wide: false,
                is_no_ball: false,
                is_bye: false,
                is_leg_bye: false,
                is_wicket: false,
                penalty_runs: 0,
                additional_runs: 0,
                shot_position: 'cover',
                presentation: {
                  display_token: '4',
                  chip_type: 'boundary_four',
                  label: '4',
                  runs_total: 4,
                },
              },
            ],
          },
        ],
      },
    });
  }),

  http.patch(`${env.VITE_API_URL}/matches/:id/innings/:inningsId/balls/:ballId`, async ({ request, params }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const id = Number(params.id);
    return HttpResponse.json({
      type: 'SUCCESS',
      message: 'Ball updated.',
      data: {
        ball: {
          id: Number(params.ballId),
          runs_off_bat: body.runs_off_bat ?? 0,
          is_wide: Boolean(body.is_wide),
          shot_position: body.shot_position ?? null,
        },
        match_state: {
          match_id: id,
          match_status: 'in_progress',
          active_innings: {
            innings_id: Number(params.inningsId),
            innings_number: 1,
            total_runs: 50,
            total_wickets: 2,
            overs_display: '6.3',
          },
          match_complete: false,
        },
      },
    });
  }),

  http.delete(`${env.VITE_API_URL}/matches/:id/innings/:inningsId/balls/:ballId`, ({ params }) => {
    const id = Number(params.id);
    return HttpResponse.json({
      type: 'SUCCESS',
      message: 'Ball deleted.',
      data: {
        match_state: {
          match_id: id,
          match_status: 'in_progress',
          active_innings: {
            innings_id: Number(params.inningsId),
            innings_number: 1,
            total_runs: 44,
            total_wickets: 2,
            overs_display: '6.2',
          },
          match_complete: false,
        },
      },
    });
  }),
];
