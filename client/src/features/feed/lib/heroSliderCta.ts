import { dialogStore } from '@/shared/dialogs';
import { APP_STORE_NAME, PLAY_STORE_NAME } from '@/shared/native/storeLinks';

import type { HomeHeroSlide } from '../model/homeSchemas';

export type HeroStoreLinks = {
  /** Native Capacitor platform, or `web`. */
  platform: 'web' | 'ios' | 'android';
  iosStoreUrl: string;
  playStoreUrl: string;
};

export type HeroSlideAction =
  | { kind: 'none' }
  | { kind: 'navigate'; path: string }
  | { kind: 'external'; url: string }
  | { kind: 'dialog'; key: 'interestCampaign'; props: { slug: string } }
  | { kind: 'dialog'; key: 'downloadApp'; props: { appStoreUrl: string; playStoreUrl: string } }
  | { kind: 'dialog'; key: 'appUpdate'; props: { storeUrl: string; storeName: string } };

function isHttpUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

/** Prefer an in-app path for relative URLs and absolute same-site URLs. */
export function toInAppPath(url: string): string | null {
  if (!url) return null;
  if (url.startsWith('/') && !url.startsWith('//')) return url;
  if (!isHttpUrl(url)) return null;
  try {
    const parsed = new URL(url);
    return `${parsed.pathname}${parsed.search}${parsed.hash}` || '/';
  } catch {
    return null;
  }
}

export function isHeroSlideInteractive(slide: HomeHeroSlide): boolean {
  if (slide.ctaType === 'url') return Boolean(slide.ctaUrl);
  if (slide.ctaType === 'dialog') return Boolean(slide.ctaDialogKey);
  return Boolean(slide.ctaUrl && slide.ctaLabel);
}

/** Unique interest campaign slugs referenced by hero dialog CTAs (for prefetch). */
export function interestCampaignSlugsFromHeroSlides(slides: readonly HomeHeroSlide[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const slide of slides) {
    if (slide.ctaType !== 'dialog' || slide.ctaDialogKey?.trim() !== 'interestCampaign') continue;
    const slug = slide.ctaDialogParam?.trim();
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    out.push(slug);
  }
  return out;
}

function detectMobileWebStore(): 'ios' | 'android' | null {
  if (typeof navigator === 'undefined') return null;
  const ua = navigator.userAgent ?? '';
  const isIos =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && typeof navigator.maxTouchPoints === 'number' && navigator.maxTouchPoints > 1);
  if (isIos) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  return null;
}

/** Pick the best App Store / Play Store URL for the current client. */
export function pickStoreDownloadUrl(links: HeroStoreLinks): string | null {
  const ios = links.iosStoreUrl.trim();
  const android = links.playStoreUrl.trim();
  if (links.platform === 'ios') return ios || android || null;
  if (links.platform === 'android') return android || ios || null;
  const web = detectMobileWebStore();
  if (web === 'ios') return ios || android || null;
  if (web === 'android') return android || ios || null;
  return ios || android || null;
}

function storeNameForUrl(url: string): string {
  return /play\.google\.com/i.test(url) ? PLAY_STORE_NAME : APP_STORE_NAME;
}

function resolveDialogAction(slide: HomeHeroSlide, store: HeroStoreLinks): HeroSlideAction {
  switch (slide.ctaDialogKey?.trim()) {
    case 'interestCampaign': {
      const slug = slide.ctaDialogParam?.trim();
      return slug ? { kind: 'dialog', key: 'interestCampaign', props: { slug } } : { kind: 'none' };
    }
    case 'downloadApp': {
      const appStoreUrl = store.iosStoreUrl.trim();
      const playStoreUrl = store.playStoreUrl.trim();
      if (!appStoreUrl && !playStoreUrl) return { kind: 'none' };
      return { kind: 'dialog', key: 'downloadApp', props: { appStoreUrl, playStoreUrl } };
    }
    case 'appUpdate': {
      const storeUrl = pickStoreDownloadUrl(store);
      if (!storeUrl) return { kind: 'none' };
      return {
        kind: 'dialog',
        key: 'appUpdate',
        props: { storeUrl, storeName: storeNameForUrl(storeUrl) },
      };
    }
    default:
      return { kind: 'none' };
  }
}

/** Hero CTA — dialog (interest / download / update), external URL, or in-app path. */
export function resolveHeroSlideAction(slide: HomeHeroSlide, store: HeroStoreLinks): HeroSlideAction {
  if (slide.ctaType === 'dialog') return resolveDialogAction(slide, store);

  const url = slide.ctaUrl?.trim();
  if (!url) return { kind: 'none' };

  // Wire default `cta_target_blank: true` — open http(s) externally like legacy.
  if (slide.ctaTargetBlank && isHttpUrl(url)) {
    return { kind: 'external', url };
  }

  const path = toInAppPath(url);
  return path ? { kind: 'navigate', path } : { kind: 'none' };
}

export function openHeroExternalUrl(url: string): void {
  if (typeof window === 'undefined') return;
  window.open(url, '_blank', 'noopener,noreferrer');
}

/** Run a resolved hero CTA (navigate / external / dialog). */
export function applyHeroSlideAction(action: HeroSlideAction, navigate: (path: string) => void): void {
  if (action.kind === 'navigate') {
    navigate(action.path);
    return;
  }
  if (action.kind === 'external') {
    openHeroExternalUrl(action.url);
    return;
  }
  if (action.kind !== 'dialog') return;

  switch (action.key) {
    case 'interestCampaign':
      dialogStore.open('interestCampaign', action.props);
      break;
    case 'downloadApp':
      dialogStore.open('downloadApp', action.props);
      break;
    case 'appUpdate':
      dialogStore.open('appUpdate', action.props);
      break;
  }
}
