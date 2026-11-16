/**
 * Web reel attach — progressive or hls.js MSE in desktop/mobile browsers.
 * Independent from Android (same engine today; diverge freely here).
 */

import { applyInlineVideoAttributes, setReelVideoMuted } from '@/features/reels/lib/inlineVideo';

import type { ReelAttachHandle, StartReelAttachOptions } from '../attachContract';
import { attachMseHls, type MseHlsHandle } from '../mse/attachHls';
import { attachProgressiveSource } from '../progressive';
import { hardResetVideo } from '../videoReset';
import { armActiveAttachWatchdog } from '../watchdog';

export function startWebReelAttach(options: StartReelAttachOptions): ReelAttachHandle {
  const { video, url, mode, role, attempt, cancelled, onReady, onError, onRetry, applyResume, bindHls } = options;

  let readyHandled = false;
  let clearWatchdog = () => {};
  let removeProgressive = () => {};
  let mse: MseHlsHandle | null = null;

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
    removeProgressive = attachProgressiveSource(video, url, markReady, fail);
    clearWatchdog = armActiveAttachWatchdog({
      role,
      attempt,
      cancelled,
      isReady: () => readyHandled,
      onRetry,
      onError: fail,
    });
  } else {
    mse = attachMseHls({
      video,
      url,
      role,
      onReady: markReady,
      onFatal: fail,
      bindHls,
    });
    if (!mse) {
      // Safari desktop may support native HLS — fall back to src when MSE missing.
      const onLoaded = () => markReady();
      video.addEventListener('error', fail);
      video.addEventListener('loadeddata', onLoaded, { once: true });
      removeProgressive = () => {
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
    } else if (role === 'active') {
      clearWatchdog = armActiveAttachWatchdog({
        role,
        attempt,
        cancelled,
        isReady: () => readyHandled,
        onRetry,
        onError: fail,
      });
    }
  }

  return {
    dispose: () => {
      clearWatchdog();
      removeProgressive();
      mse?.destroy();
      mse = null;
      bindHls(null);
      hardResetVideo(video);
    },
    onPromote: (nextRole) => {
      mse?.promote(nextRole);
    },
  };
}
