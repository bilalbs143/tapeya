import { useCallback, useState } from 'react';

/**
 * Run-out dialog state.
 *
 * @param {object[]} batsmen On-crease batters (max 2)
 * @param {'normal'|'no_ball'} [deliveryContext]
 * @param {number|null} [defaultStrikerId]
 * @param {Set<number>|null} [fieldingPlayerIds] IDs of fielding-side players — used to validate fielder selection
 */
export function useRunOutFlow(batsmen = [], deliveryContext = 'normal', defaultStrikerId = null, fieldingPlayerIds = null) {
  const simplified = deliveryContext === 'no_ball';
  const striker = batsmen[0];
  const nonStriker = batsmen[1];

  const [outPlayerId, setOutPlayerId] = useState(() => defaultStrikerId ?? striker?.id ?? nonStriker?.id ?? null);
  const [fielderId, setFielderId] = useState(null);
  const [fielderOpen, setFielderOpen] = useState(true);
  const [runoutExtraRuns, setRunoutExtraRuns] = useState(0);
  const [runoutRunType, setRunoutRunType] = useState('from_bat');
  const [batterCrossed, setBatterCrossed] = useState(true);

  const fielderValid = fielderId != null && (fieldingPlayerIds == null || fieldingPlayerIds.has(Number(fielderId)));
  const canSubmit = Boolean(outPlayerId) && fielderValid;

  const buildPayload = useCallback(
    ({ strikerId, nonStrikerId, bowlerId }) => ({
      outPlayerId,
      fielderId,
      runoutExtraRuns,
      runoutRunType: simplified ? 'from_bat' : runoutRunType,
      batterCrossed: simplified ? null : batterCrossed,
      isNoBall: simplified,
      strikerId,
      nonStrikerId,
      bowlerId,
    }),
    [outPlayerId, fielderId, runoutExtraRuns, runoutRunType, batterCrossed, simplified],
  );

  return {
    simplified,
    striker,
    nonStriker,
    outPlayerId,
    setOutPlayerId,
    fielderId,
    setFielderId,
    fielderOpen,
    setFielderOpen,
    runoutExtraRuns,
    setRunoutExtraRuns,
    runoutRunType,
    setRunoutRunType,
    batterCrossed,
    setBatterCrossed,
    canSubmit,
    buildPayload,
  };
}
