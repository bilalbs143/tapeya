/**
 * @param {Record<string, unknown>|null|undefined} config
 * @returns {import('../types.js').GraphicSessionSnapshot['config']}
 */
export function normalizeConfig(config) {
  const c = config && typeof config === 'object' ? config : {};

  return {
    homeBgColor: typeof c.homeBgColor === 'string' ? c.homeBgColor : '',
    awayBgColor: typeof c.awayBgColor === 'string' ? c.awayBgColor : '',
    homeTextColor: typeof c.homeTextColor === 'string' ? c.homeTextColor : '',
    awayTextColor: typeof c.awayTextColor === 'string' ? c.awayTextColor : '',
    textColor: typeof c.textColor === 'string' ? c.textColor : '',
    enableImages: Boolean(c.enableImages),
  };
}
