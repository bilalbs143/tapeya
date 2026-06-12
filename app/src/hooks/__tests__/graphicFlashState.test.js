import { describe, expect, it } from 'vitest';

import {
  activeFlashItem,
  graphicFlashEventToAction,
  graphicFlashReducer,
  initialGraphicFlashState,
} from '../graphicFlashState.js';

function flashItem(key) {
  return { commandKey: key, context: null, contextHash: null };
}

describe('graphicFlashReducer', () => {
  it('returns null active item for initial state', () => {
    expect(activeFlashItem(initialGraphicFlashState)).toBeNull();
  });

  it('shows first command on FLASH', () => {
    const state = graphicFlashReducer(initialGraphicFlashState, {
      type: 'FLASH',
      ballId: 42,
      items: [flashItem('LT_SIX')],
    });

    expect(activeFlashItem(state)).toEqual(flashItem('LT_SIX'));
  });

  it('advances through a two-item queue on TICK', () => {
    let state = graphicFlashReducer(initialGraphicFlashState, {
      type: 'FLASH',
      ballId: 42,
      items: [flashItem('LT_NO_BALL'), flashItem('LT_SIX')],
    });

    expect(activeFlashItem(state)?.commandKey).toBe('LT_NO_BALL');

    state = graphicFlashReducer(state, { type: 'TICK' });
    expect(activeFlashItem(state)?.commandKey).toBe('LT_SIX');

    state = graphicFlashReducer(state, { type: 'TICK' });
    expect(activeFlashItem(state)).toBeNull();
    expect(state.ballId).toBeNull();
  });

  it('cancels when ball_id matches', () => {
    let state = graphicFlashReducer(initialGraphicFlashState, {
      type: 'FLASH',
      ballId: 42,
      items: [flashItem('LT_OUT')],
    });

    state = graphicFlashReducer(state, { type: 'CANCEL', ballId: 42 });

    expect(state).toEqual(initialGraphicFlashState);
  });

  it('ignores cancel when ball_id does not match', () => {
    const afterFlash = graphicFlashReducer(initialGraphicFlashState, {
      type: 'FLASH',
      ballId: 42,
      items: [flashItem('LT_OUT')],
    });

    const afterCancel = graphicFlashReducer(afterFlash, { type: 'CANCEL', ballId: 99 });

    expect(afterCancel).toEqual(afterFlash);
  });

  it('replaces in-flight queue on new FLASH', () => {
    let state = graphicFlashReducer(initialGraphicFlashState, {
      type: 'FLASH',
      ballId: 1,
      items: [flashItem('LT_FOUR'), flashItem('LT_SIX')],
    });

    state = graphicFlashReducer(state, {
      type: 'FLASH',
      ballId: 2,
      items: [flashItem('LT_WIDE')],
    });

    expect(activeFlashItem(state)?.commandKey).toBe('LT_WIDE');
    expect(state.ballId).toBe(2);
    expect(state.queue).toHaveLength(1);
  });
});

describe('graphicFlashEventToAction', () => {
  it('maps flash event to FLASH action', () => {
    const action = graphicFlashEventToAction({
      ball_id: 42,
      commands: ['LT_SIX'],
      context: { score: '10-0' },
      context_hash: 'abc',
    });

    expect(action).toEqual({
      type: 'FLASH',
      ballId: 42,
      items: [{ commandKey: 'LT_SIX', context: { score: '10-0' }, contextHash: 'abc' }],
    });
  });

  it('maps empty commands to CANCEL action', () => {
    expect(graphicFlashEventToAction({ ball_id: 42, commands: [] })).toEqual({
      type: 'CANCEL',
      ballId: 42,
    });
  });
});
