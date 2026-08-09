import { describe, expect, it } from 'vitest';

import { getHistoryIdx, resolveAppBackAction, resolveNativeHardwareBackAction } from '../appBack';

describe('getHistoryIdx', () => {
  it('reads React Router idx and defaults to 0', () => {
    expect(getHistoryIdx({ idx: 3 })).toBe(3);
    expect(getHistoryIdx({})).toBe(0);
    expect(getHistoryIdx(null)).toBe(0);
  });
});

describe('resolveAppBackAction', () => {
  it('pops when there is in-app history, otherwise goes home', () => {
    expect(resolveAppBackAction({ historyIdx: 2 })).toEqual({ type: 'pop' });
    expect(resolveAppBackAction({ historyIdx: 0 })).toEqual({ type: 'replace', to: '/home' });
  });
});

describe('resolveNativeHardwareBackAction', () => {
  it('closes DialogManager first', () => {
    expect(resolveNativeHardwareBackAction({ pathname: '/reels/12', hasDialog: true })).toEqual({
      type: 'close-dialog',
    });
  });

  it('exits on splash / auth instead of looping the splash timer', () => {
    expect(resolveNativeHardwareBackAction({ pathname: '/', historyIdx: 0 })).toEqual({ type: 'exit' });
    expect(resolveNativeHardwareBackAction({ pathname: '/login', historyIdx: 0 })).toEqual({ type: 'exit' });
  });

  it('pops auth history (register → otp) instead of exiting', () => {
    expect(resolveNativeHardwareBackAction({ pathname: '/otp', historyIdx: 1 })).toEqual({ type: 'pop' });
  });

  it('pops when history exists', () => {
    expect(resolveNativeHardwareBackAction({ pathname: '/reels/12', historyIdx: 1 })).toEqual({ type: 'pop' });
  });

  it('goes home from a cold-started deep link, then exits on home', () => {
    expect(resolveNativeHardwareBackAction({ pathname: '/reels/12', historyIdx: 0 })).toEqual({
      type: 'replace',
      to: '/home',
    });
    expect(resolveNativeHardwareBackAction({ pathname: '/home', historyIdx: 0 })).toEqual({ type: 'exit' });
  });
});
