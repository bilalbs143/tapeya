// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MatchFixtureBar } from '../MatchFixtureBar';

beforeEach(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      disconnect() {}
    },
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const teams = {
  home: { teamCode: 'home', displayName: 'HOME XI', color: '#0055ff' },
  away: { teamCode: 'away', displayName: 'AWAY XI', color: '#ff5500' },
};

// InsetLTBarSurface renders a visible copy plus an off-screen hidden clone for
// width measurement, so every real text node appears twice — getAllByText, not
// getByText, is the correct query here.
describe('MatchFixtureBar', () => {
  it('renders team | VS | team with no caption when title and detail are empty (plain intro)', () => {
    render(
      <MatchFixtureBar
        fixture={{
          teams: [{ teamCode: 'home' }, { teamCode: 'away' }],
          vsLabel: 'VS',
          title: '',
          matchDetail: '',
        }}
        teams={teams}
      />,
    );

    expect(screen.getAllByText('HOME XI').length).toBeGreaterThan(0);
    expect(screen.getAllByText('AWAY XI').length).toBeGreaterThan(0);
    expect(screen.getAllByText('VS').length).toBeGreaterThan(0);
  });

  it('puts title in the caption pill and keeps team | VS | team in the bar (INTRO_LT)', () => {
    render(
      <MatchFixtureBar
        fixture={{
          teams: [{ teamCode: 'home' }, { teamCode: 'away' }],
          vsLabel: 'VS',
          title: 'TAPEYA PREMIER LEAGUE',
          matchDetail: '',
        }}
        teams={teams}
      />,
    );

    expect(screen.getAllByText('TAPEYA PREMIER LEAGUE').length).toBeGreaterThan(0);
    expect(screen.getAllByText('HOME XI').length).toBeGreaterThan(0);
    expect(screen.getAllByText('AWAY XI').length).toBeGreaterThan(0);
    expect(screen.getAllByText('VS').length).toBeGreaterThan(0);
  });

  it('puts matchDetail in the caption pill for toss / result copy', () => {
    render(
      <MatchFixtureBar
        fixture={{
          teams: [{ teamCode: 'home' }, { teamCode: 'away' }],
          vsLabel: 'VS',
          title: '',
          matchDetail: 'HOME XI WON THE TOSS AND ELECTED TO BAT FIRST',
        }}
        teams={teams}
      />,
    );

    expect(screen.getAllByText('HOME XI WON THE TOSS AND ELECTED TO BAT FIRST').length).toBeGreaterThan(0);
    expect(screen.getAllByText('HOME XI').length).toBeGreaterThan(0);
    expect(screen.getAllByText('VS').length).toBeGreaterThan(0);
  });

  it('uses two-row mid (title + venue) with no caption when both title and matchDetail are set (TOURNAMENT_NAME)', () => {
    render(
      <MatchFixtureBar
        fixture={{
          teams: [{ teamCode: 'home' }, { teamCode: 'away' }],
          vsLabel: 'VS',
          title: 'TAPEYA PREMIER LEAGUE',
          matchDetail: 'LIVE FROM GADDAFI STADIUM',
        }}
        teams={teams}
      />,
    );

    expect(screen.getAllByText('TAPEYA PREMIER LEAGUE').length).toBeGreaterThan(0);
    expect(screen.getAllByText('LIVE FROM GADDAFI STADIUM').length).toBeGreaterThan(0);
    expect(screen.queryByText('VS')).toBeNull();
    expect(screen.queryByText('HOME XI')).toBeNull();
  });

  it('returns null when a team referenced by the fixture is missing from the teams map', () => {
    const { container } = render(
      <MatchFixtureBar
        fixture={{ teams: [{ teamCode: 'home' }, { teamCode: 'away' }], vsLabel: 'VS' }}
        teams={{ home: teams.home }}
      />,
    );

    expect(container.firstChild).toBeNull();
  });
});
