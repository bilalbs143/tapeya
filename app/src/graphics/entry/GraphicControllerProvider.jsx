import { createContext, useContext, useEffect, useMemo } from 'react';

import { useGraphicFlash } from '@/hooks/useGraphicFlash';
import { useGraphicSession } from '@/hooks/useGraphicSession';
import { graphicDebugLog, isGraphicDebugEnabled } from '@/pages/graphics-controller/graphicDebugLog';

import { processGraphicCommand } from '../core/GraphicCommandProcessor';
import { normalizeSession } from '../core/normalizeSession';

/** @typedef {import('../types.js').GraphicRenderPlan} GraphicRenderPlan */
/** @typedef {import('../types.js').GraphicSessionSnapshot} GraphicSessionSnapshot */

/**
 * @typedef {Object} GraphicControllerContextValue
 * @property {GraphicSessionSnapshot|null} snapshot
 * @property {GraphicRenderPlan|null} renderPlan
 * @property {boolean} isLoading
 * @property {boolean} isError
 */

const GraphicControllerContext = createContext(null);

/**
 * @returns {GraphicControllerContextValue}
 */
export function useGraphicController() {
  const value = useContext(GraphicControllerContext);
  if (!value) {
    throw new Error('useGraphicController must be used within GraphicControllerProvider');
  }
  return value;
}

/**
 * Entry layer: loads session, normalizes once, runs processor, exposes render plan.
 *
 * @param {{ matchId: string, searchParams: URLSearchParams, theme: string, children?: import('react').ReactNode }} props
 */
export function GraphicControllerProvider({ matchId, searchParams, theme, children }) {
  const { session, isError, isLoading, sessionQueryArg } = useGraphicSession(matchId, searchParams);

  const snapshot = useMemo(() => {
    if (!session) return null;
    return normalizeSession(session, theme);
  }, [session, theme]);

  const flashItem = useGraphicFlash(matchId);

  /**
   * When a flash is active, override commandKey on the real snapshot.
   * Falls back to the persistent Layer-1 snapshot when the queue is empty.
   */
  const activeSnapshot = useMemo(() => {
    if (!flashItem || !snapshot) return snapshot;

    return {
      ...snapshot,
      commandKey: flashItem.commandKey,
      commandType: 'LOWER_THIRD',
      displayMode: null,
    };
  }, [snapshot, flashItem]);

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
      isLoading: Boolean(sessionQueryArg && isLoading),
      isError,
    }),
    [snapshot, renderPlan, sessionQueryArg, isLoading, isError],
  );

  return <GraphicControllerContext.Provider value={value}>{children}</GraphicControllerContext.Provider>;
}
