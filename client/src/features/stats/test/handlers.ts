import { http, HttpResponse } from 'msw';

import { env } from '@/shared/config/env';

import type { PlayerStatsWire, PlayerTeamWire } from '../model/schemas';

const batting = {
  matches: 12,
  innings: 11,
  not_outs: 2,
  runs: 420,
  balls_faced: 310,
  fours: 38,
  sixes: 14,
  dots: 90,
  highest_score: '78*',
  hundreds: 0,
  fifties: 3,
  average: 46.67,
  strike_rate: 135.48,
};

const bowling = {
  matches: 12,
  innings: 8,
  overs: 28.2,
  maidens: 1,
  runs_conceded: 180,
  wickets: 11,
  no_balls: 2,
  wides: 5,
  best_bowling_innings: '3/18',
  best_bowling_match: '3/18',
  five_wickets: 0,
  ten_wickets: 0,
  average: 16.36,
  economy: 6.35,
  strike_rate: 15.45,
};

const fielding = {
  matches: 12,
  catches: 7,
  run_outs: 2,
  stumpings: 0,
};

function statsFor(userId: number): PlayerStatsWire {
  return {
    player_id: userId,
    tournament_type: 'all',
    cricket_format: 'all',
    batting,
    bowling,
    fielding,
  };
}

const teams: PlayerTeamWire[] = [
  { id: 1, name: 'City Blues' },
  { id: 2, name: 'Night Owls' },
  { id: 3, name: 'Gulshan XI' },
  { id: 4, name: 'Tape Ball United' },
];

export const statsHandlers = [
  http.get(`${env.VITE_API_URL}/users/:userId/stats`, ({ params }) => {
    const userId = Number(params.userId);
    return HttpResponse.json({ data: statsFor(userId), type: 'SUCCESS' });
  }),

  http.get(`${env.VITE_API_URL}/users/:userId/teams`, () => {
    return HttpResponse.json({ data: teams, type: 'SUCCESS' });
  }),
];
