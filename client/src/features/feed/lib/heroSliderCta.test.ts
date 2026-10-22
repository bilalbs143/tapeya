import { describe, expect, it } from 'vitest';

import type { HomeHeroSlide } from '../model/homeSchemas';
import { isHeroSlideInteractive, pickStoreDownloadUrl, resolveHeroSlideAction, toInAppPath } from './heroSliderCta';

function slide(partial: Partial<HomeHeroSlide> & Pick<HomeHeroSlide, 'id' | 'image'>): HomeHeroSlide {
  return {
    alt: 'Promo',
    ctaType: 'none',
    ctaLabel: null,
    ctaUrl: null,
    ctaTargetBlank: true,
    ctaDialogKey: null,
    ctaDialogParam: null,
    ...partial,
  };
}

const store = {
  platform: 'web' as const,
  iosStoreUrl: 'https://apps.apple.com/app/tapeya',
  playStoreUrl: 'https://play.google.com/store/apps/details?id=com.tapeya',
};

describe('heroSliderCta', () => {
  it('toInAppPath keeps relative paths and strips origin from absolute URLs', () => {
    expect(toInAppPath('/upcoming-tournaments')).toBe('/upcoming-tournaments');
    expect(toInAppPath('https://tapeya.com/live?x=1#y')).toBe('/live?x=1#y');
    expect(toInAppPath('notaurl')).toBeNull();
  });

  it('marks url and dialog slides interactive', () => {
    expect(isHeroSlideInteractive(slide({ id: '1', image: 'a.jpg', ctaType: 'url', ctaUrl: '/x' }))).toBe(true);
    expect(
      isHeroSlideInteractive(slide({ id: '2', image: 'a.jpg', ctaType: 'dialog', ctaDialogKey: 'downloadApp' }))
    ).toBe(true);
    expect(isHeroSlideInteractive(slide({ id: '3', image: 'a.jpg' }))).toBe(false);
  });

  it('resolves interestCampaign to navigate', () => {
    const action = resolveHeroSlideAction(
      slide({
        id: '1',
        image: 'a.jpg',
        ctaType: 'dialog',
        ctaDialogKey: 'interestCampaign',
        ctaDialogParam: 'summer-cup',
      }),
      store,
      (slug) => `/interest/${slug}`
    );
    expect(action).toEqual({ kind: 'navigate', path: '/interest/summer-cup' });
  });

  it('resolves downloadApp / appUpdate to store URL', () => {
    expect(
      resolveHeroSlideAction(
        slide({ id: '1', image: 'a.jpg', ctaType: 'dialog', ctaDialogKey: 'downloadApp' }),
        store,
        (s) => s
      )
    ).toEqual({ kind: 'external', url: store.iosStoreUrl });

    expect(
      resolveHeroSlideAction(
        slide({ id: '2', image: 'a.jpg', ctaType: 'dialog', ctaDialogKey: 'appUpdate' }),
        { ...store, platform: 'android' },
        (s) => s
      )
    ).toEqual({ kind: 'external', url: store.playStoreUrl });
  });

  it('opens http urls externally when target blank, else navigates', () => {
    expect(
      resolveHeroSlideAction(
        slide({
          id: '1',
          image: 'a.jpg',
          ctaType: 'url',
          ctaUrl: 'https://example.com/promo',
          ctaTargetBlank: true,
        }),
        store,
        (s) => s
      )
    ).toEqual({ kind: 'external', url: 'https://example.com/promo' });

    expect(
      resolveHeroSlideAction(
        slide({
          id: '2',
          image: 'a.jpg',
          ctaType: 'url',
          ctaUrl: 'https://tapeya.com/shop',
          ctaTargetBlank: false,
        }),
        store,
        (s) => s
      )
    ).toEqual({ kind: 'navigate', path: '/shop' });
  });

  it('pickStoreDownloadUrl prefers native platform store', () => {
    expect(pickStoreDownloadUrl({ ...store, platform: 'android' })).toBe(store.playStoreUrl);
    expect(pickStoreDownloadUrl({ ...store, platform: 'ios' })).toBe(store.iosStoreUrl);
  });
});
