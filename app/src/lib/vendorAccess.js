const VENDOR_STATUS_REJECTED = 'rejected';

/** True when /me includes a store that is not rejected. */
export function userHasVendorAccess(user) {
  const status = user?.vendor?.status;
  return status != null && status !== VENDOR_STATUS_REJECTED;
}

/** True when the user has no shop_vendors row yet. */
export function userCanApplyAsSeller(user) {
  return user?.vendor == null;
}
