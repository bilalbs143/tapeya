import { describe, expect, it } from 'vitest';

import { filterLiveStreams, LIVE_HUB_POLL_MS } from './liveHub';

describe('LIVE_HUB_POLL_MS', () => {
  it('polls every 60 seconds', () => {
    expect(LIVE_HUB_POLL_MS).toBe(60_000);
  });
});

describe('filterLiveStreams', () => {
  it('keeps only live rows', () => {
    expect(
      filterLiveStreams([
        { id: 1, status: 'live' },
        { id: 2, status: 'ended' },
        { id: 3, status: 'live' },
      ]).map((s) => s.id)
    ).toEqual([1, 3]);
    expect(filterLiveStreams(undefined)).toEqual([]);
  });
});
