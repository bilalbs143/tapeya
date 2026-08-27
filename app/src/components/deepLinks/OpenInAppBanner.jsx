/**
 * Soft “Open in Tapeya” bar for deep links opened in mobile Safari/Chrome
 * when Universal / App Links are not yet claimed (or user stayed in browser).
 *
 * Pass any registered in-app `path` (e.g. `/reels/12`, `/live/go-live/31`).
 */

import { useEffect, useState } from 'react';

import { useWebStoreLinks } from '@/hooks/useWebStoreLinks';
import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';
import { isAllowedDeepLinkPath } from '@/lib/deepLinks/deepLinkRegistry';
import { buildAppSchemeDeepLink } from '@/lib/deepLinks/deepLinkUtils';
import { detectMobileWebStorePlatform } from '@/lib/nativeStore/storeLinks/web';
import { isNative } from '@/platform/platform';
import { Button } from '@/ui/Button';

const logo = `${CLOUDFRONT_APP_BASE}/images/logos/tapya-t.svg`;

export function OpenInAppBanner({ path }) {
  const [dismissed, setDismissed] = useState(false);
  const platform = detectMobileWebStorePlatform();
  const storeLinks = useWebStoreLinks();
  const allowed = isAllowedDeepLinkPath(path);

  useEffect(() => {
    setDismissed(false);
  }, [path]);

  if (isNative() || dismissed || !allowed || !platform) {
    return null;
  }

  const storeUrl = platform === 'ios' ? storeLinks.appStoreUrl : storeLinks.playStoreUrl;
  const schemeUrl = buildAppSchemeDeepLink(path);

  const handleOpen = () => {
    const started = Date.now();
    window.location.href = schemeUrl;
    window.setTimeout(() => {
      if (Date.now() - started < 1600 && storeUrl) {
        window.location.href = storeUrl;
      }
    }, 1200);
  };

  return (
    <div className="pointer-events-auto absolute inset-x-0 bottom-[max(5.5rem,calc(env(safe-area-inset-bottom)+4.5rem))] z-40 px-3 lg:hidden">
      <div className="bg-surface/95 flex items-center gap-3 rounded-2xl border border-white/10 px-3 py-2.5 shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-sm">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#003C71]">
          <img src={logo} alt="" className="h-5 w-auto" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold text-white">Open in Tapeya</p>
          <p className="text-muted truncate text-[11px]">Better experience in the app</p>
        </div>
        <Button type="button" variant="orange" onClick={handleOpen} className="shrink-0 rounded-full px-3.5 py-1.5 text-[12px]">
          Open
        </Button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="text-muted flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-lg leading-none"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  );
}
