import { useEffect, useMemo } from 'react';

import { graphicDebugLog, isGraphicDebugEnabled } from '@tapeya/graphics-core/debugLog.js';
import { processGraphicCommand } from '@tapeya/graphics-core/GraphicCommandProcessor.js';
import { applyFlashToSnapshot } from '@tapeya/graphics-core/manifestCommandMeta.js';
import { normalizeSession } from '@tapeya/graphics-core/normalizeSession/index.js';

import { GraphicControllerContext } from './graphicControllerContext';
import { useGraphicFlash } from './hooks/useGraphicFlash';
import { useGraphicSession } from './hooks/useGraphicSession';

/**
 * Entry layer: loads session, normalizes once, runs processor, exposes render plan.
 * Theme slug is read from `session.theme.slug` (graphic session SSOT).
 *
 * @param {{
 *   accessToken: string,
 *   children?: import('react').ReactNode,
 * }} props
 */
export function GraphicControllerProvider({ accessToken, children }) {
  const { session, isError, isLoading, sessionQueryArg, matchId } = useGraphicSession(accessToken);
  const themeSlug = session?.theme?.slug ?? '';

  const snapshot = useMemo(() => {
    if (!session || !themeSlug) return null;
    return normalizeSession(session, themeSlug);
  }, [session, themeSlug]);

  const flashItem = useGraphicFlash(matchId);

  /**
   * When a flash is active, override commandKey on the real snapshot.
   * Falls back to the persistent Layer-1 snapshot when the queue is empty.
   */
  const activeSnapshot = useMemo(() => applyFlashToSnapshot(snapshot, flashItem), [snapshot, flashItem]);

  const renderPlan = useMemo(() => {
    if (!activeSnapshot?.commandKey) return null;
    return processGraphicCommand(activeSnapshot);
  }, [
    activeSnapshot?.commandId,
    activeSnapshot?.contextHash,
    activeSnapshot?.commandKey,
    activeSnapshot?.commandType,
    activeSnapshot?.themeSlug,
  ]);

  useEffect(() => {
    if (!snapshot || !isGraphicDebugEnabled()) return;

    graphicDebugLog('entry:session', {
      commandKey: snapshot.commandKey,
      commandId: snapshot.commandId,
      contextHash: snapshot.contextHash,
      displayMode: snapshot.displayMode,
    });
  }, [snapshot?.commandKey, snapshot?.commandId, snapshot?.contextHash, snapshot?.displayMode]);

  const value = useMemo(
    () => ({
      snapshot,
      renderPlan,
      themeSlug,
      isLoading: Boolean(sessionQueryArg && isLoading && !session),
      isError: Boolean(isError && !session),
    }),
    [snapshot, renderPlan, themeSlug, sessionQueryArg, isLoading, isError, session],
  );

  return <GraphicControllerContext.Provider value={value}>{children}</GraphicControllerContext.Provider>;
}
