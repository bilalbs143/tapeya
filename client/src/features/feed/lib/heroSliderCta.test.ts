import { describe, expect, it } from 'vitest';

import { PLAY_STORE_NAME } from '@/shared/native/storeLinks';

import type { HomeHeroSlide } from '../model/homeSchemas';
import {
  interestCampaignSlugsFromHeroSlides,
  isHeroSlideInteractive,
  pickStoreDownloadUrl,
  resolveHeroSlideAction,
  toInAppPath,
} from './heroSliderCta';

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

  it('resolves interestCampaign to the interest dialog', () => {
    expect(
      resolveHeroSlideAction(
        slide({
          id: '1',
          image: 'a.jpg',
          ctaType: 'dialog',
          ctaDialogKey: 'interestCampaign',
          ctaDialogParam: 'summer-cup',
        }),
        store
      )
    ).toEqual({ kind: 'dialog', key: 'interestCampaign', props: { slug: 'summer-cup' } });
  });

  it('collects unique interest campaign slugs from hero slides', () => {
    expect(
      interestCampaignSlugsFromHeroSlides([
        slide({
          id: '1',
          image: 'a.jpg',
          ctaType: 'dialog',
          ctaDialogKey: 'interestCampaign',
          ctaDialogParam: 'summer-cup',
        }),
        slide({
          id: '2',
          image: 'b.jpg',
          ctaType: 'dialog',
          ctaDialogKey: 'interestCampaign',
          ctaDialogParam: ' summer-cup ',
        }),
        slide({ id: '3', image: 'c.jpg', ctaType: 'dialog', ctaDialogKey: 'downloadApp' }),
        slide({
          id: '4',
          image: 'd.jpg',
          ctaType: 'dialog',
          ctaDialogKey: 'interestCampaign',
          ctaDialogParam: 'winter-cup',
        }),
      ])
    ).toEqual(['summer-cup', 'winter-cup']);
  });

  it('resolves downloadApp to the download dialog with both store URLs', () => {
    expect(
      resolveHeroSlideAction(slide({ id: '1', image: 'a.jpg', ctaType: 'dialog', ctaDialogKey: 'downloadApp' }), store)
    ).toEqual({
      kind: 'dialog',
      key: 'downloadApp',
      props: {
        appStoreUrl: store.iosStoreUrl,
        playStoreUrl: store.playStoreUrl,
      },
    });
  });

  it('resolves appUpdate to the update dialog for the platform store', () => {
    expect(
      resolveHeroSlideAction(slide({ id: '2', image: 'a.jpg', ctaType: 'dialog', ctaDialogKey: 'appUpdate' }), {
        ...store,
        platform: 'android',
      })
    ).toEqual({
      kind: 'dialog',
      key: 'appUpdate',
      props: { storeUrl: store.playStoreUrl, storeName: PLAY_STORE_NAME },
    });
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
        store
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
        store
      )
    ).toEqual({ kind: 'navigate', path: '/shop' });

    expect(
      resolveHeroSlideAction(
        slide({
          id: '3',
          image: 'a.jpg',
          ctaType: 'url',
          ctaUrl: '/upcoming-tournaments',
          ctaTargetBlank: false,
        }),
        store
      )
    ).toEqual({ kind: 'navigate', path: '/upcoming-tournaments' });
  });

  it('pickStoreDownloadUrl prefers native platform store', () => {
    expect(pickStoreDownloadUrl({ ...store, platform: 'android' })).toBe(store.playStoreUrl);
    expect(pickStoreDownloadUrl({ ...store, platform: 'ios' })).toBe(store.iosStoreUrl);
  });
});
