import { useCallback, useState } from 'react';

/**
 * @param {object[]} batsmen On-crease batters [striker, nonStriker]
 * @param {number|null} [defaultOutPlayerId] Usually non-striker
 */
export function useMankadFlow(batsmen = [], defaultOutPlayerId = null) {
  const striker = batsmen[0];
  const nonStriker = batsmen[1];
  const defaultOut = defaultOutPlayerId ?? nonStriker?.id ?? striker?.id ?? null;

  const [outPlayerId, setOutPlayerId] = useState(defaultOut);

  const canSubmit = Boolean(outPlayerId);

  const buildPayload = useCallback(
    ({ strikerId, nonStrikerId, bowlerId }) => ({
      outPlayerId,
      bowlerId,
      strikerId,
      nonStrikerId,
    }),
    [outPlayerId],
  );

  return {
    striker,
    nonStriker,
    outPlayerId,
    setOutPlayerId,
    canSubmit,
    buildPayload,
  };
}
