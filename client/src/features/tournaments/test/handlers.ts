import { http, HttpResponse } from 'msw';

import { env } from '@/shared/config/env';

import type { TournamentWire } from '../model/schemas';

const fixtures: TournamentWire[] = [
  {
    id: 1,
    tournament_name: 'Ramzan Cup',
    short_name: 'RC',
    tournament_type: 'open_tournament',
    city: 'Karachi',
    start_date: '2026-11-01',
    end_date: '2026-12-15',
    cover_image: null,
    teams_count: 4,
    matches_count: 2,
    can_manage: true,
    status: 'active',
    status_label: 'Active',
    venue_name: 'Gulshan Ground',
    prize: 'PKR 100,000',
    number_of_teams: 8,
    number_of_groups: 2,
    country: 'Pakistan',
    likes_count: 12,
    dislikes_count: 1,
    shares_count: 3,
    my_reaction: null,
    interest_campaign_slug: 'ramzan-cup-2026',
  },
  {
    id: 2,
    tournament_name: 'Sunday Sixes',
    short_name: 'SS6',
    tournament_type: 'private_tournament',
    city: 'Lahore',
    start_date: '2025-11-01',
    end_date: '2025-11-30',
    cover_image: null,
    teams_count: 6,
    matches_count: 15,
    can_manage: true,
    status: 'inactive',
    status_label: 'Inactive',
    venue_name: 'Model Town',
    prize: null,
    number_of_teams: 6,
    country: 'Pakistan',
  },
];

const matchFixtures = [
  {
    id: 101,
    match_date: '2026-11-05',
    match_time: '16:00:00',
    venue_name: 'Gulshan Ground',
    status: 'scheduled',
    status_label: 'Scheduled',
    group_index: 1,
    home_team: { id: 10, name: 'City Blues', logo: null, code: 'CBC' },
    away_team: { id: 11, name: 'Karachi Kings', logo: null, code: 'KK' },
  },
  {
    id: 102,
    match_date: '2026-11-05',
    match_time: '19:30:00',
    venue_name: 'Gulshan Ground',
    status: 'live',
    status_label: 'Live',
    group_index: 1,
    home_team: { id: 12, name: 'Lahore Lions', logo: null, code: 'LL' },
    away_team: { id: 10, name: 'City Blues', logo: null, code: 'CBC' },
  },
];

export const tournamentsHandlers = [
  http.get(`${env.VITE_API_URL}/tournaments`, () => {
    return HttpResponse.json({
      data: fixtures,
      meta: { current_page: 1, last_page: 1, per_page: 15, total: fixtures.length },
    });
  }),

  http.get(`${env.VITE_API_URL}/tournaments/:id`, ({ params }) => {
    const tournament = fixtures.find((t) => t.id === Number(params.id));
    if (!tournament) {
      return HttpResponse.json({ message: 'Not found.', type: 'NOT_FOUND' }, { status: 404 });
    }
    return HttpResponse.json({ data: tournament, type: 'SUCCESS' });
  }),

  http.get(`${env.VITE_API_URL}/tournaments/:id/matches`, ({ params }) => {
    const tournamentId = Number(params.id);
    if (!fixtures.some((t) => t.id === tournamentId)) {
      return HttpResponse.json({ message: 'Not found.', type: 'NOT_FOUND' }, { status: 404 });
    }
    return HttpResponse.json({
      data: tournamentId === 1 ? matchFixtures : [],
      type: 'SUCCESS',
    });
  }),

  http.post(`${env.VITE_API_URL}/tournaments/:id/like`, ({ params }) => {
    const tournament = fixtures.find((t) => t.id === Number(params.id));
    if (!tournament) {
      return HttpResponse.json({ message: 'Not found.', type: 'NOT_FOUND' }, { status: 404 });
    }
    return HttpResponse.json({
      data: {
        likes_count: (tournament.likes_count ?? 0) + 1,
        dislikes_count: tournament.dislikes_count ?? 0,
        shares_count: tournament.shares_count ?? 0,
        my_reaction: 'like',
      },
      type: 'SUCCESS',
    });
  }),

  http.post(`${env.VITE_API_URL}/tournaments/:id/dislike`, ({ params }) => {
    const tournament = fixtures.find((t) => t.id === Number(params.id));
    if (!tournament) {
      return HttpResponse.json({ message: 'Not found.', type: 'NOT_FOUND' }, { status: 404 });
    }
    return HttpResponse.json({
      data: {
        likes_count: tournament.likes_count ?? 0,
        dislikes_count: (tournament.dislikes_count ?? 0) + 1,
        shares_count: tournament.shares_count ?? 0,
        my_reaction: 'dislike',
      },
      type: 'SUCCESS',
    });
  }),

  http.post(`${env.VITE_API_URL}/tournaments/:id/share`, ({ params }) => {
    const tournament = fixtures.find((t) => t.id === Number(params.id));
    if (!tournament) {
      return HttpResponse.json({ message: 'Not found.', type: 'NOT_FOUND' }, { status: 404 });
    }
    return HttpResponse.json({
      data: {
        likes_count: tournament.likes_count ?? 0,
        dislikes_count: tournament.dislikes_count ?? 0,
        shares_count: (tournament.shares_count ?? 0) + 1,
      },
      type: 'SUCCESS',
    });
  }),

  http.get(`${env.VITE_API_URL}/tournaments/:id/season-stats`, ({ params }) => {
    const tournamentId = Number(params.id);
    if (!fixtures.some((t) => t.id === tournamentId)) {
      return HttpResponse.json({ message: 'Not found.', type: 'NOT_FOUND' }, { status: 404 });
    }
    return HttpResponse.json({
      data: {
        tournament_id: tournamentId,
        total_fours: 48,
        total_sixes: 19,
        top_run_scorers: [
          {
            player_id: 21,
            name: 'A. Khan',
            runs: 186,
            innings: 4,
            average: 62,
            fours: 18,
            sixes: 7,
          },
          {
            player_id: 22,
            name: 'B. Riaz',
            runs: 142,
            innings: 4,
            average: 35.5,
            fours: 12,
            sixes: 4,
          },
        ],
        top_wicket_takers: [
          {
            player_id: 31,
            name: 'C. Ali',
            wickets: 9,
            overs: 14,
            runs_conceded: 78,
            economy: 5.57,
          },
          {
            player_id: 32,
            name: 'D. Noor',
            wickets: 7,
            overs: 12.2,
            runs_conceded: 61,
            economy: 4.97,
          },
        ],
        most_fours: [],
        most_sixes: [],
      },
      type: 'SUCCESS',
    });
  }),

  http.get(`${env.VITE_API_URL}/tournaments/:id/standings`, ({ params }) => {
    const tournamentId = Number(params.id);
    const tournament = fixtures.find((t) => t.id === tournamentId);
    if (!tournament) {
      return HttpResponse.json({ message: 'Not found.', type: 'NOT_FOUND' }, { status: 404 });
    }

    if ((tournament.number_of_groups ?? 1) > 1) {
      return HttpResponse.json({
        data: {
          tournament_id: tournamentId,
          number_of_groups: 2,
          groups: [
            {
              group_index: 1,
              group_name: 'Group 1',
              standings: [
                {
                  team_id: 10,
                  team_name: 'City Blues',
                  played: 2,
                  won: 2,
                  lost: 0,
                  tied: 0,
                  no_result: 0,
                  points: 4,
                  nrr: 1.24,
                },
                {
                  team_id: 11,
                  team_name: 'Karachi Kings',
                  played: 2,
                  won: 1,
                  lost: 1,
                  tied: 0,
                  no_result: 0,
                  points: 2,
                  nrr: 0.15,
                },
              ],
            },
            {
              group_index: 2,
              group_name: 'Group 2',
              standings: [
                {
                  team_id: 12,
                  team_name: 'Lahore Lions',
                  played: 2,
                  won: 1,
                  lost: 1,
                  tied: 0,
                  no_result: 0,
                  points: 2,
                  nrr: -0.1,
                },
                {
                  team_id: 13,
                  team_name: 'Gulshan AC',
                  played: 2,
                  won: 0,
                  lost: 2,
                  tied: 0,
                  no_result: 0,
                  points: 0,
                  nrr: -1.05,
                },
              ],
            },
          ],
        },
        type: 'SUCCESS',
      });
    }

    return HttpResponse.json({
      data: {
        tournament_id: tournamentId,
        standings: [
          {
            team_id: 10,
            team_name: 'City Blues',
            played: 4,
            won: 3,
            lost: 1,
            tied: 0,
            no_result: 0,
            points: 6,
            nrr: 0.84,
          },
          {
            team_id: 11,
            team_name: 'Karachi Kings',
            played: 4,
            won: 2,
            lost: 2,
            tied: 0,
            no_result: 0,
            points: 4,
            nrr: -0.12,
          },
        ],
      },
      type: 'SUCCESS',
    });
  }),

  http.get(`${env.VITE_API_URL}/tournaments/:id/teams`, ({ params }) => {
    const tournamentId = Number(params.id);
    if (!fixtures.some((t) => t.id === tournamentId)) {
      return HttpResponse.json({ message: 'Not found.', type: 'NOT_FOUND' }, { status: 404 });
    }
    return HttpResponse.json({
      data: [
        {
          id: 10,
          name: 'City Blues',
          logo: null,
          code: 'CBC',
          country: 'Pakistan',
          city: 'Karachi',
          sponsor: null,
          icon_players: null,
          group_index: 1,
        },
        {
          id: 11,
          name: 'Karachi Kings',
          logo: null,
          code: 'KK',
          country: 'Pakistan',
          city: 'Karachi',
          sponsor: null,
          icon_players: null,
          group_index: 1,
        },
        {
          id: 12,
          name: 'Lahore Lions',
          logo: null,
          code: 'LL',
          country: 'Pakistan',
          city: 'Lahore',
          sponsor: null,
          icon_players: null,
          group_index: 2,
        },
      ],
      type: 'SUCCESS',
    });
  }),

  http.get(`${env.VITE_API_URL}/teams`, ({ request }) => {
    const url = new URL(request.url);
    const search = (url.searchParams.get('search') ?? '').trim().toLowerCase();
    const pool = [
      {
        id: 20,
        name: 'Multan Heat',
        logo: null,
        code: 'MH',
        country: 'Pakistan',
        city: 'Multan',
        sponsor: null,
        icon_players: null,
      },
      {
        id: 21,
        name: 'Peshawar Zalmi',
        logo: null,
        code: 'PZ',
        country: 'Pakistan',
        city: 'Peshawar',
        sponsor: null,
        icon_players: null,
      },
    ];
    const data = search
      ? pool.filter((t) => t.name.toLowerCase().includes(search) || t.code.toLowerCase().includes(search))
      : [];
    return HttpResponse.json({ data, type: 'SUCCESS' });
  }),

  http.post(`${env.VITE_API_URL}/teams`, async ({ request }) => {
    const body = (await request.json()) as {
      name: string;
      code: string;
      country: string;
      city: string;
      sponsor?: string | null;
      icon_players?: string | null;
    };
    return HttpResponse.json(
      {
        data: {
          id: 30,
          name: body.name,
          code: body.code,
          country: body.country,
          city: body.city,
          logo: null,
          sponsor: body.sponsor ?? null,
          icon_players: body.icon_players ?? null,
        },
        message: 'Team created.',
        type: 'CREATED',
      },
      { status: 201 }
    );
  }),

  http.post(`${env.VITE_API_URL}/tournaments/:id/teams`, () => {
    return HttpResponse.json({
      message: 'Teams attached to tournament.',
      type: 'SUCCESS',
    });
  }),

  http.delete(`${env.VITE_API_URL}/tournaments/:id/teams/:teamId`, () => {
    return HttpResponse.json({
      message: 'Team removed from tournament.',
      type: 'SUCCESS',
    });
  }),

  http.get(`${env.VITE_API_URL}/tournaments/:id/squad-occupancy`, ({ params, request }) => {
    const tournamentId = Number(params.id);
    if (!fixtures.some((t) => t.id === tournamentId)) {
      return HttpResponse.json({ message: 'Not found.', type: 'NOT_FOUND' }, { status: 404 });
    }
    const url = new URL(request.url);
    const exclude = url.searchParams.get('exclude_team_id');
    const rows = [
      {
        player_id: 99,
        player_name: 'Imran Taken',
        team_id: 11,
        team_name: 'Karachi Kings',
      },
    ].filter((row) => exclude == null || String(row.team_id) !== exclude);
    return HttpResponse.json({ data: rows, type: 'SUCCESS' });
  }),

  http.post(`${env.VITE_API_URL}/tournaments`, async ({ request }) => {
    const body = (await request.json()) as {
      tournament_name: string;
      short_name: string;
      city: string;
      tournament_type: TournamentWire['tournament_type'];
      number_of_teams: number;
    };
    const created: TournamentWire = {
      id: fixtures.length + 1,
      tournament_name: body.tournament_name,
      short_name: body.short_name,
      tournament_type: body.tournament_type,
      city: body.city,
      start_date: null,
      end_date: null,
      cover_image: null,
      teams_count: 0,
      matches_count: 0,
      can_manage: true,
      status: 'active',
      status_label: 'Active',
      number_of_teams: body.number_of_teams,
      venue_name: null,
      prize: null,
    };
    return HttpResponse.json({ data: created, message: 'Tournament created.', type: 'CREATED' }, { status: 201 });
  }),
];
