/**
 * String utility functions
 * Common functions for manipulating and formatting strings
 */

/**
 * Capitalize the first letter of a string
 * @param {string} str - The string to capitalize
 * @returns {string} String with first letter capitalized
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Formats a string by removing underscores and capitalizing each word
 * @param {string} str - The input string (e.g., "pragmatic_slot", "evolution_gaming")
 * @returns {string} - Formatted string (e.g., "Pragmatic Slot", "Evolution Gaming")
 */
export function formatProviderName(str) {
  if (!str || typeof str !== 'string') return '';

  // Specific provider name mappings
  const providerMappings = {
    cq9: 'CQ9',
    thebighit: 'The Big Hit',
    playngo: 'Play N Go',
    evolution: 'Evolution Gaming',
    pragmatic_slot: 'Pragmatic Play',
    redtiger: 'Red Tiger',
    tomhorn_slot: 'Tom Horn Gaming',
    netent: 'NetEnt',
    microgaming: 'Microgaming',
    playtech: 'Playtech',
    betsoft: 'Betsoft',
    isoftbet: 'ISoftBet',
    quickspin: 'Quickspin',
    yggdrasil: 'Yggdrasil',
    thunderkick: 'Thunderkick',
    booongo: 'Booongo',
    egt: 'EGT Interactive',
    amatic: 'Amatic',
    novomatic: 'Novomatic',
    wazdan: 'Wazdan',
    gpk7mj: '7Mojos',
    '7mojos': '7Mojos',
  };

  // Check if we have a specific mapping
  if (providerMappings[str.toLowerCase()]) {
    return providerMappings[str.toLowerCase()];
  }

  // Default formatting for unmapped providers
  return str
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Capitalizes the first letter of each word in a string
 * @param {string} str - The input string
 * @returns {string} - String with first letter of each word capitalized
 */
export function capitalizeWords(str) {
  if (!str || typeof str !== 'string') return '';

  return str
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Convert string to title case (first letter of each word capitalized)
 * @param {string} str - The string to convert
 * @returns {string} String in title case
 */
export const toTitleCase = (str) => {
  if (!str) return '';

  const smallWords = [
    'a',
    'an',
    'and',
    'as',
    'at',
    'but',
    'by',
    'for',
    'if',
    'in',
    'nor',
    'of',
    'on',
    'or',
    'so',
    'the',
    'to',
    'up',
    'yet',
  ];

  return str
    .split(' ')
    .map((word, index) => {
      if (index === 0 || !smallWords.includes(word.toLowerCase())) {
        return capitalize(word);
      }
      return word.toLowerCase();
    })
    .join(' ');
};

/**
 * Truncate a string to a specified length
 * @param {string} str - The string to truncate
 * @param {number} length - Maximum length
 * @param {string} suffix - Suffix to add (default: '...')
 * @returns {string} Truncated string
 */
export const truncate = (str, length, suffix = '...') => {
  if (!str || str.length <= length) return str;
  return str.substring(0, length) + suffix;
};

/**
 * Remove HTML tags from a string
 * @param {string} str - The string to clean
 * @returns {string} String without HTML tags
 */
export const stripHtml = (str) => {
  if (!str) return '';
  return str.replace(/<[^>]*>/g, '');
};

/**
 * Generate a random string of specified length
 * @param {number} length - Length of the random string
 * @param {string} charset - Characters to use (default: alphanumeric)
 * @returns {string} Random string
 */
export const generateRandomString = (
  length = 8,
  charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
) => {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
};

/**
 * Convert a string to slug (URL-friendly)
 * @param {string} str - The string to convert
 * @returns {string} Slug string
 */
export const toSlug = (str) => {
  if (!str) return '';

  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

/**
 * Check if a string contains only numbers
 * @param {string} str - The string to check
 * @returns {boolean} True if string contains only numbers
 */
export const isNumeric = (str) => {
  if (!str) return false;
  return /^\d+$/.test(str);
};

/**
 * Check if a string is a valid UUID
 * @param {string} str - The string to check
 * @returns {boolean} True if string is a valid UUID
 */
export const isValidUuid = (str) => {
  if (!str) return false;

  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

/**
 * Convert a string to camelCase
 * @param {string} str - The string to convert
 * @returns {string} String in camelCase
 */
export const toCamelCase = (str) => {
  if (!str) return '';

  return str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (match, chr) => chr.toUpperCase());
};

/**
 * Convert a string to kebab-case
 * @param {string} str - The string to convert
 * @returns {string} String in kebab-case
 */
export const toKebabCase = (str) => {
  if (!str) return '';

  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
};

/**
 * Removes underscores and replaces them with spaces
 * @param {string} str - The input string
 * @returns {string} - String with underscores replaced by spaces
 */
export function removeUnderscores(str) {
  if (!str || typeof str !== 'string') return '';

  return str.replace(/_/g, ' ');
}

/**
 * Gets provider name from provider ID using allProvidersData
 * @param {number} providerId - The provider ID
 * @param {Array} allProvidersData - Array of provider data from Redux state
 * @returns {string} - Formatted provider name or empty string if not found
 */
export function getProviderNameById(providerId, allProvidersData) {
  if (!providerId || !allProvidersData || !Array.isArray(allProvidersData)) {
    return '';
  }

  const provider = allProvidersData.find((p) => p.id === providerId);
  if (!provider || !provider.name) {
    return '';
  }

  return formatProviderName(provider.name);
}
