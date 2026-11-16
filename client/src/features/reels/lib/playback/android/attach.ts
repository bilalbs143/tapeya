/**
 * Android reel attach — progressive or hls.js MSE.
 * Never uses native HLS (Chromium canPlayType lies and stalls forever).
 */

import { applyInlineVideoAttributes, setReelVideoMuted } from '@/features/reels/lib/inlineVideo';

import type { ReelAttachHandle, StartReelAttachOptions } from '../attachContract';
import { attachMseHls, type MseHlsHandle } from '../mse/attachHls';
import { attachProgressiveSource } from '../progressive';
import { hardResetVideo } from '../videoReset';
import { armActiveAttachWatchdog } from '../watchdog';

export function startAndroidReelAttach(options: StartReelAttachOptions): ReelAttachHandle {
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
      fail();
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
