import { useEffect, useMemo, useRef } from 'react';

import { Capacitor } from '@capacitor/core';

import { isLiveStreamDebugEnabled, liveStreamDebugLog } from '@/features/stream/debug/liveStreamDebug';
import { resolveYoutubeEmbed } from '@/lib/utils/liveStreamUtils';

import { IosNativeStreamOverlay } from './IosNativeStreamOverlay';

const PROXY_DEBUG_MESSAGE_TYPE = 'tapeya-youtube-proxy-debug';

/**
 * Best-effort probe of the proxy HTML (may fail cross-origin from capacitor://).
 *
 * @param {string} src
 */
async function probeProxyPage(src) {
  if (!src || !isLiveStreamDebugEnabled()) {
    return;
  }

  try {
    const response = await fetch(src, {
      method: 'GET',
      mode: 'cors',
      credentials: 'omit',
      cache: 'no-store',
    });

    const embedVersion = response.headers.get('x-tapeya-embed-version');
    const contentType = response.headers.get('content-type');
    let bodySnippet = '';
    let hasYtPlayer = false;
    let hasProxyBoot = false;
    let hasMuteAutoplay = false;

    try {
      const text = await response.text();
      bodySnippet = text.slice(0, 280);
      hasYtPlayer = text.includes('YT.Player');
      hasProxyBoot = text.includes("proxyLog('boot'");
      hasMuteAutoplay = text.includes('mute: 1');
    } catch (readError) {
      liveStreamDebugLog('proxy-fetch-body-error', { message: String(readError) });
    }

    liveStreamDebugLog('proxy-fetch', {
      src,
      status: response.status,
      ok: response.ok,
      embedVersion,
      contentType,
      hasYtPlayer,
      hasProxyBoot,
      hasMuteAutoplay,
      bodySnippet,
    });
  } catch (error) {
    liveStreamDebugLog('proxy-fetch-error', {
      src,
      message: error instanceof Error ? error.message : String(error),
      hint: 'CORS from capacitor:// is expected to fail; rely on postMessage logs from proxy iframe.',
    });
  }
}

export function IframeStreamPlayer({ playback, className = '', fill = false }) {
  const boxClass = fill ? 'relative h-full w-full bg-black' : 'relative w-full aspect-video bg-black';
  const resolution = useMemo(
    () => resolveYoutubeEmbed(playback?.embed_url, playback?.embed_id),
    [playback?.embed_url, playback?.embed_id],
  );
  const src = resolution.iframeSrc;
  const loggedSrcRef = useRef(null);
  const probedSrcRef = useRef(null);

  useEffect(() => {
    if (!isLiveStreamDebugEnabled()) {
      return undefined;
    }

    function onProxyMessage(event) {
      const data = event.data;
      if (!data || data.type !== PROXY_DEBUG_MESSAGE_TYPE) {
        return;
      }

      liveStreamDebugLog(`proxy-${data.tag}`, {
        ...(data.payload ?? {}),
        proxyHref: data.href ?? null,
        proxyVersion: data.proxyVersion ?? null,
        messageOrigin: event.origin ?? null,
      });
    }

    window.addEventListener('message', onProxyMessage);
    return () => window.removeEventListener('message', onProxyMessage);
  }, []);

  useEffect(() => {
    if (loggedSrcRef.current === src && src) {
      return;
    }
    loggedSrcRef.current = src;
    if (!src) {
      liveStreamDebugLog('iframe-no-src', {
        playback,
        directEmbedUrl: resolution.directEmbedUrl,
        usesProxy: resolution.usesProxy,
        apiOrigin: resolution.apiOrigin,
      });
      return;
    }
    liveStreamDebugLog('iframe-mount', {
      src,
      playbackMode: playback?.mode ?? null,
      embedId: playback?.embed_id ?? null,
      embedUrl: playback?.embed_url ?? null,
      usesProxy: resolution.usesProxy,
      debugQuery: src.includes('_dbg=1'),
    });
  }, [src, playback, resolution]);

  useEffect(() => {
    if (!src || probedSrcRef.current === src) {
      return;
    }
    probedSrcRef.current = src;
    void probeProxyPage(src);
  }, [src]);

  if (!src) {
    return null;
  }

  if (Capacitor.getPlatform() === 'ios' && resolution.usesProxy) {
    return <IosNativeStreamOverlay src={src} className={className} fill={fill} />;
  }

  return (
    <div className={`${boxClass} ${className}`}>
      <iframe
        className="absolute inset-0 h-full w-full border-0"
        src={src}
        title="Live Match"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        onLoad={() => {
          liveStreamDebugLog('iframe-onload', {
            src,
            note: 'Outer proxy HTML loaded only — watch proxy-yt-* logs for YouTube player state.',
          });
        }}
        onError={() => {
          liveStreamDebugLog('iframe-onerror', { src });
        }}
      />
    </div>
  );
}
