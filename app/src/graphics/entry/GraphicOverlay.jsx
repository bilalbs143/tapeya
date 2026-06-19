import { useEffect, useState } from 'react';

import { useParams, useSearchParams } from 'react-router-dom';

import { GraphicRenderer } from '../exit/GraphicRenderer';
import { ensureThemeAssetsLoaded } from '../exit/themeRegistry';
import { GraphicControllerProvider } from './GraphicControllerProvider';
import { GraphicEchoProvider } from './GraphicEchoProvider';
import { useGraphicController } from './useGraphicController';

function GraphicOverlayContent() {
  const { renderPlan, isLoading } = useGraphicController();

  if (isLoading && !renderPlan) return null;
  if (!renderPlan) return null;

  return <GraphicRenderer plan={renderPlan} />;
}

/**
 * Waits for session theme CSS and fonts before rendering children. Consumes controller context
 * so {@link GraphicControllerProvider} owns the sole `useGraphicSession` / Reverb subscription.
 */
function GraphicOverlayGate({ children }) {
  const { themeSlug, isLoading, isError, snapshot } = useGraphicController();
  const [assetsReady, setAssetsReady] = useState(false);

  useEffect(() => {
    if (!themeSlug) {
      setAssetsReady(false);
      return undefined;
    }

    let cancelled = false;
    setAssetsReady(false);

    ensureThemeAssetsLoaded(themeSlug)
      .then(() => {
        if (!cancelled) {
          setAssetsReady(true);
        }
      })
      .catch((err) => {
        if (!cancelled && import.meta.env.DEV) {
          console.error('[GraphicOverlay] theme assets failed to load', err);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [themeSlug]);

  if (isLoading && !snapshot) return null;
  if (isError && !snapshot) return null;
  if (!themeSlug || !assetsReady) return null;

  return children;
}

/**
 * GraphicOverlay
 *
 * URL: /overlay/:matchId?expires=…&signature=…
 * Theme slug comes from the graphic session API (`theme.slug`), not the page URL.
 *
 * Pipeline: GraphicEchoProvider → GraphicControllerProvider → GraphicOverlayGate → GraphicRenderer
 *
 * Docs: ../ARCHITECTURE.md (graphics module SSOT — layers, commands, theme 2, tests)
 */
export default function GraphicOverlay() {
  const { matchId } = useParams();
  const [searchParams] = useSearchParams();

  if (!matchId) return null;

  return (
    <GraphicEchoProvider matchId={matchId}>
      <GraphicControllerProvider matchId={matchId} searchParams={searchParams}>
        <GraphicOverlayGate>
          <GraphicOverlayContent />
        </GraphicOverlayGate>
      </GraphicControllerProvider>
    </GraphicEchoProvider>
  );
}
