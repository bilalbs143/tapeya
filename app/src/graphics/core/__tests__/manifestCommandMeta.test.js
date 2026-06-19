import { describe, expect, it } from 'vitest';

import { createTestSnapshot } from '@/graphics/core/processors/__tests__/fixtures';

import { applyFlashToSnapshot, resolveManifestCommandMeta } from '../manifestCommandMeta';

describe('resolveManifestCommandMeta', () => {
  it('returns manifest type and display mode for LT data commands', () => {
    expect(resolveManifestCommandMeta('LT_DEFAULT')).toEqual({
      commandType: 'LOWER_THIRD',
      displayMode: 'LT',
      category: 'data',
    });
  });

  it('returns FULL_SCREEN_TRANSITION for FST animation commands', () => {
    expect(resolveManifestCommandMeta('FST_FOUR')).toEqual({
      commandType: 'FULL_SCREEN_TRANSITION',
      displayMode: null,
      category: 'animation',
    });
  });

  it('returns null meta for unknown keys', () => {
    expect(resolveManifestCommandMeta('NOT_A_COMMAND')).toEqual({
      commandType: null,
      displayMode: null,
      category: null,
    });
  });
});

describe('applyFlashToSnapshot', () => {
  it('preserves snapshot when flash is absent', () => {
    const snapshot = createTestSnapshot();
    expect(applyFlashToSnapshot(snapshot, null)).toBe(snapshot);
  });

  it('overrides LT flash command metadata from manifest', () => {
    const snapshot = createTestSnapshot();
    const active = applyFlashToSnapshot(snapshot, {
      commandKey: 'LT_FOUR',
      context: null,
      contextHash: 'flash-hash',
    });

    expect(active?.commandKey).toBe('LT_FOUR');
    expect(active?.commandType).toBe('LOWER_THIRD');
    expect(active?.displayMode).toBeNull();
    expect(active?.contextHash).toBe('flash-hash');
    expect(active?.commandId).toBe(snapshot.commandId);
  });

  it('overrides FS transition flash command metadata from manifest', () => {
    const snapshot = createTestSnapshot();
    const active = applyFlashToSnapshot(snapshot, {
      commandKey: 'FST_SIX',
      context: null,
      contextHash: null,
    });

    expect(active?.commandKey).toBe('FST_SIX');
    expect(active?.commandType).toBe('FULL_SCREEN_TRANSITION');
    expect(active?.displayMode).toBeNull();
    expect(active?.contextHash).toBe(snapshot.contextHash);
  });
});
