import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { isoDateHead, isoTimeLocal, toApiDateTime } from './sellerProductDateTime';

describe('sellerProductDateTime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-15T12:00:00+05:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('reads YYYY-MM-DD from an ISO head when present', () => {
    expect(isoDateHead('2026-03-01T10:30:00Z')).toBe('2026-03-01');
    expect(isoDateHead(null)).toBe('');
  });

  it('formats local HH:mm', () => {
    expect(isoTimeLocal('2026-06-15T08:05:00+05:00')).toBe('08:05');
    expect(isoTimeLocal('')).toBe('');
  });

  it('builds API datetime from date + time', () => {
    expect(toApiDateTime('2026-06-15', '08:05')).toMatch(/^2026-06-1[45]T/);
    expect(toApiDateTime('bad', '08:05')).toBeUndefined();
    expect(toApiDateTime('2026-06-15', 'xx')).toBeUndefined();
  });
});
