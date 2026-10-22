import { describe, expect, it } from 'vitest';

import {
  isBroadcastPluginUnavailableError,
  isResumableBroadcastStatus,
  shouldConfirmEndOnLeave,
} from './broadcastCameraUtils';

describe('isResumableBroadcastStatus', () => {
  it('allows idle/starting/live only', () => {
    expect(isResumableBroadcastStatus('idle')).toBe(true);
    expect(isResumableBroadcastStatus('starting')).toBe(true);
    expect(isResumableBroadcastStatus('live')).toBe(true);
    expect(isResumableBroadcastStatus('ended')).toBe(false);
    expect(isResumableBroadcastStatus('error')).toBe(false);
  });
});

describe('shouldConfirmEndOnLeave', () => {
  it('confirms while connecting, live, reconnecting, or publish latch', () => {
    expect(shouldConfirmEndOnLeave('previewing', false)).toBe(false);
    expect(shouldConfirmEndOnLeave('connecting', false)).toBe(true);
    expect(shouldConfirmEndOnLeave('live', false)).toBe(true);
    expect(shouldConfirmEndOnLeave('reconnecting', false)).toBe(true);
    expect(shouldConfirmEndOnLeave('previewing', true)).toBe(true);
  });
});

describe('isBroadcastPluginUnavailableError', () => {
  it('detects Capacitor unimplemented plugin errors', () => {
    expect(isBroadcastPluginUnavailableError(new Error('"TapeyaBroadcast" plugin is not implemented on ios'))).toBe(
      true
    );
    expect(isBroadcastPluginUnavailableError(new Error('network failed'))).toBe(false);
  });
});
