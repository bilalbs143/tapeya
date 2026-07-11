import { useCallback, useEffect, useRef } from 'react';

import { getFullWindowPreviewLayout, shouldSyncPreviewLayout, waitForNextPaint } from '@/features/stream/broadcastCameraUtils';
import {
  requestBroadcastPermissions,
  startBroadcastPreview,
  stopBroadcastPreview,
  updateBroadcastPreviewLayout,
} from '@/native/tapeyaBroadcast';
import { isNative } from '@/platform/platform';

/**
 * Native camera preview for go-live: permissions, full-window layout sync, resize handling,
 * and teardown. Web controls render above a transparent Capacitor layer.
 *
 * @param {object} options
 * @param {object | undefined} options.broadcast — loaded broadcast row from API
 * @param {string} options.phase — local broadcast phase
 * @param {(phase: string) => void} options.setPhase
 * @param {(broadcast: object) => Promise<void>} [options.onResumedWhileLive] — re-publish when server still shows live
 */
export function useBroadcastNativePreview({ broadcast, phase, setPhase, onResumedWhileLive }) {
  const previewRef = useRef(null);
  const initRanRef = useRef(false);
  const previewActiveRef = useRef(false);

  const startPreviewWithRetry = useCallback(async (layout) => {
    const target = layout ?? getFullWindowPreviewLayout();
    try {
      await startBroadcastPreview(target);
      return;
    } catch {
      // Native already retries Camera2 open; one delayed JS retry covers Activity-resume races
      // after the first permission dialog where the first call still times out.
      await new Promise((resolve) => window.setTimeout(resolve, 700));
      await waitForNextPaint();
      await startBroadcastPreview(getFullWindowPreviewLayout());
    }
  }, []);

  const syncPreviewLayout = useCallback(
    async ({ start = false } = {}) => {
      if (!isNative()) return;
      await waitForNextPaint();

      const layout = getFullWindowPreviewLayout();

      if (start || !previewActiveRef.current) {
        await startPreviewWithRetry(layout);
        previewActiveRef.current = true;
        return;
      }

      try {
        await updateBroadcastPreviewLayout(layout);
      } catch {
        await startPreviewWithRetry(layout);
        previewActiveRef.current = true;
      }
    },
    [startPreviewWithRetry],
  );

  useEffect(() => {
    if (!broadcast || initRanRef.current) return;
    initRanRef.current = true;

    if (broadcast.status !== 'idle' && broadcast.status !== 'starting' && broadcast.status !== 'live') {
      return;
    }

    const resumedWhileLive = broadcast.status === 'live';

    (async () => {
      setPhase('requesting_permissions');
      const perms = await requestBroadcastPermissions();
      if (perms.camera !== 'granted' || perms.microphone !== 'granted') {
        setPhase('permission_denied');
        return;
      }

      // After the system permission dialog, wait for layout + Activity resume before opening Camera2.
      await waitForNextPaint();
      await waitForNextPaint();
      setPhase('previewing');
      await waitForNextPaint();
      try {
        await syncPreviewLayout({ start: true });
      } catch {
        setPhase('error');
        return;
      }

      if (resumedWhileLive && onResumedWhileLive) {
        await onResumedWhileLive(broadcast);
      }
    })();
  }, [broadcast, onResumedWhileLive, setPhase, syncPreviewLayout]);

  useEffect(() => {
    if (!initRanRef.current || !previewActiveRef.current) return;
    if (!shouldSyncPreviewLayout(phase)) return;
    void syncPreviewLayout();
  }, [phase, syncPreviewLayout]);

  useEffect(() => {
    if (!isNative()) return undefined;
    const onResize = () => {
      if (!previewActiveRef.current) return;
      if (!shouldSyncPreviewLayout(phase)) return;
      void syncPreviewLayout();
    };
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, [phase, syncPreviewLayout]);

  useEffect(
    () => () => {
      if (initRanRef.current) {
        previewActiveRef.current = false;
        void stopBroadcastPreview();
      }
    },
    [],
  );

  const resetSession = useCallback(() => {
    initRanRef.current = false;
    previewActiveRef.current = false;
  }, []);

  return { previewRef, resetSession };
}
