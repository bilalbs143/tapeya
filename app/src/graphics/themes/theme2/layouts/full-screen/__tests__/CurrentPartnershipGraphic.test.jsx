// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { assets } from '../../../config';
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
    batting: { fullName: 'Peshawar Zalmi', color: '#c40038' },
  },
  data: {
    teamCode: 'batting',
    title: 'PESHAWAR ZALMI',
    sub: 'LAHORE SUMMER CUP',
    partnership: { runs: 11, balls: 5 },
    defaultAvatarUrl: assets.playerPlaceholder,
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
    expect(center.textContent).toContain('CURRENT PARTNERSHIP');
    expect(center.textContent).toContain('11');
    expect(center.textContent).toContain('RUNS');
    expect(center.textContent).toContain('BALLS');

    expect(screen.getByRole('img', { name: 'WAQAR SALAM' }).getAttribute('src')).toBe('https://cdn.example/waqar.jpg');
    expect(screen.getByRole('img', { name: 'KHUSHDIL SHAH' }).getAttribute('src')).toBe('https://cdn.example/khushdil.jpg');

    expect(document.querySelectorAll('[data-avatar-plate="theme2"]').length).toBe(2);
  });

  it('shows Top Bowler plate + lining when a batter has no photo', () => {
    render(
      <CurrentPartnershipGraphic
        teams={partnershipFixture.teams}
        data={{
          ...partnershipFixture.data,
          batters: [{ ...partnershipFixture.data.batters[0], avatarUrl: null }, partnershipFixture.data.batters[1]],
        }}
      />,
    );

    const left = screen.getByTestId('partnership-avatar-left');
    expect(left.querySelector('[data-avatar-plate="theme2"]')).not.toBeNull();
    expect(left.querySelector('[data-avatar-lining="theme2"]')).not.toBeNull();
    expect(left.querySelector('img')?.getAttribute('src')).toBe(assets.playerPlaceholder);
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
