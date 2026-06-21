// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { CurrentPartnershipGraphic } from '../CurrentPartnershipGraphic';

vi.mock('../../../primitives', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    FSStage: ({ children }) => <div data-testid="fs-stage">{children}</div>,
  };
});

const partnershipFixture = {
  teams: {
    batting: { fullName: 'Peshawar Zalmi', color: '#5b7cff' },
  },
  data: {
    teamCode: 'batting',
    title: 'PESHAWAR ZALMI',
    sub: 'LAHORE SUMMER CUP',
    partnership: { runs: 11, balls: 5 },
    defaultAvatarUrl: '/assets/player-placeholder.png',
    batters: [
      {
        fullName: 'WAQAR SALAM',
        runs: 5,
        balls: 2,
        align: 'start',
        notOut: true,
        avatarUrl: 'https://cdn.example/waqar.jpg',
      },
      {
        fullName: 'KHUSHDIL SHAH',
        runs: 6,
        balls: 3,
        align: 'end',
        notOut: true,
        avatarUrl: 'https://cdn.example/khushdil.jpg',
      },
    ],
  },
};

describe('CurrentPartnershipGraphic', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders hero layout regions, partnership meta, and both batter avatars', () => {
    render(<CurrentPartnershipGraphic {...partnershipFixture} />);

    expect(screen.getByTestId('partnership-hero-panel')).toBeTruthy();
    expect(screen.getByTestId('partnership-center-stat')).toBeTruthy();
    expect(screen.getByTestId('partnership-batter-strap')).toBeTruthy();
    expect(screen.getByTestId('partnership-avatar-left')).toBeTruthy();
    expect(screen.getByTestId('partnership-avatar-right')).toBeTruthy();

    const center = screen.getByTestId('partnership-center-stat');
    expect(center.textContent).toContain('Current');
    expect(center.textContent).toContain('Partnership');
    expect(center.textContent).toContain('11');
    expect(center.textContent).toContain('Runs');
    expect(center.textContent).toContain('Balls');

    expect(screen.getByRole('img', { name: 'WAQAR SALAM' }).getAttribute('src')).toBe('https://cdn.example/waqar.jpg');
    expect(screen.getByRole('img', { name: 'KHUSHDIL SHAH' }).getAttribute('src')).toBe('https://cdn.example/khushdil.jpg');
  });

  it('returns null when partnership data is incomplete', () => {
    const { container } = render(
      <CurrentPartnershipGraphic
        teams={partnershipFixture.teams}
        data={{ ...partnershipFixture.data, batters: [partnershipFixture.data.batters[0]] }}
      />,
    );

    expect(container.firstChild).toBeNull();
  });
});
