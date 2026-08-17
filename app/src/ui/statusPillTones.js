/** Tone for Quick Match / tournament match lifecycle statuses. */
export function matchStatusTone(status) {
  switch (status) {
    case 'in_progress':
    case 'toss_done':
      return 'brand';
    case 'completed':
      return 'success';
    case 'cancelled':
      return 'danger';
    default:
      return 'muted';
  }
}

/** Tone for tournament request review statuses. */
export function tournamentRequestStatusTone(status) {
  switch (status) {
    case 'approved':
      return 'success';
    case 'rejected':
      return 'danger';
    case 'pending':
    default:
      return 'brand';
  }
}

/** Tone for shop / seller order fulfillment statuses. */
export function orderStatusTone(status) {
  switch ((status ?? '').toLowerCase()) {
    case 'pending':
      return 'brand';
    case 'processing':
      return 'white';
    case 'dispatched':
    case 'shipped':
    case 'delivered':
      return 'success';
    case 'cancelled':
      return 'danger';
    default:
      return 'muted';
  }
}
