// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TourHitsMiniBar } from '../TourHitsMiniBar';

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

describe('TourHitsMiniBar', () => {
  it('shows tournament logo only when logoUrl is present', () => {
    render(
      <TourHitsMiniBar
        mini={{
          label: 'TOURNAMENT',
          title: 'SIXES',
          count: 42,
          logoUrl: 'https://example.com/psl.png',
          shortCode: 'PSL',
        }}
        edgeToEdge={false}
      />,
    );

    expect(screen.getByRole('img', { name: 'PSL' })).toBeTruthy();
    expect(screen.queryByLabelText('Tournament PSL')).toBeNull();
  });

  it('shows short-code badge when logoUrl is missing', () => {
    render(
      <TourHitsMiniBar
        mini={{
          label: 'TOURNAMENT',
          title: 'RUNS',
          count: 100,
          logoUrl: null,
          shortCode: 'PSL',
        }}
        edgeToEdge={false}
      />,
    );

    expect(screen.queryByRole('img')).toBeNull();
    expect(screen.getByLabelText('Tournament PSL')).toBeTruthy();
    expect(screen.getByText('PSL')).toBeTruthy();
  });
});
