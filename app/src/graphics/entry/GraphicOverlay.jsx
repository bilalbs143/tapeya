import { useEffect, useState } from 'react';

import { useParams, useSearchParams } from 'react-router-dom';

import { GraphicRenderer } from '../exit/GraphicRenderer';
import { ensureThemeAssetsLoaded } from '../exit/themeRegistry';
import { GraphicControllerProvider } from './GraphicControllerProvider';
import { GraphicEchoProvider } from './GraphicEchoProvider';
import {
  OverlayDiagnosticsPanel,
  resolveRendererBlockReason,
} from './OverlayDiagnosticsPanel';
import {
  isOverlayDiagnosticsEnabled,
  installOverlayDiagnosticsCapture,
  pushOverlayLog,
} from './overlayDiagnostics';
import { useGraphicController } from './useGraphicController';

/**
 * @param {{ onStatus?: (status: Record<string, unknown>) => void }} props
 */
function GraphicOverlayContent({ onStatus }) {
  const { renderPlan, isLoading } = useGraphicController();

  useEffect(() => {
    onStatus?.({
      hasRenderPlan: Boolean(renderPlan),
      commandKey: renderPlan?.commandKey ?? null,
      commandType: renderPlan?.commandType ?? null,
      displayMode: renderPlan?.displayMode ?? null,
      rendererBlock: resolveRendererBlockReason(renderPlan),
      isLoading,
    });
  }, [renderPlan, isLoading, onStatus]);

  if (isLoading && !renderPlan) return null;
  if (!renderPlan) return null;

  return <GraphicRenderer plan={renderPlan} />;
}

/**
 * Waits for session theme CSS and fonts before rendering children. Consumes controller context
 * so {@link GraphicControllerProvider} owns the sole `useGraphicSession` / Reverb subscription.
 *
 * @param {{ children: import('react').ReactNode, onGateStatus?: (status: Record<string, unknown>) => void }} props
 */
function GraphicOverlayGate({ children, onGateStatus }) {
  const { themeSlug, isLoading, isError, snapshot } = useGraphicController();
  const [assetsReady, setAssetsReady] = useState(false);
  const [assetsError, setAssetsError] = useState(null);

  useEffect(() => {
    if (!themeSlug) {
      setAssetsReady(false);
      setAssetsError(null);
      return undefined;
    }

    let cancelled = false;
    setAssetsReady(false);
    setAssetsError(null);

    ensureThemeAssetsLoaded(themeSlug)
      .then(() => {
        if (!cancelled) {
          setAssetsReady(true);
          pushOverlayLog('gate.assets', { themeSlug, status: 'ready' });
        }
      })
      .catch((err) => {
        const message = err instanceof Error ? err.message : String(err);
        if (!cancelled) {
          setAssetsError(message);
          pushOverlayLog('gate.assets', { themeSlug, status: 'error', message });
        }
        if (import.meta.env.DEV) {
          console.error('[GraphicOverlay] theme assets failed to load', err);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [themeSlug]);

  useEffect(() => {
    let blockReason = 'ready';
    if (isLoading && !snapshot) blockReason = 'loading_session';
    else if (isError && !snapshot) blockReason = 'session_error';
    else if (!themeSlug) blockReason = 'no_theme_slug';
    else if (assetsError) blockReason = 'assets_error';
    else if (!assetsReady) blockReason = 'loading_assets';

    onGateStatus?.({
      blockReason,
      assetsReady,
      assetsError,
      themeSlug,
      hasSnapshot: Boolean(snapshot),
      isLoading,
      isError,
    });
  }, [themeSlug, assetsReady, assetsError, snapshot, isLoading, isError, onGateStatus]);

  if (isLoading && !snapshot) return null;
  if (isError && !snapshot) return null;
  if (!themeSlug || !assetsReady) return null;

  return children;
}

/**
 * GraphicOverlay
 *
 * URL: /overlay/:matchId?expires=…&signature=…
 * Debug: append &overlayDebug=1 to show on-screen pipeline diagnostics.
 *
 * Pipeline: GraphicEchoProvider → GraphicControllerProvider → GraphicOverlayGate → GraphicRenderer
 */
export default function GraphicOverlay() {
  const { matchId } = useParams();
  const [searchParams] = useSearchParams();
  const debugEnabled = isOverlayDiagnosticsEnabled(searchParams);
  const [gateStatus, setGateStatus] = useState({ blockReason: 'boot' });
  const [contentStatus, setContentStatus] = useState({ hasRenderPlan: false });

  useEffect(() => {
    if (!debugEnabled) return;
    installOverlayDiagnosticsCapture();
    pushOverlayLog('overlay.route', { matchId, href: window.location.href });
  }, [debugEnabled, matchId]);

  if (!matchId) {
    if (!debugEnabled) return null;
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 2147483646,
          background: 'rgba(0,0,0,0.92)',
          color: '#f88',
          fontFamily: 'monospace',
          padding: 16,
          fontSize: 12,
        }}
      >
        overlayDebug: route missing matchId
      </div>
    );
  }

  const overlayTree = (
    <GraphicEchoProvider matchId={matchId}>
      <GraphicControllerProvider matchId={matchId} searchParams={searchParams}>
        <GraphicOverlayGate onGateStatus={setGateStatus}>
          <GraphicOverlayContent onStatus={setContentStatus} />
        </GraphicOverlayGate>
        {debugEnabled ? (
          <OverlayDiagnosticsPanel
            matchId={matchId}
            searchParams={searchParams}
            gateStatus={gateStatus}
            contentStatus={contentStatus}
          />
        ) : null}
      </GraphicControllerProvider>
    </GraphicEchoProvider>
  );

  return overlayTree;
}
