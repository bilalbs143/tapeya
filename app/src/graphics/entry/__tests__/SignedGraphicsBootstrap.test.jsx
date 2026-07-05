import { createElement } from 'react';

import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useGetGraphicSessionQuery } from '@/graphics/entry/hooks/graphicSessionApiBinding';
import SignedGraphicsBootstrap from '@/graphics/entry/SignedGraphicsBootstrap';

vi.mock('@/graphics/entry/hooks/graphicSessionApiBinding', () => ({
  useGetGraphicSessionQuery: vi.fn(),
}));

vi.mock('@/graphics/entry/GraphicsView', () => ({
  default: () => createElement('div', { className: 'graphics-view-stub' }),
}));

const ACCESS_TOKEN = `1-999-${'a'.repeat(64)}`;

describe('SignedGraphicsBootstrap', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders GraphicsBootstrapError when the access token is missing', () => {
    vi.mocked(useGetGraphicSessionQuery).mockReturnValue({
      data: undefined,
      isSuccess: false,
      isError: false,
    });

    const html = renderToStaticMarkup(createElement(SignedGraphicsBootstrap, { accessToken: '', sessionId: null }));

    expect(html).toContain('graphics-bootstrap-error');
    expect(html).toContain('data-reason="missing-access-token"');
  });

  it('renders GraphicsView on a successful session fetch', () => {
    vi.mocked(useGetGraphicSessionQuery).mockReturnValue({
      data: { theme: { slug: 'theme1' } },
      isSuccess: true,
      isError: false,
    });

    const html = renderToStaticMarkup(createElement(SignedGraphicsBootstrap, { accessToken: ACCESS_TOKEN, sessionId: '1' }));

    expect(html).toContain('graphics-view-stub');
  });

  it('renders GraphicsBootstrapError when the token never resolved to session data', () => {
    vi.mocked(useGetGraphicSessionQuery).mockReturnValue({
      data: undefined,
      isSuccess: false,
      isError: true,
      error: { status: 403, data: { message: 'Invalid or expired graphics link.' } },
    });

    const html = renderToStaticMarkup(createElement(SignedGraphicsBootstrap, { accessToken: ACCESS_TOKEN, sessionId: '1' }));

    expect(html).toContain('graphics-bootstrap-error');
    expect(html).toContain('data-reason="bootstrap-failed"');
    expect(html).toContain('data-status="403"');
  });

  it('keeps rendering GraphicsView when a later refetch fails after a prior success (token expiry mid-broadcast)', () => {
    // RTK Query only clears status/error on rejection, never `data` — this simulates
    // that exact state: a session that loaded successfully once, then a subsequent
    // background refetch (e.g. triggered by a context_hash change) got a 403.
    vi.mocked(useGetGraphicSessionQuery).mockReturnValue({
      data: { theme: { slug: 'theme1' } },
      isSuccess: false,
      isError: true,
      error: { status: 403, data: { message: 'Invalid or expired graphics link.' } },
    });

    const html = renderToStaticMarkup(createElement(SignedGraphicsBootstrap, { accessToken: ACCESS_TOKEN, sessionId: '1' }));

    expect(html).toContain('graphics-view-stub');
    expect(html).not.toContain('graphics-bootstrap-error');
  });

  it('renders nothing while the initial fetch is still pending', () => {
    vi.mocked(useGetGraphicSessionQuery).mockReturnValue({
      data: undefined,
      isSuccess: false,
      isError: false,
      isLoading: true,
    });

    const html = renderToStaticMarkup(createElement(SignedGraphicsBootstrap, { accessToken: ACCESS_TOKEN, sessionId: '1' }));

    expect(html).toBe('');
  });
});
