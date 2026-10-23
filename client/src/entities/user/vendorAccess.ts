import type { UserSummary } from './types';

const VENDOR_STATUS_REJECTED = 'rejected';

type UserWithVendor = Pick<UserSummary, 'vendor'>;

/** True when /me includes a store that is not rejected. */
export function userHasVendorAccess(user: UserWithVendor | null | undefined): boolean {
  const status = user?.vendor?.status;
  return status != null && status !== VENDOR_STATUS_REJECTED;
}

/** True when the user has no shop_vendors row yet. */
export function userCanApplyAsSeller(user: UserWithVendor | null | undefined): boolean {
  return user?.vendor == null;
}
