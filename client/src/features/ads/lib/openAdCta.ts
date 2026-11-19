import { normalizeAppPath, pathFromDeepLinkUrl } from '@/shared/lib/deepLinks';
import { isNativePlatform } from '@/shared/platform/platform';

import type { AdCta } from '../model/schemas';

function openExternal(url: string): void {
  if (typeof window === 'undefined') return;
  // Capacitor WebViews often ignore window.open; assign is more reliable for wa.me / https.
  if (isNativePlatform()) {
    window.location.assign(url);
    return;
  }
  const opened = window.open(url, '_blank', 'noopener,noreferrer');
  if (!opened && typeof window.location?.assign === 'function') {
    window.location.assign(url);
  }
}

function whatsappDigits(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const fromLink = trimmed.match(/(?:wa\.me\/|phone=)(\d{8,15})/i);
  if (fromLink?.[1]) return fromLink[1];

  const digits = trimmed.replace(/\D+/g, '');
  if (digits.length >= 8 && digits.length <= 15) return digits;
  return null;
}

/** Open sponsored CTA — WhatsApp, in-app deep link, or external URL. */
export function openAdCta(cta: AdCta, navigate: (path: string) => void): void {
  const raw = cta.url.trim();
  if (!raw) return;

  if (cta.type === 'whatsapp') {
    const digits = whatsappDigits(raw);
    if (!digits) return;
    openExternal(`https://wa.me/${digits}`);
    return;
  }

  if (cta.type === 'deep_link') {
    if (raw.startsWith('/')) {
      navigate(normalizeAppPath(raw));
      return;
    }
    const path = pathFromDeepLinkUrl(raw);
    if (path) {
      navigate(path);
      return;
    }
  }

  if (/^https?:\/\//i.test(raw)) {
    openExternal(raw);
    return;
  }

  if (raw.startsWith('/')) {
    navigate(normalizeAppPath(raw));
  }
}
