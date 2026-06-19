/**
 * @param {Record<string, unknown>|null|undefined} config
 * @returns {import('../../types.js').GraphicSessionSnapshot['config']}
 */
export function normalizeConfig(config) {
  const c = config && typeof config === 'object' ? config : {};

  return {
    homeTextColor: c.home_text_color ?? '',
    homeBgColor: c.home_bg_color ?? '',
    awayTextColor: c.away_text_color ?? '',
    awayBgColor: c.away_bg_color ?? '',
    enableImages: Boolean(c.enable_images),
  };
}
