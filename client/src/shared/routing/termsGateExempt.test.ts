import { describe, expect, it } from 'vitest';

import { isTermsGateExemptPath } from './termsGateExempt';

describe('isTermsGateExemptPath', () => {
  it('matches CMS and legal document URLs', () => {
    expect(isTermsGateExemptPath('/pages/terms-of-use')).toBe(true);
    expect(isTermsGateExemptPath('/pages/privacy-policy')).toBe(true);
    expect(isTermsGateExemptPath('/legal/terms')).toBe(true);
    expect(isTermsGateExemptPath('/legal/privacy')).toBe(true);
  });

  it('does not match app surfaces that must stay gated', () => {
    expect(isTermsGateExemptPath('/')).toBe(false);
    expect(isTermsGateExemptPath('/home')).toBe(false);
    expect(isTermsGateExemptPath('/reels')).toBe(false);
    expect(isTermsGateExemptPath('/pages')).toBe(false);
    expect(isTermsGateExemptPath('/legal')).toBe(false);
    expect(isTermsGateExemptPath('/pages/terms-of-use/extra')).toBe(false);
  });
});
