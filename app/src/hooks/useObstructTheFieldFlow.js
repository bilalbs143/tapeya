import { useCallback, useState } from 'react';

/**
 * @param {object[]} batsmen On-crease batters
 * @param {string|null} [lockedDeliveryType] Pre-set from wide/no-ball combined wicket flow
 * @param {Set<number>|null} [fieldingPlayerIds] IDs of fielding-side players — validates optional fielder selection
 */
export function useObstructTheFieldFlow(batsmen = [], lockedDeliveryType = null, fieldingPlayerIds = null) {
  const striker = batsmen[0];
  const nonStriker = batsmen[1];

  const [outPlayerId, setOutPlayerId] = useState(null);
  const [fielderId, setFielderId] = useState(null);
  const [fielderOpen, setFielderOpen] = useState(false);
  const [dontCountBall, setDontCountBall] = useState(true);
  const [dismissalDeliveryType, setDismissalDeliveryType] = useState(lockedDeliveryType ?? 'fair');

  // Fielder is optional on obstruct — only validate team membership if one is selected.
  const fielderValid = fielderId == null || fieldingPlayerIds == null || fieldingPlayerIds.has(Number(fielderId));
  const canSubmit = Boolean(outPlayerId) && fielderValid;

  const buildPayload = useCallback(
    ({ strikerId, nonStrikerId, bowlerId, isWide = false, isNoBall = false }) => ({
      outPlayerId,
      fielderId: fielderId || null,
      dontCountBall,
      dismissalDeliveryType: lockedDeliveryType ?? dismissalDeliveryType,
      isWide,
      isNoBall,
      strikerId,
      nonStrikerId,
      bowlerId,
    }),
    [outPlayerId, fielderId, dontCountBall, dismissalDeliveryType, lockedDeliveryType],
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
    dontCountBall,
    setDontCountBall,
    dismissalDeliveryType,
    setDismissalDeliveryType,
    lockedDeliveryType,
    canSubmit,
    buildPayload,
  };
}
