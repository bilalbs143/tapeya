import { afterEach, describe, expect, it } from 'vitest';

import { clearOtpPreview, getOtpPreview, getOtpPreviewSession, setOtpPreview } from './otpPreviewSession';

afterEach(() => {
  clearOtpPreview();
});

describe('otpPreviewSession', () => {
  it('stores and returns OTP for the same phone', () => {
    setOtpPreview('+923001234567', '1234');
    expect(getOtpPreview('+923001234567')).toBe('1234');
    expect(getOtpPreview('923001234567')).toBe('1234');
    expect(getOtpPreviewSession()).toEqual({ phone: '+923001234567', otp: '1234' });
  });

  it('ignores OTP for a different phone', () => {
    setOtpPreview('+923001234567', '1234');
    expect(getOtpPreview('+923009999999')).toBeNull();
  });

  it('clears the preview', () => {
    setOtpPreview('+923001234567', '1234');
    clearOtpPreview();
    expect(getOtpPreview('+923001234567')).toBeNull();
    expect(getOtpPreviewSession()).toBeNull();
  });
});
