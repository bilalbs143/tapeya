import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/platform/platform', () => ({
  getPlatform: () => 'web',
  isNativePlatform: () => false,
}));

import { openAdCta } from './openAdCta';

describe('openAdCta', () => {
  const navigate = vi.fn();
  const open = vi.fn(() => ({ focus: vi.fn() }));

  afterEach(() => {
    navigate.mockReset();
    open.mockReset();
    open.mockImplementation(() => ({ focus: vi.fn() }));
  });

  it('opens WhatsApp via wa.me', () => {
    vi.stubGlobal('window', { open, location: { assign: vi.fn() } });
    openAdCta({ label: 'Message Us', url: '+92 300-1234567', type: 'whatsapp' }, navigate);
    expect(open).toHaveBeenCalledWith('https://wa.me/923001234567', '_blank', 'noopener,noreferrer');
    expect(navigate).not.toHaveBeenCalled();
  });

  it('opens https URLs externally', () => {
    vi.stubGlobal('window', { open, location: { assign: vi.fn() } });
    openAdCta({ label: 'Learn More', url: 'https://example.com/x', type: 'url' }, navigate);
    expect(open).toHaveBeenCalledWith('https://example.com/x', '_blank', 'noopener,noreferrer');
  });

  it('navigates deep links', () => {
    openAdCta({ label: 'Shop', url: '/shop', type: 'deep_link' }, navigate);
    expect(navigate).toHaveBeenCalledWith('/shop');
  });
});
