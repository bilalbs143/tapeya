/**
 * iOS reel attach — progressive or native HLS (`video.src` + `load()`).
 * Never uses hls.js (MSE) on this platform.
 */

import { applyInlineVideoAttributes, setReelVideoMuted } from '@/features/reels/lib/inlineVideo';

import type { ReelAttachHandle, StartReelAttachOptions } from '../attachContract';
import { attachProgressiveSource } from '../progressive';
import { hardResetVideo } from '../videoReset';
import { armActiveAttachWatchdog } from '../watchdog';
import { canPlayNativeHls } from './canNative';

export function startIosReelAttach(options: StartReelAttachOptions): ReelAttachHandle {
  const { video, url, mode, role, attempt, cancelled, onReady, onError, onRetry, applyResume, bindHls } = options;

  let readyHandled = false;
  let clearWatchdog = () => {};
  let removeMedia = () => {};

  const markReady = () => {
    if (cancelled() || readyHandled) return;
    readyHandled = true;
    clearWatchdog();
    applyResume(video);
    onReady();
    if (role !== 'active') {
      setReelVideoMuted(video, true);
      try {
        video.pause();
      } catch {
        // Ignore.
      }
    }
  };

  const fail = () => {
    clearWatchdog();
    onError();
  };

  applyInlineVideoAttributes(video);
  bindHls(null);
  hardResetVideo(video);

  if (mode === 'progressive') {
    removeMedia = attachProgressiveSource(video, url, markReady, fail);
    clearWatchdog = armActiveAttachWatchdog({
      role,
      attempt,
      cancelled,
      isReady: () => readyHandled,
      onRetry,
      onError: fail,
    });
  } else if (canPlayNativeHls(video)) {
    // destroy already cleared src; load() after assign so WebKit actually starts.
    const onLoaded = () => markReady();
    video.addEventListener('error', fail);
    video.addEventListener('loadeddata', onLoaded, { once: true });
    removeMedia = () => {
      video.removeEventListener('error', fail);
      video.removeEventListener('loadeddata', onLoaded);
    };
    video.src = url;
    try {
      video.load();
    } catch {
      // Ignore.
    }
    clearWatchdog = armActiveAttachWatchdog({
      role,
      attempt,
      cancelled,
      isReady: () => readyHandled,
      onRetry,
      onError: fail,
    });
  } else {
    // Rare: older WKWebView without HLS — surface fail (do not pull hls.js onto iOS).
    fail();
  }

  return {
    dispose: () => {
      clearWatchdog();
      removeMedia();
      bindHls(null);
      hardResetVideo(video);
    },
    onPromote: (nextRole) => {
      if (nextRole !== 'active' || readyHandled) return;
      // Native media can sit at HAVE_METADATA + NETWORK_IDLE — force re-attach.
      const stalled =
        Boolean(video.currentSrc || video.getAttribute('src')) &&
        video.readyState < 2 &&
        video.networkState !== HTMLMediaElement.NETWORK_LOADING;
      if (stalled) onRetry();
    },
  };
}
