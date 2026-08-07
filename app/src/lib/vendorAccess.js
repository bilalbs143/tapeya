const VENDOR_STATUS_REJECTED = 'rejected';

export function userHasVendorAccess(user) {
  const status = user?.capabilities?.vendor_status;
  return status != null && status !== VENDOR_STATUS_REJECTED;
}
