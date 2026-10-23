import { describe, expect, it } from 'vitest';

import { APP_PATHS } from '@/shared/config/paths';

import { buildNavGroups } from './navGroups';

function shopLabels(opts?: Parameters<typeof buildNavGroups>[0]): string[] {
  const shop = buildNavGroups(opts).find((g) => g.label === 'Shop');
  return shop?.items.map((i) => i.label) ?? [];
}

describe('buildNavGroups seller rows', () => {
  it('shows Become a Seller when the user can apply', () => {
    expect(shopLabels({ canApplyAsSeller: true })).toEqual(['My Orders', 'Become a Seller']);
    expect(shopLabels()).toEqual(['My Orders', 'Become a Seller']);
  });

  it('shows Seller Hub when the user has vendor access', () => {
    const labels = shopLabels({ hasStore: true, canApplyAsSeller: false });
    expect(labels).toEqual(['My Orders', 'Seller Hub']);
    expect(
      buildNavGroups({ hasStore: true })
        .find((g) => g.label === 'Shop')
        ?.items.at(-1)?.to
    ).toBe(APP_PATHS.seller);
  });

  it('hides both seller rows after rejection', () => {
    expect(shopLabels({ hasStore: false, canApplyAsSeller: false })).toEqual(['My Orders']);
  });
});
