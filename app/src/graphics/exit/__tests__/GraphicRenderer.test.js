import { createElement } from 'react';

import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { GraphicRenderer } from '@/graphics/exit/GraphicRenderer';

const mockGetThemeCommandComponent = vi.fn();
const mockGetThemeMeta = vi.fn();
const mockResolveDisplayModeShell = vi.fn();

vi.mock('@/graphics/exit/themeRegistry.js', () => ({
  getThemeCommandComponent: (...args) => mockGetThemeCommandComponent(...args),
  getThemeMeta: (...args) => mockGetThemeMeta(...args),
  resolveDisplayModeShell: (...args) => mockResolveDisplayModeShell(...args),
}));

function MockGraphic(props) {
  return createElement('div', { className: 'mock-graphic' }, props.battingTeam?.score ?? 'graphic');
}

function MockThemeRoot({ children }) {
  return createElement('div', { className: 'mock-theme-root' }, children);
}

function MockShell({ children }) {
  return createElement('div', { className: 'mock-shell' }, children);
}

const basePlan = {
  commandKey: 'LT_DEFAULT',
  commandType: 'LOWER_THIRD',
  commandId: 1,
  contextHash: 'abc123',
  displayMode: 'LT',
  themeSlug: 'theme1',
  tokens: { homeBgColor: '#0055ff' },
  componentProps: {
    battingTeam: { score: '120-3', overs: '15.2' },
  },
};

describe('GraphicRenderer', () => {
  it('renders theme root, shell, and command component for a valid plan', () => {
    mockGetThemeCommandComponent.mockReturnValue(MockGraphic);
    mockGetThemeMeta.mockReturnValue({ ThemeRoot: MockThemeRoot });
    mockResolveDisplayModeShell.mockReturnValue(MockShell);

    const html = renderToStaticMarkup(createElement(GraphicRenderer, { plan: basePlan }));

    expect(html).toContain('graphic-overlay-container');
    expect(html).toContain('mock-theme-root');
    expect(html).toContain('mock-shell');
    expect(html).toContain('mock-graphic');
    expect(html).toContain('120-3');
  });

  it('returns null when theme command component is missing', () => {
    mockGetThemeCommandComponent.mockReturnValue(null);
    mockGetThemeMeta.mockReturnValue({ ThemeRoot: MockThemeRoot });
    mockResolveDisplayModeShell.mockReturnValue(MockShell);

    const html = renderToStaticMarkup(createElement(GraphicRenderer, { plan: basePlan }));

    expect(html).toBe('');
  });

  it('returns null when theme meta is missing ThemeRoot', () => {
    mockGetThemeCommandComponent.mockReturnValue(MockGraphic);
    mockGetThemeMeta.mockReturnValue(null);
    mockResolveDisplayModeShell.mockReturnValue(MockShell);

    const html = renderToStaticMarkup(createElement(GraphicRenderer, { plan: basePlan }));

    expect(html).toBe('');
  });
});
