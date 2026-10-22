import { describe, expect, it } from 'vitest';

import {
  isBroadcastPluginUnavailableError,
  isResumableBroadcastStatus,
  resolveGoLiveCaptureMode,
  shouldConfirmEndOnLeave,
  shouldShowBroadcastControls,
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

describe('shouldShowBroadcastControls', () => {
  it('shows through preview, permission prompt, connect, and live', () => {
    expect(shouldShowBroadcastControls('previewing')).toBe(true);
    expect(shouldShowBroadcastControls('requesting_permissions')).toBe(true);
    expect(shouldShowBroadcastControls('connecting')).toBe(true);
    expect(shouldShowBroadcastControls('live')).toBe(true);
    expect(shouldShowBroadcastControls('reconnecting')).toBe(true);
    expect(shouldShowBroadcastControls('ending')).toBe(false);
    expect(shouldShowBroadcastControls('error')).toBe(false);
  });
});

describe('resolveGoLiveCaptureMode', () => {
  it('maps phase to shutter mode', () => {
    expect(resolveGoLiveCaptureMode('previewing', false, false)).toBe('start');
    expect(resolveGoLiveCaptureMode('requesting_permissions', false, false)).toBe('connecting');
    expect(resolveGoLiveCaptureMode('connecting', false, false)).toBe('connecting');
    expect(resolveGoLiveCaptureMode('previewing', true, false)).toBe('connecting');
    expect(resolveGoLiveCaptureMode('live', false, false)).toBe('end');
    expect(resolveGoLiveCaptureMode('reconnecting', false, false)).toBe('end');
    expect(resolveGoLiveCaptureMode('ending', false, true)).toBe('end');
    expect(resolveGoLiveCaptureMode('error', false, false)).toBe(null);
  });
});
