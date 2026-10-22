import { describe, expect, it } from 'vitest';

import {
  canSubmitGoLive,
  createGoLiveSchema,
  GO_LIVE_TERMS,
  isGoLiveThumbFile,
  validateGoLiveForm,
} from './goLiveForm';

describe('GO_LIVE_TERMS', () => {
  it('lists four broadcast rules', () => {
    expect(GO_LIVE_TERMS).toHaveLength(4);
  });
});

describe('isGoLiveThumbFile', () => {
  it('rejects oversize files', () => {
    const ok = new File(['x'], 'a.jpg', { type: 'image/jpeg' });
    Object.defineProperty(ok, 'size', { value: 1024 });
    expect(isGoLiveThumbFile(ok)).toBe(true);

    const big = new File(['x'], 'b.jpg', { type: 'image/jpeg' });
    Object.defineProperty(big, 'size', { value: 6 * 1024 * 1024 });
    expect(isGoLiveThumbFile(big)).toBe(false);
  });
});

describe('canSubmitGoLive', () => {
  it('requires title, orientation, and idle enums', () => {
    expect(canSubmitGoLive('  Semi 1  ', false, 'portrait', true)).toBe(true);
    expect(canSubmitGoLive('   ', false, 'portrait', true)).toBe(false);
    expect(canSubmitGoLive('Semi 1', true, 'portrait', true)).toBe(false);
    expect(canSubmitGoLive('Semi 1', false, '', true)).toBe(false);
    expect(canSubmitGoLive('Semi 1', false, 'portrait', false)).toBe(false);
  });
});

describe('validateGoLiveForm', () => {
  it('accepts a valid payload', () => {
    const result = validateGoLiveForm(
      { title: '  Finals  ', description: '  Day 1  ', orientation: 'portrait' },
      ['portrait', 'landscape'],
      false
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.values.title).toBe('Finals');
      expect(result.values.description).toBe('Day 1');
      expect(result.values.orientation).toBe('portrait');
    }
  });

  it('rejects missing orientation and overlong title', () => {
    expect(validateGoLiveForm({ title: 'x', description: '', orientation: '' }, ['portrait'], false).ok).toBe(false);
    expect(
      validateGoLiveForm({ title: 'x'.repeat(101), description: '', orientation: 'portrait' }, ['portrait'], false).ok
    ).toBe(false);
  });
});

describe('createGoLiveSchema', () => {
  it('requires orientation from enums when provided', () => {
    const schema = createGoLiveSchema(['portrait', 'landscape']);
    expect(schema.safeParse({ title: 'A', description: '', orientation: 'portrait' }).success).toBe(true);
    expect(schema.safeParse({ title: 'A', description: '', orientation: 'square' }).success).toBe(false);
  });
});
