import type { HomeHeroSlide } from '../model/homeSchemas';

export type HeroSlideAction = { kind: 'none' } | { kind: 'navigate'; path: string } | { kind: 'external'; url: string };

export type HeroStoreLinks = {
  /** Native Capacitor platform, or `web`. */
  platform: 'web' | 'ios' | 'android';
  iosStoreUrl: string;
  playStoreUrl: string;
};

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

/** Hero CTA — interest dialog, store links, external URL, or in-app path. */
export function resolveHeroSlideAction(
  slide: HomeHeroSlide,
  store: HeroStoreLinks,
  interestPathForSlug: (slug: string) => string
): HeroSlideAction {
  if (slide.ctaType === 'dialog' && slide.ctaDialogKey) {
    if (slide.ctaDialogKey === 'interestCampaign' && slide.ctaDialogParam) {
      return { kind: 'navigate', path: interestPathForSlug(slide.ctaDialogParam) };
    }
    if (slide.ctaDialogKey === 'downloadApp' || slide.ctaDialogKey === 'appUpdate') {
      const url = pickStoreDownloadUrl(store);
      return url ? { kind: 'external', url } : { kind: 'none' };
    }
    return { kind: 'none' };
  }

  const url = slide.ctaUrl?.trim();
  if (!url) return { kind: 'none' };

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
