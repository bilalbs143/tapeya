import { useEffect, useState } from 'react';

import { GraphicRenderer } from '../exit/GraphicRenderer';
import { ensureThemeAssetsLoaded } from '../exit/themeRegistry';
import { GraphicControllerProvider } from './GraphicControllerProvider';
import { GraphicEchoProvider } from './GraphicEchoProvider';
import { useGraphicController } from './useGraphicController';

function GraphicsViewContent() {
  const { renderPlan, isLoading } = useGraphicController();

  if (isLoading && !renderPlan) return null;
  if (!renderPlan) return null;

  return <GraphicRenderer plan={renderPlan} />;
}

/**
 * Waits for session theme CSS and fonts before rendering children. Consumes controller context
 * so {@link GraphicControllerProvider} owns the sole `useGraphicSession` / Reverb subscription.
 * @param {{ children?: import('react').ReactNode }} props
 */
function GraphicsViewGate({ children }) {
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
        if (!cancelled) {
          console.error('[GraphicsView] theme assets failed to load', err);
          setAssetsReady(true);
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
 * GraphicsView
 *
 * URL: https://graphics.tapeya.com/{sessionId}-{expires}-{signature}
 * Theme slug comes from the graphic session API (`theme.slug`), not the page URL.
 *
 * Pipeline: GraphicEchoProvider → GraphicControllerProvider → GraphicsViewGate → GraphicRenderer
 * @param {{ accessToken: string, sessionId: string }} props
 */
export default function GraphicsView({ accessToken, sessionId }) {
  if (!accessToken || !sessionId) return null;

  return (
    <GraphicEchoProvider>
      <GraphicControllerProvider accessToken={accessToken}>
        <GraphicsViewGate>
          <GraphicsViewContent />
        </GraphicsViewGate>
      </GraphicControllerProvider>
    </GraphicEchoProvider>
  );
}
