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
// getByText, is the correct query here (matches the InsetLTBarSurface contract
// used by every LT bar in this theme, not a quirk of this specific component).
describe('MatchFixtureBar', () => {
  it('renders both team names and VS when no title is set (INTRO_LT shape)', () => {
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

  it('renders a single title instead of team names when title is set (TOURNAMENT_NAME shape)', () => {
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
    expect(screen.queryByText('VS')).toBeNull();
    expect(screen.queryByText('HOME XI')).toBeNull();
  });

  it('renders the detail row (toss decision / result / chase text) when matchDetail is set', () => {
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
  });

  it('omits the detail row entirely when matchDetail is empty', () => {
    const { container } = render(
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

    // No detail row means the title row keeps its bottom border (border-b-0
    // only applies when hasDetailRow is false) — confirms hasDetailRow toggles correctly.
    expect(container.querySelector('.border-b-0')).toBeTruthy();
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
