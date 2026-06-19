import { describe, expect, it } from 'vitest';

import {
  patchSessionContextHash,
  patchSessionFromReverbEvent,
  resolveSessionQueryArg,
} from '@/graphics/entry/hooks/graphicSessionSync';

describe('resolveSessionQueryArg', () => {
  it('returns null when matchId is missing', () => {
    expect(resolveSessionQueryArg(undefined, new URLSearchParams())).toBeNull();
  });

  it('returns matchId string for authenticated overlay URL', () => {
    expect(resolveSessionQueryArg('42', new URLSearchParams())).toBe('42');
  });

  it('returns signed overlay arg when expires and signature are present', () => {
    const params = new URLSearchParams({ expires: '999', signature: 'abc' });
    expect(resolveSessionQueryArg('42', params)).toEqual({
      matchId: '42',
      expires: '999',
      signature: 'abc',
    });
  });
});

describe('patchSessionFromReverbEvent', () => {
  it('patches active_command from Reverb payload', () => {
    const draft = {
      context_hash: 'old-hash',
      active_command: { command_key: 'LT_DEFAULT', id: 1 },
    };

    const { shouldRefetchContext } = patchSessionFromReverbEvent(draft, {
      command_key: 'RUN_RATE',
      command_type: 'LOWER_THIRD',
      display_mode: 'LT',
      payload: null,
      command_id: 9,
    });

    expect(draft.active_command).toEqual({
      command_key: 'RUN_RATE',
      command_type: 'LOWER_THIRD',
      display_mode: 'LT',
      payload: null,
      id: 9,
    });
    expect(shouldRefetchContext).toBe(false);
  });

  it('flags refetch when context_hash changes', () => {
    const draft = { context_hash: 'hash-a', active_command: {} };

    const result = patchSessionFromReverbEvent(draft, {
      command_key: 'LT_DEFAULT',
      command_type: 'LOWER_THIRD',
      command_id: 1,
      context_hash: 'hash-b',
    });

    expect(draft.context_hash).toBe('hash-b');
    expect(result.shouldRefetchContext).toBe(true);
  });

  it('does not flag refetch when context_hash is unchanged', () => {
    const draft = { context_hash: 'hash-a', active_command: {} };

    const result = patchSessionFromReverbEvent(draft, {
      command_key: 'LT_DEFAULT',
      command_type: 'LOWER_THIRD',
      command_id: 1,
      context_hash: 'hash-a',
    });

    expect(result.shouldRefetchContext).toBe(false);
  });

  it('flags refetch when graphic_theme_id changes', () => {
    const draft = { graphic_theme_id: 1, active_command: {} };

    const result = patchSessionFromReverbEvent(draft, {
      command_key: 'LT_DEFAULT',
      command_type: 'LOWER_THIRD',
      command_id: 1,
      graphic_theme_id: 2,
    });

    expect(draft.graphic_theme_id).toBe(2);
    expect(result.shouldRefetchContext).toBe(true);
  });

  it('flags refetch when graphic_theme_id is set from null', () => {
    const draft = { active_command: {} };

    const result = patchSessionFromReverbEvent(draft, {
      command_key: 'LT_DEFAULT',
      command_type: 'LOWER_THIRD',
      command_id: 1,
      graphic_theme_id: 3,
    });

    expect(draft.graphic_theme_id).toBe(3);
    expect(result.shouldRefetchContext).toBe(true);
  });

  it('patches optional config when present on event', () => {
    const draft = { active_command: {}, config: { home_text_color: '#111' } };

    patchSessionFromReverbEvent(draft, {
      command_key: 'LT_DEFAULT',
      command_type: 'LOWER_THIRD',
      command_id: 1,
      config: { home_text_color: '#fff' },
    });

    expect(draft.config).toEqual({ home_text_color: '#fff' });
  });
});

describe('patchSessionContextHash', () => {
  it('updates hash and returns true when hash changes', () => {
    const draft = { context_hash: 'old' };
    expect(patchSessionContextHash(draft, 'new')).toBe(true);
    expect(draft.context_hash).toBe('new');
  });

  it('returns false when hash is unchanged or null', () => {
    const draft = { context_hash: 'same' };
    expect(patchSessionContextHash(draft, 'same')).toBe(false);
    expect(patchSessionContextHash(draft, null)).toBe(false);
  });
});
