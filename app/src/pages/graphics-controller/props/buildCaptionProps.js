import { coalesceTrim } from './graphicPropsHelpers';

const PLATFORM_BANNER_TEXT = {
  FOLLOW_PLATFORM: 'Follow us on Tapeya for live match updates',
  DOWNLOAD_PLATFORM: 'For live streaming & ball-by-ball updates — download the Tapeya app',
};

/**
 * @param {string|null} commandKey
 * @param {Record<string, unknown>} ctx
 * @param {Record<string, unknown>} p
 * @returns {Record<string, unknown>|undefined}
 */
export function buildCaptionProps(commandKey, _ctx, p) {
  switch (commandKey) {
    case 'CUSTOM': {
      const parts = [p.title, p.description].filter((v) => v != null && String(v).trim() !== '');
      return { text: parts.join('\n\n'), fontSize: p.font_size };
    }

    case 'FOLLOW_PLATFORM':
    case 'DOWNLOAD_PLATFORM': {
      const text = coalesceTrim(p.text, p.message, p.headline, p.title, p.body) || PLATFORM_BANNER_TEXT[commandKey] || 'Tapeya';
      return { text };
    }

    default:
      return undefined;
  }
}
