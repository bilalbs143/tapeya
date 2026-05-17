import { Suspense, useEffect } from 'react';

import { useParams, useSearchParams } from 'react-router-dom';

import { useGraphicSession } from '@/hooks/useGraphicSession';

import { buildGraphicProps } from './buildGraphicProps';
import { graphicLogger, isGraphicDebugEnabled } from './graphicDebugLog';
import { GraphicEchoProvider } from './GraphicEchoContext';
import { getGraphicComponent } from './graphicRegistry';

/**
 * Inner overlay: must sit under {@link GraphicEchoProvider} so Reverb uses a
 * single Echo instance (see `useGraphicChannel`).
 */
function GraphicOverlayInner({ matchId, searchParams, theme }) {
  const { session, isError, isLoading, sessionQueryArg } = useGraphicSession(matchId, searchParams);

  if (!sessionQueryArg || isLoading) return null;

  if (isError || !session) return null;

  const commandKey = session?.active_command?.command_key ?? null;
  const GraphicComponent = getGraphicComponent(commandKey, theme);

  if (!GraphicComponent) {
    return null;
  }

  const payload = session?.active_command?.payload ?? null;
  const graphicProps = buildGraphicProps(commandKey, session, payload);

  if (isGraphicDebugEnabled()) {
    graphicLogger('log', 'GraphicOverlay.build', {
      matchId,
      theme,
      commandKey,
      commandType: session?.active_command?.command_type ?? null,
      hasContext: Boolean(session?.context),
      contextMatch: session?.context?.match ?? null,
      payload,
      graphicPropsKeys: graphicProps && typeof graphicProps === 'object' ? Object.keys(graphicProps) : [],
      ...(commandKey === 'TOSS_LT' && {
        tossDecision: graphicProps?.decision ?? '',
      }),
      ...(commandKey === 'RESULT_LT' && {
        resultLine: graphicProps?.resultLine,
        winningTeam: graphicProps?.winningTeam,
      }),
    });
  }

  return (
    <div className="graphic-overlay-container">
      <Suspense fallback={null}>
        <GraphicComponent {...graphicProps} />
      </Suspense>
    </div>
  );
}

/**
 * GraphicOverlay
 *
 * URL: /overlay/:matchId?theme=tapeya-basic
 *
 * Opens as a browser source in OBS/vMix or on a second monitor.
 *
 * Real-time: subscribes to the public Reverb channel `match.{matchId}.graphics`
 * and instantly patches the RTK Query cache whenever `.match.graphic.activated`
 * arrives — zero perceptible delay on live broadcast.
 *
 * Initial state: GET to graphic session API — either signed query params
 * (?expires=&signature=, no login) or authenticated /matches/:id/graphic-session.
 * Updates after that come from Reverb.
 *
 * html, body, and #root are forced transparent (global SCSS paints them black)
 * so only the graphic card floats over the video stream.
 *
 * The Reverb channel is public — no auth required there.
 */
export default function GraphicOverlay() {
  const { matchId } = useParams();
  const [searchParams] = useSearchParams();
  const theme = searchParams.get('theme') ?? 'tapeya-basic';

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const root = document.getElementById('root');
    const prev = {
      html: html.style.backgroundColor,
      body: body.style.backgroundColor,
      root: root?.style.backgroundColor ?? '',
    };
    html.style.backgroundColor = 'transparent';
    body.style.backgroundColor = 'transparent';
    if (root) {
      root.style.backgroundColor = 'transparent';
    }
    return () => {
      html.style.backgroundColor = prev.html;
      body.style.backgroundColor = prev.body;
      if (root) {
        root.style.backgroundColor = prev.root;
      }
    };
  }, []);

  if (!matchId) return null;

  return (
    <GraphicEchoProvider matchId={matchId}>
      <GraphicOverlayInner matchId={matchId} searchParams={searchParams} theme={theme} />
    </GraphicEchoProvider>
  );
}
