import { describe, expect, it } from 'vitest';

import { sellerOrderCommissionPct, sellerOrderShowsTracking, sellerOrderWhatsAppDigits } from './sellerOrderDetail';

describe('sellerOrderDetail', () => {
  it('normalizes commission rate to a whole percent', () => {
    expect(sellerOrderCommissionPct(0.15)).toBe(15);
    expect(sellerOrderCommissionPct(12)).toBe(12);
    expect(sellerOrderCommissionPct(0)).toBeNull();
  });

  it('strips phone to WhatsApp digits', () => {
    expect(sellerOrderWhatsAppDigits('+92 300-1234567')).toBe('923001234567');
    expect(sellerOrderWhatsAppDigits(null)).toBeNull();
  });

  it('shows tracking once dispatched or when already set', () => {
    expect(sellerOrderShowsTracking('pending')).toBe(false);
    expect(sellerOrderShowsTracking('dispatched')).toBe(true);
    expect(sellerOrderShowsTracking('pending', 'TCS123')).toBe(true);
  });
});
