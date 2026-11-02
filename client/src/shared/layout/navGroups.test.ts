import { describe, expect, it } from 'vitest';

import { APP_PATHS } from '@/shared/config/paths';

import { buildNavGroups, isActivePath } from './navGroups';

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

describe('isActivePath', () => {
  const playTargets = [APP_PATHS.tournaments, APP_PATHS.tournamentCreate, APP_PATHS.matches, APP_PATHS.quickMatch];

  it('lights only Create Tournament on /tournaments/create', () => {
    expect(isActivePath('/tournaments/create', APP_PATHS.tournaments, playTargets)).toBe(false);
    expect(isActivePath('/tournaments/create', APP_PATHS.tournamentCreate, playTargets)).toBe(true);
  });

  it('lights My Tournaments on the list and nested detail routes', () => {
    expect(isActivePath('/tournaments', APP_PATHS.tournaments, playTargets)).toBe(true);
    expect(isActivePath('/tournaments/42', APP_PATHS.tournaments, playTargets)).toBe(true);
    expect(isActivePath('/tournaments/42', APP_PATHS.tournamentCreate, playTargets)).toBe(false);
  });

  it('prefers Seller Apply over Seller Hub', () => {
    const shopTargets = [APP_PATHS.seller, APP_PATHS.sellerApply, APP_PATHS.shopOrders];
    expect(isActivePath('/seller/apply', APP_PATHS.seller, shopTargets)).toBe(false);
    expect(isActivePath('/seller/apply', APP_PATHS.sellerApply, shopTargets)).toBe(true);
    expect(isActivePath('/seller/products', APP_PATHS.seller, shopTargets)).toBe(true);
  });
});
