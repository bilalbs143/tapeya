/**
 * Get status variant for StatusPill component
 * @param {string} status - The status string
 * @returns {string} - The variant name for StatusPill
 */
export const getStatusVariant = (status) => {
  const statusLower = status?.toLowerCase() || 'pending';

  // Success/Completed states
  if (
    ['resolved', 'completed', 'finished', 'confirmed', 'approved'].includes(
      statusLower,
    )
  ) {
    return 'resolved';
  }

  // Pending/Processing states
  if (
    [
      'pending',
      'waiting',
      'processing',
      'confirming',
      'sending',
      'verified',
    ].includes(statusLower)
  ) {
    return 'pending';
  }

  // Error/Rejected states
  if (
    ['rejected', 'cancelled', 'failed', 'expired', 'error'].includes(
      statusLower,
    )
  ) {
    return 'rejected';
  }

  // Gaming states
  if (['win', 'won', 'winner'].includes(statusLower)) {
    return 'win';
  }
  if (['loss', 'lost', 'lose'].includes(statusLower)) {
    return 'lose';
  }
  if (['draw', 'tie', 'tied'].includes(statusLower)) {
    return 'draw';
  }

  // Refund states
  if (['refunded', 'refund', 'returned'].includes(statusLower)) {
    return 'refunded';
  }

  // Communication states
  if (['read', 'viewed', 'opened'].includes(statusLower)) {
    return 'read';
  }
  if (['unread', 'new', 'not_viewed'].includes(statusLower)) {
    return 'unread';
  }

  // Partial states
  if (['partially_paid', 'partial'].includes(statusLower)) {
    return 'pending';
  }

  return 'gray';
};

/**
 * Get status color mapping for custom implementations
 * @param {string} status - The status string
 * @returns {object} - Object with bgColor and textColor
 */
export const getStatusColors = (status) => {
  const variant = getStatusVariant(status);

  const colorMap = {
    resolved: { bgColor: '#10B981', textColor: '#FFFFFF' },
    pending: { bgColor: '#F59E0B', textColor: '#FFFFFF' },
    rejected: { bgColor: '#EF4444', textColor: '#FFFFFF' },
    gray: { bgColor: '#6B7280', textColor: '#FFFFFF' },
    win: { bgColor: '#059669', textColor: '#FFFFFF' },
    lose: { bgColor: '#DC2626', textColor: '#FFFFFF' },
    draw: { bgColor: '#4B5563', textColor: '#FFFFFF' },
    refunded: { bgColor: '#7C3AED', textColor: '#FFFFFF' },
    read: { bgColor: '#059669', textColor: '#FFFFFF' },
    unread: { bgColor: '#F97316', textColor: '#FFFFFF' },
    approved: { bgColor: '#10B981', textColor: '#FFFFFF' },
  };

  return colorMap[variant] || colorMap.gray;
};

/**
 * Get human-readable status text with translation support
 * @param {string} status - The status string
 * @param {function} t - Translation function (optional)
 * @returns {string} - Formatted status text
 */
export const getStatusText = (status, t = null) => {
  const statusLower = status?.toLowerCase() || 'pending';

  // If translation function is provided, use it
  if (t && typeof t === 'function') {
    return t(statusLower) || status;
  }

  // Fallback to hardcoded English text
  const statusMap = {
    // Success states
    resolved: 'Resolved',
    completed: 'Completed',
    finished: 'Finished',
    confirmed: 'Confirmed',
    approved: 'Approved',

    // Pending states
    pending: 'Pending',
    waiting: 'Waiting',
    processing: 'Processing',
    confirming: 'Confirming',
    sending: 'Sending',
    verified: 'Verified',
    partially_paid: 'Partially Paid',
    partial: 'Partial',

    // Error states
    rejected: 'Rejected',
    cancelled: 'Cancelled',
    failed: 'Failed',
    expired: 'Expired',
    error: 'Error',

    // Gaming states
    win: 'Win',
    won: 'Won',
    winner: 'Winner',
    loss: 'Loss',
    lost: 'Lost',
    lose: 'Lose',
    draw: 'Draw',
    tie: 'Draw',
    tied: 'Draw',

    // Refund states
    refunded: 'Refunded',
    refund: 'Refunded',
    returned: 'Returned',

    // Communication states
    read: 'Read',
    viewed: 'Read',
    opened: 'Read',
    unread: 'Unread',
    new: 'Unread',
    not_viewed: 'Unread',
  };

  return statusMap[statusLower] || status;
};
