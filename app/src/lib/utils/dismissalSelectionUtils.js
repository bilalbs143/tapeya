/**
 * @param {object} params
 * @param {number} params.outPlayerId
 * @param {boolean} [params.dontCountBall]
 * @param {string} [params.dismissalDeliveryType]
 * @param {number} params.strikerId
 * @param {number} params.nonStrikerId
 * @param {number} params.bowlerId
 */
export function retiredHurtSelectionToUiFields({
  outPlayerId,
  dontCountBall = true,
  dismissalDeliveryType = 'fair',
  strikerId,
  nonStrikerId,
  bowlerId,
}) {
  return {
    type: 'retired_hurt',
    dismissalType: 'retired_hurt',
    outPlayerId,
    dontCountBall,
    dismissalDeliveryType,
    strikerId,
    nonStrikerId,
    bowlerId,
    striker: { id: outPlayerId },
  };
}

/**
 * @param {object} params
 * @param {number} params.outPlayerId
 * @param {boolean} [params.dontCountBall]
 * @param {string} [params.dismissalDeliveryType]
 * @param {number} params.strikerId
 * @param {number} params.nonStrikerId
 * @param {number} params.bowlerId
 */
export function retiredOutSelectionToUiFields({
  outPlayerId,
  dontCountBall = true,
  dismissalDeliveryType = 'fair',
  strikerId,
  nonStrikerId,
  bowlerId,
}) {
  return {
    type: 'out',
    dismissalType: 'retired',
    outPlayerId,
    dontCountBall,
    dismissalDeliveryType,
    strikerId,
    nonStrikerId,
    bowlerId,
    striker: { id: outPlayerId },
  };
}

/**
 * @param {object} params
 * @param {number} params.outPlayerId
 * @param {number|null} [params.fielderId]
 * @param {boolean} [params.dontCountBall]
 * @param {string} [params.dismissalDeliveryType]
 * @param {boolean} [params.isWide]
 * @param {boolean} [params.isNoBall]
 * @param {number} params.strikerId
 * @param {number} params.nonStrikerId
 * @param {number} params.bowlerId
 */
export function obstructSelectionToUiFields({
  outPlayerId,
  fielderId = null,
  dontCountBall = true,
  dismissalDeliveryType = 'fair',
  isWide = false,
  isNoBall = false,
  strikerId,
  nonStrikerId,
  bowlerId,
} = {}) {
  if (outPlayerId == null || strikerId == null || nonStrikerId == null || bowlerId == null) {
    return null;
  }
  return {
    type: 'out',
    dismissalType: 'obstructing_the_field',
    outPlayerId,
    fielderId: fielderId ?? null,
    dontCountBall,
    dismissalDeliveryType,
    isWide,
    isNoBall,
    strikerId,
    nonStrikerId,
    bowlerId,
    striker: { id: outPlayerId },
  };
}

/**
 * @param {object} params
 * @param {number} params.outPlayerId
 * @param {number} params.fielderId
 * @param {number} params.strikerId
 * @param {number} params.nonStrikerId
 * @param {number} params.bowlerId
 * @param {boolean} [params.isWide]
 * @param {boolean} [params.isNoBall]
 */
export function caughtOutSelectionToUiFields({
  outPlayerId,
  fielderId,
  strikerId,
  nonStrikerId,
  bowlerId,
  isWide = false,
  isNoBall = false,
} = {}) {
  if (outPlayerId == null || strikerId == null || nonStrikerId == null || bowlerId == null) {
    return null;
  }
  return {
    type: 'out',
    dismissalType: 'caught',
    outPlayerId,
    fielderId,
    isWide,
    isNoBall,
    strikerId,
    nonStrikerId,
    bowlerId,
    striker: { id: outPlayerId },
  };
}

/**
 * @param {object} params
 * @param {number} params.outPlayerId Non-striker for a standard mankad
 * @param {number} params.bowlerId Credited as bowler and fielder
 * @param {number} params.strikerId
 * @param {number} params.nonStrikerId
 */
export function mankadSelectionToUiFields({ outPlayerId, bowlerId, strikerId, nonStrikerId }) {
  return {
    type: 'out',
    dismissalType: 'mankad',
    outPlayerId,
    fielderId: bowlerId,
    strikerId,
    nonStrikerId,
    bowlerId,
    striker: { id: outPlayerId },
  };
}

/**
 * @param {object} params
 * @param {number} params.outPlayerId
 * @param {boolean} [params.dontCountBall]
 * @param {number} params.strikerId
 * @param {number} params.nonStrikerId
 * @param {number} params.bowlerId
 */
export function timedOutSelectionToUiFields({ outPlayerId, dontCountBall = true, strikerId, nonStrikerId, bowlerId }) {
  return {
    type: 'out',
    dismissalType: 'timed_out',
    outPlayerId,
    dontCountBall,
    dismissalDeliveryType: 'fair',
    strikerId,
    nonStrikerId,
    bowlerId,
    striker: { id: outPlayerId },
  };
}
