import { coalesceTrim } from '../../core/utils';
import { GRAPHIC_KEYS as K } from '../graphicCommandKeys';

/** @type {Record<string, string>} */
const OFFICIALS_CONTEXT_KEY = {
  [K.UMPIRES]: 'umpires',
  [K.SCORERS]: 'scorers',
  [K.COMMENTATORS]: 'commentators',
};

/** @type {import('../../types.js').GraphicProcessor} */
export function processCustom(snapshot) {
  const p = snapshot.payload ?? {};
  return {
    title: coalesceTrim(p.title) || '',
    description: coalesceTrim(p.description) || '',
  };
}

/** @type {import('../../types.js').GraphicProcessor} */
export function processPlatformBanner(snapshot) {
  const p = snapshot.payload ?? {};
  const headline = coalesceTrim(p.headline, p.title, p.message) || null;
  const url = coalesceTrim(p.url, p.link, p.body) || null;
  const logoUrl = coalesceTrim(p.logo_url, p.logoUrl) || null;
  const text = coalesceTrim(p.text) || null;

  return { commandKey: snapshot.commandKey, headline, url, logoUrl, text };
}

/**
 * Returns names for UMPIRES / SCORERS / COMMENTATORS commands.
 * Names come from context.match.officials (normalized in normalizeSession).
 * Payload override takes precedence so operators can customise on the fly.
 *
 * @type {import('../../types.js').GraphicProcessor}
 */
export function processOfficialsBanner(snapshot) {
  const p = snapshot.payload ?? {};
  const contextKey = OFFICIALS_CONTEXT_KEY[snapshot.commandKey ?? ''];

  const payloadText = coalesceTrim(p.text, p.message, p.headline, p.title, p.body);
  if (payloadText) {
    return {
      commandKey: snapshot.commandKey,
      heading: coalesceTrim(p.heading) || null,
      text: payloadText,
      names: payloadText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
    };
  }

  const official = contextKey ? (snapshot.match.officials?.[contextKey] ?? null) : null;

  return {
    commandKey: snapshot.commandKey,
    heading: coalesceTrim(p.heading) || null,
    text: official?.text ?? '',
    names: official?.lines ?? [],
  };
}
