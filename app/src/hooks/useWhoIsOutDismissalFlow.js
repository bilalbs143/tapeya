import { useCallback, useState } from 'react';

/**
 * @param {boolean} [defaultDontCountBall]
 */
export function useWhoIsOutDismissalFlow(defaultDontCountBall = true) {
  const [outPlayerId, setOutPlayerId] = useState(null);
  const [dontCountBall, setDontCountBall] = useState(defaultDontCountBall);

  const canSubmit = Boolean(outPlayerId);

  const buildPayload = useCallback(
    ({ strikerId, nonStrikerId, bowlerId }) => ({
      outPlayerId,
      dontCountBall,
      strikerId,
      nonStrikerId,
      bowlerId,
    }),
    [outPlayerId, dontCountBall],
  );

  return {
    outPlayerId,
    setOutPlayerId,
    dontCountBall,
    setDontCountBall,
    canSubmit,
    buildPayload,
  };
}
