import { describe, expect, it } from 'vitest';

import { type LiveScoreWire, toHomeLiveMatch, toHomeProduct } from './homeSchemas';

const sampleRow: LiveScoreWire = {
  id: 12,
  tournament_id: 3,
  match_label: 'WPL',
  overs_limit: 50,
  home_team: { id: 1, name: 'Karachi Kids', logo: null },
  away_team: { id: 2, name: 'Rawalpindi Royals', logo: null },
  tournament: { id: 3, name: 'Women Premier League', short_name: 'WPL' },
  innings: [
    {
      innings_number: 1,
      innings_status: 'completed',
      batting_team_id: 1,
      total_runs: 234,
      total_wickets: 7,
      overs_display: '50.0',
    },
    {
      innings_number: 2,
      innings_status: 'in_progress',
      batting_team_id: 2,
      total_runs: 27,
      total_wickets: 1,
      overs_display: '4.4',
      target: 235,
      runs_to_win: 208,
      balls_remaining: 272,
    },
  ],
  active_innings: {
    innings_number: 2,
    innings_status: 'in_progress',
    batting_team_id: 2,
    total_runs: 27,
    total_wickets: 1,
    overs_display: '4.4',
    current_run_rate: '5.79',
    target: 235,
    runs_to_win: 208,
    balls_remaining: 272,
  },
};

describe('homeSchemas', () => {
  it('maps live score rows into home match cards with chase', () => {
    const match = toHomeLiveMatch(sampleRow);
    expect(match).not.toBeNull();
    expect(match?.label).toBe('WPL');
    expect(match?.homeScore).toBe('234/7');
    expect(match?.awayScore).toBe('27/1');
    expect(match?.batting).toBe('away');
    expect(match?.chase).toEqual({
      target: 235,
      runs: 27,
      ballsLeft: 272,
      rrr: null,
    });
  });

  it('formats popular products for rails', () => {
    const product = toHomeProduct({
      id: 9,
      slug: 'ca-plus-bat',
      name: 'CA Plus bat',
      price: 6400,
      sale_price: null,
      is_featured: true,
      images: [{ path: 'https://cdn.example/bat.jpg' }],
      brand: { name: 'CA' },
      vendor: { store_name: 'Sadar Sports', slug: 'sadar-sports' },
    });
    expect(product.price).toBe('PKR 6,400');
    expect(product.badge).toBe('NEW');
    expect(product.image).toBe('https://cdn.example/bat.jpg');
    expect(product.slug).toBe('ca-plus-bat');
    expect(product.vendorSlug).toBe('sadar-sports');
  });
});
