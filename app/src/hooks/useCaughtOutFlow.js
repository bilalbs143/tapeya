import { useCallback, useState } from 'react';

/**
 * Caught-out dialog state — who is out + fielder (§6.2).
 *
 * @param {object[]} batsmen On-crease batters (max 2)
 * @param {number|null} [defaultStrikerId]
 * @param {number|null} [presetFielderId]
 * @param {Set<number>|null} [fieldingPlayerIds] IDs of fielding-side players — validates preset and picker selection
 */
export function useCaughtOutFlow(batsmen = [], defaultStrikerId = null, presetFielderId = null, fieldingPlayerIds = null) {
  const striker = batsmen[0];
  const nonStriker = batsmen[1];

  const [outPlayerId, setOutPlayerId] = useState(() => defaultStrikerId ?? striker?.id ?? nonStriker?.id ?? null);
  const [fielderId, setFielderId] = useState(() => presetFielderId ?? null);
  const [fielderOpen, setFielderOpen] = useState(() => presetFielderId == null);

  const fielderValid = fielderId != null && (fieldingPlayerIds == null || fieldingPlayerIds.has(Number(fielderId)));
  const canSubmit = Boolean(outPlayerId) && fielderValid;

  const buildPayload = useCallback(
    ({ strikerId, nonStrikerId, bowlerId, isWide, isNoBall }) => ({
      outPlayerId,
      fielderId,
      strikerId,
      nonStrikerId,
      bowlerId,
      isWide,
      isNoBall,
    }),
    [outPlayerId, fielderId],
  );

  return {
    striker,
    nonStriker,
    outPlayerId,
    setOutPlayerId,
    fielderId,
    setFielderId,
    fielderOpen,
    setFielderOpen,
    canSubmit,
    buildPayload,
  };
}
