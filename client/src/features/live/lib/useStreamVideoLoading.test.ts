import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useStreamVideoLoading } from './useStreamVideoLoading';

describe('useStreamVideoLoading', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts loading when src is set and clears on markReady', () => {
    const { result } = renderHook(() => useStreamVideoLoading('https://example.com/embed'));
    expect(result.current[0]).toBe(true);

    act(() => {
      result.current[1]();
    });
    expect(result.current[0]).toBe(false);
  });

  it('ignores markReady when waitForPlaying until PLAYING message', () => {
    const { result } = renderHook(() =>
      useStreamVideoLoading('https://example.com/embed/youtube', { waitForPlaying: true })
    );
    expect(result.current[0]).toBe(true);

    act(() => {
      result.current[1]();
    });
    expect(result.current[0]).toBe(true);

    act(() => {
      window.dispatchEvent(new MessageEvent('message', { data: { type: 'tapeya-youtube-playing' } }));
    });
    expect(result.current[0]).toBe(false);
  });

  it('calls onError after timeout when waitForPlaying', () => {
    vi.useFakeTimers();
    const onError = vi.fn();
    const { result } = renderHook(() =>
      useStreamVideoLoading('https://example.com/embed/youtube', { waitForPlaying: true, onError })
    );
    expect(result.current[0]).toBe(true);

    act(() => {
      vi.advanceTimersByTime(45_000);
    });
    expect(result.current[0]).toBe(false);
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('soft-clears without onError on timeout when not waitForPlaying', () => {
    vi.useFakeTimers();
    const onError = vi.fn();
    const { result } = renderHook(() => useStreamVideoLoading('https://cdn.example/v.m3u8', { onError }));

    act(() => {
      vi.advanceTimersByTime(45_000);
    });
    expect(result.current[0]).toBe(false);
    expect(onError).not.toHaveBeenCalled();
  });
});
