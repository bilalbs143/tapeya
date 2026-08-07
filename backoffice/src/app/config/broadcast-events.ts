/**
 * Echo event names on `private-backoffice.notifications` (leading dot).
 * Keep in sync with `api/app/Support/Broadcast/BroadcastEventNames.php`.
 */
export const ADMIN_BACKOFFICE_BROADCAST_EVENTS = [
  '.admin.order.placed',
  '.admin.tournament_request.submitted',
  '.admin.user.registered',
  '.admin.vendor_application.submitted',
  '.admin.broadcast_concurrency.high',
  '.admin.youtube_quota.high',
] as const;
