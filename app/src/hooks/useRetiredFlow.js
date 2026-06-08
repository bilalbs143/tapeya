import { useCallback, useState } from 'react';

/**
 * Shared state and payload builder for retired-hurt and retired-out flows.
 * Both flows require the same three fields — only the dismissal type differs,
 * which is set by the caller (useRetiredHurtFlow / useRetiredOutFlow).
 *
 * @param {object[]} batsmen On-crease batters
 */
export function useRetiredFlow(batsmen = []) {
  const striker = batsmen[0];
  const nonStriker = batsmen[1];

  const [outPlayerId, setOutPlayerId] = useState(null);
  const [dontCountBall, setDontCountBall] = useState(true);
  const [dismissalDeliveryType, setDismissalDeliveryType] = useState('fair');

  const canSubmit = Boolean(outPlayerId);

  const buildPayload = useCallback(
    ({ strikerId, nonStrikerId, bowlerId }) => ({
      outPlayerId,
      dontCountBall,
      dismissalDeliveryType,
      strikerId,
      nonStrikerId,
      bowlerId,
    }),
    [outPlayerId, dontCountBall, dismissalDeliveryType],
  );

  return {
    striker,
    nonStriker,
    outPlayerId,
    setOutPlayerId,
    dontCountBall,
    setDontCountBall,
    dismissalDeliveryType,
    setDismissalDeliveryType,
    canSubmit,
    buildPayload,
  };
}
