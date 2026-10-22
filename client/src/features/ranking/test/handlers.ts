import { http, HttpResponse } from 'msw';

import { env } from '@/shared/config/env';

import type { RankingRowWire } from '../model/schemas';

function battingRow(id: number, name: string, runs: number, sixes: number, fours: number): RankingRowWire {
  return {
    rank: id,
    player_id: id,
    player: { id, name },
    stats: {
      matches: 10,
      innings: 9,
      runs,
      average: runs / 8,
      sixes,
      fours,
    },
  };
}

function bowlingRow(id: number, name: string, wickets: number, economy: number): RankingRowWire {
  return {
    rank: id,
    player_id: id,
    player: { id, name },
    stats: {
      matches: 10,
      innings: 8,
      wickets,
      economy,
    },
  };
}

const batters = [
  battingRow(11, 'Sara Ali', 420, 14, 38),
  battingRow(12, 'Ayesha Khan', 380, 11, 32),
  battingRow(13, 'Imran Noor', 310, 9, 28),
];

const bowlers = [
  bowlingRow(21, 'Bilal Khan', 18, 6.2),
  bowlingRow(22, 'Farhan Ali', 15, 6.8),
  bowlingRow(23, 'Omar Shah', 12, 7.1),
];

export const rankingHandlers = [
  http.get(`${env.VITE_API_URL}/rankings`, ({ request }) => {
    const url = new URL(request.url);
    const category = url.searchParams.get('category') ?? 'batting';
    const sort = url.searchParams.get('sort') ?? 'runs';

    let rankings = batters;
    if (category === 'bowling') rankings = bowlers;
    else if (sort === 'sixes') {
      rankings = [...batters].sort((a, b) => (b.stats?.sixes ?? 0) - (a.stats?.sixes ?? 0));
    } else if (sort === 'fours') {
      rankings = [...batters].sort((a, b) => (b.stats?.fours ?? 0) - (a.stats?.fours ?? 0));
    }

    return HttpResponse.json({
      data: {
        tournament_type: 'open_tournament',
        cricket_format: 'all',
        category,
        sort,
        rankings: rankings.map((row, i) => ({ ...row, rank: i + 1 })),
      },
      type: 'SUCCESS',
    });
  }),
];
