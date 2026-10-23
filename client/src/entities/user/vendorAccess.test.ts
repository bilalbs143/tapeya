import { describe, expect, it } from 'vitest';

import { userCanApplyAsSeller, userHasVendorAccess } from './vendorAccess';

describe('vendorAccess', () => {
  it('treats no store as apply, not hub', () => {
    expect(userHasVendorAccess({})).toBe(false);
    expect(userCanApplyAsSeller({})).toBe(true);
    expect(userHasVendorAccess(null)).toBe(false);
    expect(userCanApplyAsSeller(undefined)).toBe(true);
  });

  it('opens the hub for pending, approved, and suspended stores', () => {
    expect(userHasVendorAccess({ vendor: { id: 1, storeName: 'A', status: 'pending' } })).toBe(true);
    expect(userHasVendorAccess({ vendor: { id: 1, storeName: 'A', status: 'approved' } })).toBe(true);
    expect(userHasVendorAccess({ vendor: { id: 1, storeName: 'A', status: 'suspended' } })).toBe(true);
    expect(userCanApplyAsSeller({ vendor: { id: 1, storeName: 'A', status: 'pending' } })).toBe(false);
  });

  it('hides the hub after rejection', () => {
    expect(userHasVendorAccess({ vendor: { id: 1, storeName: 'A', status: 'rejected' } })).toBe(false);
    expect(userCanApplyAsSeller({ vendor: { id: 1, storeName: 'A', status: 'rejected' } })).toBe(false);
  });
});
