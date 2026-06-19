/**
 * @typedef {Object} ThemeTokens
 * @property {string} homeTextColor
 * @property {string} homeBgColor
 * @property {string} awayTextColor
 * @property {string} awayBgColor
 * @property {boolean} enableImages
 */

/**
 * @typedef {Object} GraphicSessionSnapshot
 * @property {string|null} commandKey
 * @property {number|string|null} commandId
 * @property {string|null} commandType
 * @property {string|null} displayMode
 * @property {Record<string, unknown>|null} payload
 * @property {string} themeSlug
 * @property {string} contextHash
 * @property {ThemeTokens} config
 * @property {Object} match  — includes officials.{umpires,scorers,commentators}: {text,lines}, playerOfMatchUserId, playerOfMatchName
 * @property {Object} tournament
 * @property {Object} live  — includes wagonWheelEnabled + wagonWheelBalls
 */

/**
 * @typedef {Object} GraphicRenderPlan
 * @property {string} commandKey
 * @property {string|null} commandType
 * @property {number|string|null} commandId
 * @property {string} contextHash
 * @property {string|null} displayMode
 * @property {string} themeSlug
 * @property {ThemeTokens} tokens
 * @property {Record<string, unknown>} componentProps
 */

/**
 * @typedef {Object} GraphicProcessorContext
 * @property {GraphicSessionSnapshot} snapshot
 */

/**
 * @callback GraphicProcessor
 * @param {GraphicSessionSnapshot} snapshot
 * @returns {Record<string, unknown>}
 */

export {};
