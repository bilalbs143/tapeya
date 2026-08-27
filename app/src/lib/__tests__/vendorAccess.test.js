import { describe, expect, it } from 'vitest';

import { userCanApplyAsSeller, userHasVendorAccess } from '../vendorAccess';

describe('vendorAccess', () => {
  it('treats no store as apply, not hub', () => {
    expect(userHasVendorAccess({})).toBe(false);
    expect(userCanApplyAsSeller({})).toBe(true);
  });

  it('opens the hub for pending, approved, and suspended stores', () => {
    expect(userHasVendorAccess({ vendor: { status: 'pending' } })).toBe(true);
    expect(userHasVendorAccess({ vendor: { status: 'approved' } })).toBe(true);
    expect(userHasVendorAccess({ vendor: { status: 'suspended' } })).toBe(true);
    expect(userCanApplyAsSeller({ vendor: { status: 'pending' } })).toBe(false);
  });

  it('hides the hub after rejection', () => {
    expect(userHasVendorAccess({ vendor: { status: 'rejected' } })).toBe(false);
    expect(userCanApplyAsSeller({ vendor: { status: 'rejected' } })).toBe(false);
  });
});
