import { useCallback, useEffect, useRef } from 'react';

import {
  requestBroadcastPermissions,
  resetBroadcastSession,
  setBroadcastMuted,
  startBroadcastPreview,
  stopBroadcast,
  stopBroadcastPreview,
  updateBroadcastPreviewLayout,
} from '@/shared/native/tapeyaBroadcast';
import { isNativePlatform } from '@/shared/platform/platform';

import type { OwnerBroadcast } from '../model/schemas';
import {
  type BroadcastPhase,
  getFullWindowPreviewLayout,
  isBroadcastPluginUnavailableError,
  isResumableBroadcastStatus,
  resolveBroadcastOrientation,
  shouldSyncPreviewLayout,
  waitForNextPaint,
} from './broadcastCameraUtils';

type UseBroadcastNativePreviewArgs = {
  broadcast: OwnerBroadcast | undefined;
  phase: BroadcastPhase;
  setPhase: (phase: BroadcastPhase) => void;
  onResumedWhileLive?: ((broadcast: OwnerBroadcast) => Promise<void>) | undefined;
  previewGeneration?: number | undefined;
};

/** Native camera preview for go-live: permissions, full-window layout sync, resize, teardown. Web: no-op (preview surface stays a placeholder). */
export function useBroadcastNativePreview({
  broadcast,
  phase,
  setPhase,
  onResumedWhileLive,
  previewGeneration = 0,
}: UseBroadcastNativePreviewArgs) {
  const initRanRef = useRef(false);
  const previewActiveRef = useRef(false);
  const orientation = resolveBroadcastOrientation(broadcast?.orientation);

  const startPreviewWithRetry = useCallback(
    async (layout?: ReturnType<typeof getFullWindowPreviewLayout>) => {
      const target = layout ?? getFullWindowPreviewLayout();
      try {
        await startBroadcastPreview({ ...target, orientation });
        return;
      } catch {
        await new Promise((resolve) => window.setTimeout(resolve, 700));
        await waitForNextPaint();
        await startBroadcastPreview({ ...getFullWindowPreviewLayout(), orientation });
      }
    },
    [orientation]
  );

  const syncPreviewLayout = useCallback(
    async ({ start = false }: { start?: boolean | undefined } = {}) => {
      if (!isNativePlatform()) return;
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
    [startPreviewWithRetry]
  );

  useEffect(() => {
    if (!broadcast || initRanRef.current) return;
    initRanRef.current = true;

    if (!isResumableBroadcastStatus(broadcast.status)) {
      setPhase(broadcast.status === 'ended' ? 'ended' : 'error');
      return;
    }

    const resumedWhileLive = broadcast.status === 'live';

    void (async () => {
      if (!isNativePlatform()) {
        setPhase('previewing');
        return;
      }

      setPhase('requesting_permissions');
      try {
        const perms = await requestBroadcastPermissions();
        if (perms.camera !== 'granted' || perms.microphone !== 'granted') {
          setPhase('permission_denied');
          return;
        }
      } catch (error) {
        setPhase(isBroadcastPluginUnavailableError(error) ? 'plugin_unavailable' : 'error');
        return;
      }

      await waitForNextPaint();
      await waitForNextPaint();
      setPhase('previewing');
      await waitForNextPaint();
      try {
        await syncPreviewLayout({ start: true });
        // Belt-and-suspenders with native mute reset — keep JS + encoder mic state aligned.
        await setBroadcastMuted(false);
      } catch (error) {
        setPhase(isBroadcastPluginUnavailableError(error) ? 'plugin_unavailable' : 'error');
        return;
      }

      if (resumedWhileLive && onResumedWhileLive) {
        await onResumedWhileLive(broadcast);
      }
    })();
  }, [broadcast, onResumedWhileLive, setPhase, syncPreviewLayout, previewGeneration]);

  useEffect(() => {
    if (!initRanRef.current || !previewActiveRef.current) return;
    if (!shouldSyncPreviewLayout(phase)) return;
    void syncPreviewLayout();
  }, [phase, syncPreviewLayout]);

  useEffect(() => {
    if (!isNativePlatform()) return undefined;
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
    []
  );

  const resetSession = useCallback(async () => {
    initRanRef.current = false;
    previewActiveRef.current = false;
    await Promise.allSettled([stopBroadcast(), stopBroadcastPreview()]);
    try {
      await resetBroadcastSession();
    } catch {
      // stopPreview above is enough when resetSession is unavailable (e.g. iOS).
    }
  }, []);

  return { resetSession };
}
