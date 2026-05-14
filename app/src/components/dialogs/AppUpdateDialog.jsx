import { useCallback } from 'react';

import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';

import { Button } from '@/ui/Button';
import {
  DialogDescription,
  DialogHeaderRow,
  dialogPrimaryTitleClass,
  DialogScrollBody,
  DialogTitle,
} from '@/ui/Dialog';

const OPENABLE_STORE_URL_PROTOCOLS = new Set([
  'http:',
  'https:',
  'market:',
  'itms-apps:',
  'itms:',
]);

function isOpenableStoreUrl(value) {
  try {
    const u = new URL(String(value).trim());
    return OPENABLE_STORE_URL_PROTOCOLS.has(u.protocol);
  } catch {
    return false;
  }
}

/**
 * Converts an https Play Store / App Store URL to the native deep-link
 * equivalent so the OS opens the store app directly instead of a browser.
 *
 * Android: https://play.google.com/store/apps/details?id=com.foo.bar
 *       → market://details?id=com.foo.bar
 *
 * iOS:     https://apps.apple.com/pk/app/tapeya/id6762375075
 *       → itms-apps://itunes.apple.com/pk/app/tapeya/id6762375075
 */
function toNativeStoreUrl(url, platform) {
  try {
    const u = new URL(String(url).trim());

    if (platform === 'android' && u.hostname === 'play.google.com') {
      const id = u.searchParams.get('id');
      if (id) return `market://details?id=${id}`;
    }

    if (platform === 'ios' && u.hostname === 'apps.apple.com') {
      return url.replace('https://apps.apple.com', 'itms-apps://itunes.apple.com');
    }
  } catch {
    // fall through to original url
  }
  return url;
}

async function openStoreUrl(url) {
  if (!isOpenableStoreUrl(url)) {
    throw new Error(`Blocked or invalid URL: ${url}`);
  }

  const platform = Capacitor.getPlatform(); // 'android' | 'ios' | 'web'
  const nativeUrl = toNativeStoreUrl(url, platform);

  if (platform === 'android' || platform === 'ios') {
    window.location.href = nativeUrl;
  } else {
    // Web fallback — open the https URL in a browser tab
    await Browser.open({ url });
  }

  return { platform, nativeUrl };
}

export function AppUpdateDialog({ storeUrl = '', storeName = '' }) {
  const handleUpdate = useCallback(async () => {
    if (!storeUrl) return;
    try {
      await openStoreUrl(storeUrl);
    } catch {
      // Invalid or blocked URL — normal flow uses server-configured store links
    }
  }, [storeUrl]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <DialogHeaderRow>
        <DialogTitle className={dialogPrimaryTitleClass}>
          Update Available
        </DialogTitle>
      </DialogHeaderRow>

      <DialogScrollBody className="flex flex-col px-5 pb-1">
        <DialogDescription className="text-center text-[13px] leading-relaxed">
          A new version of Tapeya is available on the {storeName}. Please update
          the app for a better experience.
        </DialogDescription>
      </DialogScrollBody>

      <div className="flex shrink-0 flex-col gap-2 border-t border-white/10 px-4 py-4">
        <Button
          type="button"
          variant="orangeDialog"
          size="dialog"
          onClick={handleUpdate}
        >
          Open in {storeName}
        </Button>
      </div>
    </div>
  );
}

export default AppUpdateDialog;