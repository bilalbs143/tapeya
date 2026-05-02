import { Suspense, useCallback, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { graphicSessionApi, useGetGraphicSessionQuery } from '@/store/api/graphicSessionApi';
import { getGraphicComponent } from './graphicRegistry';
import { useGraphicChannel } from '@/hooks/useGraphicChannel';

/**
 * Fallback polling interval — acts as a safety-net in case the WebSocket
 * connection drops.  Real-time updates come via Reverb; polling is secondary.
 */
const FALLBACK_POLL_MS = 30_000;

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
 * Fallback: polls the admin graphic session API every 30 s to self-heal after
 * any WebSocket interruption.
 *
 * The page root and body are made transparent so only the graphic card
 * floats over the video stream.
 *
 * Auth: uses the Bearer token from the Redux store for the HTTP fallback poll.
 * The Reverb channel is public — no auth required there.
 */
export default function GraphicOverlay() {
  const { matchId } = useParams();
  const [searchParams] = useSearchParams();
  const theme = searchParams.get('theme') ?? 'tapeya-basic';
  const dispatch = useDispatch();

  // Make the browser window transparent — essential for OBS browser source.
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prev = { html: html.style.background, body: body.style.background };
    html.style.background = 'transparent';
    body.style.background = 'transparent';
    return () => {
      html.style.background = prev.html;
      body.style.background = prev.body;
    };
  }, []);

  const { data: session, isError, isLoading } = useGetGraphicSessionQuery(
    matchId,
    {
      skip: !matchId,
      pollingInterval: FALLBACK_POLL_MS,
      refetchOnFocus: true,
    },
  );

  // When Reverb delivers a real-time event, patch the cached session in-place
  // so the component re-renders immediately without waiting for the next poll.
  const handleReverbEvent = useCallback(
    (event) => {
      dispatch(
        graphicSessionApi.util.updateQueryData('getGraphicSession', matchId, (draft) => {
          draft.active_command = {
            command_key: event.command_key,
            command_type: event.command_type,
            display_mode: event.display_mode ?? null,
            payload: event.payload ?? null,
            id: event.command_id,
          };
        }),
      );
    },
    [dispatch, matchId],
  );

  useGraphicChannel(matchId, handleReverbEvent);

  // Before we have data, render nothing (fully transparent).
  if (!matchId || isLoading) return null;

  // On error or no session, stay transparent — never show an error overlay
  // over a live stream.
  if (isError || !session) return null;

  const commandKey = session?.active_command?.command_key ?? null;
  const GraphicComponent = getGraphicComponent(commandKey, theme);

  // null means LT_EMPTY / intentionally clear — transparent screen.
  if (!GraphicComponent) return null;

  return (
    // graphic-overlay-container: CSS in index.css strips the outer dark
    // background wrapper that each component uses for standalone preview,
    // leaving only the graphic card visible against a transparent page.
    <div className="graphic-overlay-container">
      <Suspense fallback={null}>
        <GraphicComponent />
      </Suspense>
    </div>
  );
}
