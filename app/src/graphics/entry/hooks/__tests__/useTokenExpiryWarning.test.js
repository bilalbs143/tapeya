// @vitest-environment jsdom

import { createElement } from 'react';

import { cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useTokenExpiryWarning } from '@/graphics/entry/hooks/useTokenExpiryWarning';

function Probe({ accessToken }) {
  useTokenExpiryWarning(accessToken);
  return null;
}

describe('useTokenExpiryWarning', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('does nothing for an unparseable token', () => {
    render(createElement(Probe, { accessToken: 'not-a-real-token' }));
    vi.runAllTimers();
    expect(console.error).not.toHaveBeenCalled();
  });

  it('warns immediately when the token is already within the 15-minute window', () => {
    const expiresUnix = Math.floor(Date.now() / 1000) + 5 * 60;
    const token = `1-${expiresUnix}-${'a'.repeat(64)}`;

    render(createElement(Probe, { accessToken: token }));

    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error.mock.calls[0][0]).toMatch(/expires within 15 minutes/);
  });

  it('schedules a warning ~15 minutes before a token further in the future expires', () => {
    const expiresUnix = Math.floor(Date.now() / 1000) + 60 * 60; // 1 hour out
    const token = `1-${expiresUnix}-${'a'.repeat(64)}`;

    render(createElement(Probe, { accessToken: token }));

    expect(console.error).not.toHaveBeenCalled();

    // Advance to just before the 45-minute mark (1h - 15min lead) — still silent.
    vi.advanceTimersByTime(44 * 60 * 1000);
    expect(console.error).not.toHaveBeenCalled();

    // Cross the 45-minute mark — warning fires.
    vi.advanceTimersByTime(2 * 60 * 1000);
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error.mock.calls[0][0]).toMatch(/expires in ~15 minutes/);
  });

  it('clears the pending timer on unmount', () => {
    const expiresUnix = Math.floor(Date.now() / 1000) + 60 * 60;
    const token = `1-${expiresUnix}-${'a'.repeat(64)}`;

    const { unmount } = render(createElement(Probe, { accessToken: token }));
    unmount();

    vi.runAllTimers();
    expect(console.error).not.toHaveBeenCalled();
  });
});
