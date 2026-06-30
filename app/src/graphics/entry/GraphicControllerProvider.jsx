import { useEffect, useMemo } from 'react';

import { processGraphicCommand } from '../core/GraphicCommandProcessor';
import { applyFlashToSnapshot } from '../core/manifestCommandMeta';
import { normalizeSession } from '../core/normalizeSession';
import { graphicDebugLog, isGraphicDebugEnabled } from './debugLog';
import { GraphicControllerContext } from './graphicControllerContext';
import { useGraphicFlash } from './hooks/useGraphicFlash';
import { useGraphicSession } from './hooks/useGraphicSession';

/**
 * Entry layer: loads session, normalizes once, runs processor, exposes render plan.
 * Theme slug is read from `session.theme.slug` (graphic session SSOT).
 *
 * @param {{ matchId: string, searchParams: URLSearchParams, children?: import('react').ReactNode }} props
 */
export function GraphicControllerProvider({ matchId, searchParams, children }) {
  const { session, isError, isLoading, sessionQueryArg, error } = useGraphicSession(matchId, searchParams);
  const themeSlug = session?.theme?.slug ?? '';
  const sessionError = error
    ? (typeof error === 'object' && error !== null && 'status' in error
        ? `HTTP ${error.status}${'data' in error && error.data ? `: ${JSON.stringify(error.data)}` : ''}`
        : String(error))
    : null;

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
      sessionError,
    }),
    [snapshot, renderPlan, themeSlug, sessionQueryArg, isLoading, isError, session, sessionError],
  );

  return <GraphicControllerContext.Provider value={value}>{children}</GraphicControllerContext.Provider>;
}
