import { describe, expect, it } from 'vitest';

import {
  activeFlashItem,
  graphicFlashEventToAction,
  graphicFlashReducer,
  initialGraphicFlashState,
} from '@/graphics/entry/hooks/graphicFlashState';

function flashItem(key) {
  return { commandKey: key, context: null, contextHash: null };
}

describe('graphicFlashReducer', () => {
  it('returns null active item for initial state', () => {
    expect(activeFlashItem(initialGraphicFlashState)).toBeNull();
  });

  it('replaces queue on FLASH', () => {
    const next = graphicFlashReducer(initialGraphicFlashState, {
      type: 'FLASH',
      ballId: 42,
      items: [flashItem('LT_FOUR'), flashItem('LT_SIX')],
    });

    expect(next.ballId).toBe(42);
    expect(next.queue).toHaveLength(2);
    expect(activeFlashItem(next)?.commandKey).toBe('LT_FOUR');
  });

  it('shifts queue on TICK', () => {
    const state = {
      ballId: 42,
      queue: [flashItem('LT_FOUR'), flashItem('LT_SIX')],
    };

    const next = graphicFlashReducer(state, { type: 'TICK' });

    expect(next.queue).toHaveLength(1);
    expect(activeFlashItem(next)?.commandKey).toBe('LT_SIX');
    expect(next.ballId).toBe(42);
  });

  it('clears ballId when queue empties on TICK', () => {
    const state = {
      ballId: 42,
      queue: [flashItem('LT_FOUR')],
    };

    const next = graphicFlashReducer(state, { type: 'TICK' });

    expect(next.queue).toHaveLength(0);
    expect(next.ballId).toBeNull();
    expect(activeFlashItem(next)).toBeNull();
  });

  it('CANCEL clears state when ballId matches', () => {
    const state = {
      ballId: 99,
      queue: [flashItem('LT_OUT')],
    };

    const next = graphicFlashReducer(state, { type: 'CANCEL', ballId: 99 });

    expect(next).toEqual(initialGraphicFlashState);
  });

  it('CANCEL is no-op when ballId does not match', () => {
    const state = {
      ballId: 99,
      queue: [flashItem('LT_OUT')],
    };

    const next = graphicFlashReducer(state, { type: 'CANCEL', ballId: 100 });

    expect(next).toBe(state);
  });
});

describe('graphicFlashEventToAction', () => {
  it('maps commands array to FLASH action', () => {
    const action = graphicFlashEventToAction({
      ball_id: 7,
      commands: ['LT_FOUR', 'LT_SIX'],
      context: { foo: 1 },
      context_hash: 'abc',
    });

    expect(action).toEqual({
      type: 'FLASH',
      ballId: 7,
      items: [
        { commandKey: 'LT_FOUR', context: { foo: 1 }, contextHash: 'abc' },
        { commandKey: 'LT_SIX', context: { foo: 1 }, contextHash: 'abc' },
      ],
    });
  });

  it('maps empty commands to CANCEL', () => {
    expect(graphicFlashEventToAction({ ball_id: 3, commands: [] })).toEqual({
      type: 'CANCEL',
      ballId: 3,
    });
  });
});
