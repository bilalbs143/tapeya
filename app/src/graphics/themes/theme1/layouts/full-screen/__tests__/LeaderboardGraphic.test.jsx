// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { LeaderboardGraphic } from '../LeaderboardGraphic';

vi.mock('../../../primitives', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    FSStage: ({ children }) => <div data-testid="fs-stage">{children}</div>,
  };
});

/** Shape matches leaderboard.adapter.js's toLeaderboardData() output. */
const leaderboardFixture = {
  title: 'HIGHEST RUN SCORERS',
  sub: 'TAPEYA PREMIER LEAGUE',
  data: {
    rows: [
      { rank: 1, name: 'Star Batter', club: 'HOM', value: 220, isNotOut: false },
      { rank: 2, name: 'Second Best', club: 'AWY', value: 180, isNotOut: true },
      { rank: 3, name: '', club: '', value: '' },
    ],
    featured: { name: 'Star Batter', value: 220, club: 'HOM' },
    avatarUrl: 'https://cdn.example/star-batter.jpg',
  },
};

describe('LeaderboardGraphic', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the header title and subtitle', () => {
    render(<LeaderboardGraphic {...leaderboardFixture} />);

    expect(screen.getByText('HIGHEST RUN SCORERS')).toBeTruthy();
    expect(screen.getByText('TAPEYA PREMIER LEAGUE')).toBeTruthy();
  });

  it('renders every row with its rank and value', () => {
    render(<LeaderboardGraphic {...leaderboardFixture} />);

    // "Star Batter" / "220" also appear in the featured panel (rows[0] === featured
    // in this fixture) — assert presence, not uniqueness.
    expect(screen.getAllByText('Star Batter').length).toBeGreaterThan(0);
    expect(screen.getAllByText('220').length).toBeGreaterThan(0);
    expect(screen.getByText('Second Best')).toBeTruthy();
    expect(screen.getByText('180')).toBeTruthy();
  });

  it('renders a placeholder dash for an empty trailing row instead of a blank value', () => {
    const { container } = render(<LeaderboardGraphic {...leaderboardFixture} />);

    // Row 3 has no name/value — buildComponent renders "—" for row.value || '—'.
    expect(container.textContent).toContain('—');
  });

  it('renders the featured player name and value from data.featured', () => {
    render(<LeaderboardGraphic {...leaderboardFixture} />);

    // "Star Batter" and "220" appear both in row 1 and the featured panel —
    // assert at least two occurrences rather than a single unique match.
    expect(screen.getAllByText('Star Batter').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('220').length).toBeGreaterThanOrEqual(2);
  });

  it('renders rows and skips the featured panel — without crashing — when featured is null', () => {
    // leaderboardRows.js's featuredFromLeaderboardRow() returns null whenever the
    // leaderboard has zero rows and no payload override (e.g. a tournament with no
    // fours/sixes/wickets recorded yet). LeaderboardGraphic must degrade gracefully
    // here, not throw — a thrown render is only caught one layer up by
    // GraphicErrorBoundary, which blanks the *entire* command, not just this panel.
    render(<LeaderboardGraphic {...leaderboardFixture} data={{ ...leaderboardFixture.data, featured: null }} />);

    expect(screen.getByText('Second Best')).toBeTruthy();
    expect(screen.queryByRole('img', { name: 'Star Batter' })).toBeNull();
  });

  it('omits the subtitle element entirely when no sub is provided', () => {
    render(<LeaderboardGraphic {...leaderboardFixture} sub={undefined} data={{ ...leaderboardFixture.data, sub: undefined }} />);

    expect(screen.queryByText('TAPEYA PREMIER LEAGUE')).toBeNull();
  });
});
