/** Preset delivery types for combined overthrow extras buttons. */
export const OVERTHROW_PRESET_WIDE = 'wide';
export const OVERTHROW_PRESET_NO_BALL = 'no_ball';

const PRESET_TITLE_SUFFIX = {
  [OVERTHROW_PRESET_WIDE]: ' (Wide)',
  [OVERTHROW_PRESET_NO_BALL]: ' (No Ball)',
};

/** Dialog title when delivery type is pre-selected from OT(W) / OT(NB) buttons. */
export function overthrowDialogTitle(initialDeliveryType) {
  if (!initialDeliveryType) return 'Overthrow';
  return `Overthrow${PRESET_TITLE_SUFFIX[initialDeliveryType] ?? ''}`;
}

/** All overthrow delivery types from GET /enums → overthrow_delivery_type. */
export function getOverthrowDeliveryOptions(enumOptions) {
  return Array.isArray(enumOptions) ? enumOptions : [];
}

/** Obstruct / retired delivery chips — backend sets valid_for_dismissal_delivery_context. */
export function getDismissalDeliveryOptions(enumOptions) {
  return getOverthrowDeliveryOptions(enumOptions).filter((option) => option.valid_for_dismissal_delivery_context === true);
}

/**
 * Map overthrow dialog selection to UI ball fields for {@link uiBallToStoreBallPayload}.
 *
 * @param {object} params
 * @param {string} params.deliveryType fair | wide | no_ball | bye | leg_bye
 * @param {number} params.runs 0–6 overthrow runs
 */
export function overthrowSelectionToUiFields({ deliveryType, runs }) {
  return {
    type: 'overthrow',
    overthrowDeliveryType: deliveryType,
    overthrowRuns: Math.max(0, Number(runs) || 0),
  };
}
