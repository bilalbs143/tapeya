/**
 * @param {object} params
 * @param {number} params.outPlayerId
 * @param {number} params.fielderId
 * @param {number} [params.runoutExtraRuns]
 * @param {string} [params.runoutRunType]
 * @param {boolean|null} [params.batterCrossed]
 * @param {boolean} [params.isNoBall]
 * @param {boolean} [params.isWide]
 * @param {number} params.strikerId
 * @param {number} params.nonStrikerId
 * @param {number} params.bowlerId
 */
export function runOutSelectionToUiFields({
  outPlayerId,
  fielderId,
  runoutExtraRuns = 0,
  runoutRunType = 'from_bat',
  batterCrossed = true,
  isNoBall = false,
  isWide = false,
  strikerId,
  nonStrikerId,
  bowlerId,
}) {
  return {
    type: 'out',
    dismissalType: 'run_out',
    outPlayerId,
    fielderId,
    runoutExtraRuns,
    runoutRunType,
    batterCrossed: isNoBall ? null : batterCrossed,
    isNoBall,
    isWide,
    strikerId,
    nonStrikerId,
    bowlerId,
    striker: { id: strikerId },
  };
}
