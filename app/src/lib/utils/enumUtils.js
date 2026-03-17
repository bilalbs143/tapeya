/**
 * Helpers for normalising backend enum names to form/API values.
 */

/**
 * Converts a backend enum name (e.g. RIGHT_HAND) to the form/API value (e.g. right_hand).
 *
 * @param {string} [name]
 * @returns {string}
 */
export function enumNameToValue(name) {
  if (!name || typeof name !== 'string') return '';
  return name.toLowerCase();
}
