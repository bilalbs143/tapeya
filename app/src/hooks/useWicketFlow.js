import { useCallback } from 'react';

/**
 * Post-wicket summary actions (§7.3).
 *
 * @param {() => void|Promise<void>} onUndo Reverts the last ball
 * @param {() => void} onProceed Continues (e.g. new batter picker)
 */
export function useWicketFlow({ onUndo, onProceed }) {
  const handleUndo = useCallback(async () => {
    await onUndo?.();
  }, [onUndo]);

  const handleProceed = useCallback(() => {
    onProceed?.();
  }, [onProceed]);

  return { handleUndo, handleProceed };
}
