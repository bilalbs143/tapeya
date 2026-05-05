import { Suspense, useCallback, useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { graphicSessionApi, useGetGraphicSessionQuery } from '@/store/api/graphicSessionApi';
import { getGraphicComponent } from './graphicRegistry';
import { useGraphicChannel } from '@/hooks/useGraphicChannel';

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
  const dispatch = useDispatch();

  // searchParams identity can change every render; .toString() stabilizes deps.
  const sessionQueryArg = useMemo(() => {
    if (!matchId) return null;
    const expires = searchParams.get('expires');
    const signature = searchParams.get('signature');
    if (expires && signature) {
      return { matchId, expires, signature };
    }
    return matchId;
  }, [matchId, searchParams.toString()]);

  // Make the full stack transparent — essential for OBS browser source.
  // style.scss sets html, body, and #root to #000; inline styles override that.
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

  const { data: session, isError, isLoading } = useGetGraphicSessionQuery(sessionQueryArg, {
    skip: !sessionQueryArg,
  });

  // When Reverb delivers a real-time event, patch the cached session in-place
  // so the component re-renders immediately.
  const handleReverbEvent = useCallback(
    (event) => {
      if (!sessionQueryArg) return;
      dispatch(
        graphicSessionApi.util.updateQueryData('getGraphicSession', sessionQueryArg, (draft) => {
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
    [dispatch, sessionQueryArg],
  );

  useGraphicChannel(matchId, handleReverbEvent);

  // Before we have data, render nothing (fully transparent).
  if (!sessionQueryArg || isLoading) return null;

  // On error or no session, stay transparent — never show an error overlay
  // over a live stream.
  if (isError || !session) return null;

  const commandKey = session?.active_command?.command_key ?? null;
  const GraphicComponent = getGraphicComponent(commandKey, theme);

  // null means LT_EMPTY / intentionally clear — transparent screen.
  if (!GraphicComponent) return null;

  const payload = session?.active_command?.payload;
  const graphicProps =
    commandKey === 'CUSTOM' && payload && typeof payload === 'object'
      ? {
          text: [payload.title, payload.description]
            .filter((v) => v != null && String(v).trim() !== '')
            .join('\n\n'),
        }
      : {};

  return (
    // graphic-overlay-container: CSS in index.css strips the outer dark
    // background wrapper that each component uses for standalone preview,
    // leaving only the graphic card visible against a transparent page.
    <div className="graphic-overlay-container">
      <Suspense fallback={null}>
        <GraphicComponent {...graphicProps} />
      </Suspense>
    </div>
  );
}
