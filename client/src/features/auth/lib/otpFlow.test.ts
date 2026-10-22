import { afterEach, describe, expect, it } from 'vitest';

import { otpAutoFillDigits, resolveLatestOtp, resolveOtpPhone } from './otpFlow';
import { clearOtpPreview, setOtpPreview } from './otpPreviewSession';

afterEach(() => {
  clearOtpPreview();
});

describe('resolveOtpPhone', () => {
  it('prefers router state phone', () => {
    setOtpPreview('+923009999999', '1234');
    expect(resolveOtpPhone({ phone: '+923001234567' })).toBe('+923001234567');
  });

  it('falls back to session preview phone', () => {
    setOtpPreview('+923001234567', '4821');
    expect(resolveOtpPhone(null)).toBe('+923001234567');
  });
});

describe('resolveLatestOtp', () => {
  it('prefers debugOtp from router state', () => {
    setOtpPreview('+923001234567', '0000');
    expect(resolveLatestOtp('+923001234567', { debugOtp: '4821' })).toBe('4821');
  });

  it('uses phone-scoped preview when no debugOtp', () => {
    setOtpPreview('+923001234567', '4821');
    expect(resolveLatestOtp('+923001234567', { phone: '+923001234567' })).toBe('4821');
  });
});

describe('otpAutoFillDigits', () => {
  it('returns digits only for non-test phones when ready', () => {
    expect(
      otpAutoFillDigits('48-21', {
        testPhonesReady: true,
        isTestPhone: false,
        hasPhone: true,
      })
    ).toBe('4821');
  });

  it('stays empty for test phones or before settings load', () => {
    expect(
      otpAutoFillDigits('4821', {
        testPhonesReady: true,
        isTestPhone: true,
        hasPhone: true,
      })
    ).toBe('');
    expect(
      otpAutoFillDigits('4821', {
        testPhonesReady: false,
        isTestPhone: false,
        hasPhone: true,
      })
    ).toBe('');
  });
});
