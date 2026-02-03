/**
 * Simple translation utility functions
 */

// Get nested translation value safely
export const getNestedTranslation = (translations, key, defaultValue = '') => {
  if (!translations || !key) return defaultValue;

  const keys = key.split('.');
  let value = translations;

  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) return defaultValue;
  }

  return value;
};

// Format translation with parameters
export const formatTranslation = (text, params = {}) => {
  if (typeof text !== 'string') return text;

  return text.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
    return params[paramKey] !== undefined ? params[paramKey] : match;
  });
};

// Check if translations are ready
export const areTranslationsReady = (translations) => {
  return (
    translations &&
    typeof translations === 'object' &&
    Object.keys(translations).length > 0
  );
};

/**
 * Translate validation error messages that contain a key + formatted amount.
 * Schemas return e.g. "minimum_withdrawal_amount 30,000 IDR" or "minimum_deposit_amount 25,000 IDR".
 * Translates the key part and keeps the amount suffix.
 * @param {string} message - Raw message from validation
 * @param {function} t - Translation function (e.g. useTranslations().t)
 * @returns {string} Translated message
 */
export const translateAmountValidationError = (message, t) => {
  if (!message || !t || typeof t !== 'function') return message;
  const prefixes = [
    { prefix: 'minimum_withdrawal_amount ', key: 'minimum_withdrawal_amount' },
    { prefix: 'minimum_deposit_amount ', key: 'minimum_deposit_amount' },
    { prefix: 'maximum_deposit_amount ', key: 'maximum_deposit_amount' },
  ];
  for (const { prefix, key } of prefixes) {
    if (message.startsWith(prefix)) {
      const amountPart = message.slice(prefix.length);
      return `${t(key)} ${amountPart}`;
    }
  }
  return t(message) || message;
};
