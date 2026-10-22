import { describe, expect, it } from 'vitest';

import { endSave, tryBeginSave } from './scoringSaveGate';

describe('scoringSaveGate', () => {
  it('allows one begin at a time', () => {
    const savingRef = { current: false };
    expect(tryBeginSave(savingRef)).toBe(true);
    expect(savingRef.current).toBe(true);
    expect(tryBeginSave(savingRef)).toBe(false);
    endSave(savingRef);
    expect(tryBeginSave(savingRef)).toBe(true);
  });
});
