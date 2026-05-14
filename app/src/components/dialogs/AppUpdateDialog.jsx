import { useCallback, useState } from 'react';

import { App } from '@capacitor/app';
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

  await App.openUrl({ url: nativeUrl });
  return { platform, nativeUrl };
}

export function AppUpdateDialog({ storeUrl = '', storeName = '' }) {
  const [debugLines, setDebugLines] = useState([]);

  const log = useCallback((msg) => {
    const time = new Date().toLocaleTimeString();
    setDebugLines((prev) => [`[${time}] ${msg}`, ...prev].slice(0, 20));
  }, []);

  const handleUpdate = useCallback(async () => {
    log(`storeUrl = "${storeUrl}"`);
    log(`platform = ${Capacitor.getPlatform()}`);

    if (!storeUrl) {
      log('ERROR: storeUrl is empty, aborting');
      return;
    }

    try {
      const { platform, nativeUrl } = await openStoreUrl(storeUrl);
      log(`OK: opened on ${platform} → ${nativeUrl}`);
    } catch (err) {
      log(`ERROR: ${err?.message ?? String(err)}`);
    }
  }, [storeUrl, log]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <DialogHeaderRow>
        <DialogTitle className={dialogPrimaryTitleClass}>
          Update Available
        </DialogTitle>
      </DialogHeaderRow>

      <DialogScrollBody className="flex flex-col gap-2 px-5 pb-2">
        <DialogDescription className="text-center text-[13px] leading-relaxed">
          A new version of Tapeya is available on the {storeName}. Please update
          the app for a better experience.
        </DialogDescription>

        {/* ── Debug panel – remove once store-open is confirmed working ── */}
        <div className="mt-3 rounded-[6px] border border-white/10 bg-[#0d0d0d] p-3">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-[#A2A6AB]">
            Debug
          </p>
          <div className="space-y-0.5 text-[10px] leading-snug text-[#A2A6AB]/80">
            <p>
              <span className="text-white/40">platform:</span>{' '}
              {Capacitor.getPlatform()}
            </p>
            <p>
              <span className="text-white/40">storeUrl:</span>{' '}
              {storeUrl || <span className="text-red-400">empty</span>}
            </p>
          </div>

          {debugLines.length > 0 && (
            <div className="mt-2 space-y-0.5 border-t border-white/10 pt-2">
              {debugLines.map((line, i) => (
                <p
                  key={i}
                  className={`break-all font-mono text-[10px] leading-snug ${
                    line.includes('ERROR') ? 'text-red-400' : 'text-emerald-400'
                  }`}
                >
                  {line}
                </p>
              ))}
            </div>
          )}
        </div>
        {/* ── End debug panel ── */}
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