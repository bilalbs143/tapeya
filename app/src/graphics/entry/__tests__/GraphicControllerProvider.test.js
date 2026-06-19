import { createElement, useContext } from 'react';

import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GraphicControllerContext } from '@/graphics/entry/graphicControllerContext';
import { GraphicControllerProvider } from '@/graphics/entry/GraphicControllerProvider';
import { useGraphicFlash } from '@/graphics/entry/hooks/useGraphicFlash';
import { useGraphicSession } from '@/graphics/entry/hooks/useGraphicSession';

vi.mock('@/graphics/entry/hooks/useGraphicSession.js', () => ({
  useGraphicSession: vi.fn(),
}));

vi.mock('@/graphics/entry/hooks/useGraphicFlash.js', () => ({
  useGraphicFlash: vi.fn(),
}));

/** @param {import('@/graphics/entry/graphicControllerContext.js').GraphicControllerContextValue} value */
function ContextProbe() {
  const value = useContext(GraphicControllerContext);
  const planKey = value?.renderPlan?.commandKey ?? 'none';
  const snapshotKey = value?.snapshot?.commandKey ?? 'none';
  const loading = value?.isLoading ? '1' : '0';
  const error = value?.isError ? '1' : '0';
  return createElement('span', null, `${planKey}|${snapshotKey}|${loading}|${error}`);
}

const baseSession = {
  theme: { slug: 'theme1' },
  active_command: {
    id: 1,
    command_key: 'LT_DEFAULT',
    command_type: 'LOWER_THIRD',
    display_mode: 'LT',
  },
  context: {
    match: {
      home_team_id: 1,
      away_team_id: 2,
      home_team_name: 'Home XI',
      away_team_name: 'Away XI',
      home_team_short_code: 'HOM',
      away_team_short_code: 'AWY',
    },
    batting_team: 'home',
    score: '50-1',
    overs: '5.0',
  },
  config: {},
};

describe('GraphicControllerProvider', () => {
  beforeEach(() => {
    vi.mocked(useGraphicSession).mockReturnValue({
      session: null,
      isError: false,
      isLoading: false,
      sessionQueryArg: undefined,
    });
    vi.mocked(useGraphicFlash).mockReturnValue(null);
  });

  it('exposes null renderPlan when session is absent', () => {
    const html = renderToStaticMarkup(
      createElement(
        GraphicControllerProvider,
        {
          matchId: '1',
          searchParams: new URLSearchParams(),
        },
        createElement(ContextProbe),
      ),
    );

    expect(html).toContain('none|none|0|0');
  });

  it('builds renderPlan from normalized session command', () => {
    vi.mocked(useGraphicSession).mockReturnValue({
      session: baseSession,
      isError: false,
      isLoading: false,
      sessionQueryArg: '1',
    });

    const html = renderToStaticMarkup(
      createElement(
        GraphicControllerProvider,
        {
          matchId: '1',
          searchParams: new URLSearchParams(),
        },
        createElement(ContextProbe),
      ),
    );

    expect(html).toContain('LT_DEFAULT|LT_DEFAULT|0|0');
  });

  it('returns null renderPlan when active command key is missing', () => {
    vi.mocked(useGraphicSession).mockReturnValue({
      session: {
        ...baseSession,
        active_command: { ...baseSession.active_command, command_key: null },
      },
      isError: false,
      isLoading: false,
      sessionQueryArg: '1',
    });

    const html = renderToStaticMarkup(
      createElement(
        GraphicControllerProvider,
        {
          matchId: '1',
          searchParams: new URLSearchParams(),
        },
        createElement(ContextProbe),
      ),
    );

    expect(html).toContain('none|none|0|0');
  });

  it('overrides renderPlan commandKey when flash is active but keeps snapshot command', () => {
    vi.mocked(useGraphicSession).mockReturnValue({
      session: baseSession,
      isError: false,
      isLoading: false,
      sessionQueryArg: '1',
    });
    vi.mocked(useGraphicFlash).mockReturnValue({
      commandKey: 'LT_FOUR',
      context: null,
      contextHash: 'flash-hash',
    });

    const html = renderToStaticMarkup(
      createElement(
        GraphicControllerProvider,
        {
          matchId: '1',
          searchParams: new URLSearchParams(),
        },
        createElement(ContextProbe),
      ),
    );

    expect(html).toContain('LT_FOUR|LT_DEFAULT|0|0');
  });

  it('overrides renderPlan for FS transition flashes using manifest command type', () => {
    vi.mocked(useGraphicSession).mockReturnValue({
      session: baseSession,
      isError: false,
      isLoading: false,
      sessionQueryArg: '1',
    });
    vi.mocked(useGraphicFlash).mockReturnValue({
      commandKey: 'FST_FOUR',
      context: null,
      contextHash: 'fst-flash-hash',
    });

    const html = renderToStaticMarkup(
      createElement(
        GraphicControllerProvider,
        {
          matchId: '1',
          searchParams: new URLSearchParams(),
        },
        createElement(ContextProbe),
      ),
    );

    expect(html).toContain('FST_FOUR|LT_DEFAULT|0|0');
  });
});
