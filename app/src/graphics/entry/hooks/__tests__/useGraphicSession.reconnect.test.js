// @vitest-environment jsdom

import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useGraphicSession } from '@/graphics/entry/hooks/useGraphicSession';

vi.useFakeTimers();

vi.mock('react-redux', () => ({
  useDispatch: () => vi.fn(),
}));

vi.mock('@/graphics/entry/hooks/graphicSessionApiBinding', () => ({
  graphicSessionApi: {
    util: {
      updateQueryData: vi.fn(() => ({ type: 'noop' })),
    },
  },
  useGetGraphicSessionQuery: () => ({
    data: { theme: { slug: 'theme1' }, match_id: 7 },
    isError: false,
    isLoading: false,
    refetch: mockRefetch,
  }),
}));

let mockEcho;
let mockRefetch;
let connectionChangeCallback;

vi.mock('@/graphics/entry/GraphicEchoProvider', () => ({
  useGraphicEcho: () => mockEcho,
}));

describe('useGraphicSession — reconnect resync', () => {
  beforeEach(() => {
    mockRefetch = vi.fn();
    connectionChangeCallback = null;

    mockEcho = {
      channel: vi.fn(() => ({ listen: vi.fn(), stopListening: vi.fn() })),
      leave: vi.fn(),
      connector: {
        onConnectionChange: vi.fn((cb) => {
          connectionChangeCallback = cb;
          return vi.fn();
        }),
      },
    };

    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllTimers();
  });

  it('does not refetch on the initial connect', () => {
    renderHook(() => useGraphicSession(`1-999-${'a'.repeat(64)}`));

    expect(connectionChangeCallback).toBeTypeOf('function');
    connectionChangeCallback('connecting');
    connectionChangeCallback('connected');

    expect(mockRefetch).not.toHaveBeenCalled();
  });

  it('refetches once when the connection drops and then reconnects', () => {
    renderHook(() => useGraphicSession(`1-999-${'a'.repeat(64)}`));

    connectionChangeCallback('connected');
    connectionChangeCallback('disconnected');
    connectionChangeCallback('reconnecting');
    connectionChangeCallback('connected');

    act(() => vi.advanceTimersByTime(3000));

    expect(mockRefetch).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith(expect.stringMatching(/WebSocket reconnected after a drop/));
  });

  it('does not refetch again on a second connected event without an intervening drop', () => {
    renderHook(() => useGraphicSession(`1-999-${'a'.repeat(64)}`));

    connectionChangeCallback('connected');
    connectionChangeCallback('disconnected');
    connectionChangeCallback('connected');
    connectionChangeCallback('connected');

    act(() => vi.advanceTimersByTime(3000));

    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('unsubscribes from connection-change events on unmount', () => {
    const unsubscribe = vi.fn();
    mockEcho.connector.onConnectionChange = vi.fn((cb) => {
      connectionChangeCallback = cb;
      return unsubscribe;
    });

    const { unmount } = renderHook(() => useGraphicSession(`1-999-${'a'.repeat(64)}`));
    unmount();

    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });
});
