/** Overlay URL + theme config helpers for the organizer broadcast-graphics dialog. */

const SOON_MS = 15 * 60 * 1000;
const COLOR_RE = /^#[0-9a-fA-F]{6}$/;

/**
 * @param {string|null|undefined} iso
 * @param {number} [now]
 * @param {number} [withinMs]
 */
export function overlayExpiresSoon(iso, now = Date.now(), withinMs = SOON_MS) {
  if (!iso) return false;
  const t = new Date(iso).getTime();
  return Number.isFinite(t) && t - now <= withinMs;
}

/**
 * @param {string|null|undefined} iso
 * @returns {string|null}
 */
export function formatOverlayExpiry(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString();
}

/**
 * @param {string} text
 * @returns {Promise<boolean>}
 */
export async function copyText(text) {
  if (!text) return false;
  if (!navigator?.clipboard?.writeText) return false;
  await navigator.clipboard.writeText(text);
  return true;
}

/**
 * @param {{ config_schema?: { properties?: Array<{ key: string, label: string, type: string, default?: unknown }> } }|null|undefined} theme
 * @returns {Array<{ key: string, label: string, type: string, default?: unknown }>}
 */
export function themeSchemaProperties(theme) {
  const props = theme?.config_schema?.properties;
  return Array.isArray(props) ? props.filter((p) => p?.key && (p.type === 'color' || p.type === 'boolean')) : [];
}

/**
 * Same as admin: swap "home" / "away" in labels for real team names.
 *
 * @param {{ label?: string }|null|undefined} prop
 * @param {string} [homeName]
 * @param {string} [awayName]
 */
export function themePropertyLabel(prop, homeName = 'Home', awayName = 'Away') {
  const label = typeof prop?.label === 'string' ? prop.label : '';
  return label.replace(/\bhome\b/gi, homeName || 'Home').replace(/\baway\b/gi, awayName || 'Away');
}

/**
 * Build config for a theme. Priority: draft → session → theme defaults → schema defaults.
 *
 * @param {object|null|undefined} theme
 * @param {Record<string, unknown>|null|undefined} [sessionConfig]
 * @param {Record<string, unknown>|null|undefined} [draftConfig]
 * @returns {Record<string, unknown>}
 */
export function buildThemeConfig(theme, sessionConfig = null, draftConfig = null) {
  const defaults = theme?.default_config && typeof theme.default_config === 'object' ? theme.default_config : {};
  const session = sessionConfig && typeof sessionConfig === 'object' ? sessionConfig : {};
  const draft = draftConfig && typeof draftConfig === 'object' ? draftConfig : {};
  const out = {};

  for (const prop of themeSchemaProperties(theme)) {
    const key = prop.key;
    if (Object.prototype.hasOwnProperty.call(draft, key)) {
      out[key] = draft[key];
    } else if (Object.prototype.hasOwnProperty.call(session, key)) {
      out[key] = session[key];
    } else if (Object.prototype.hasOwnProperty.call(defaults, key)) {
      out[key] = defaults[key];
    } else if (Object.prototype.hasOwnProperty.call(prop, 'default')) {
      out[key] = prop.default;
    } else if (prop.type === 'boolean') {
      out[key] = false;
    } else if (prop.type === 'color') {
      out[key] = '#000000';
    }
  }

  return out;
}

/**
 * @param {object|null|undefined} theme
 * @param {Record<string, unknown>|null|undefined} config
 */
export function isValidThemeConfig(theme, config) {
  const values = config && typeof config === 'object' ? config : {};
  for (const prop of themeSchemaProperties(theme)) {
    const value = values[prop.key];
    if (prop.type === 'color') {
      if (typeof value !== 'string' || !COLOR_RE.test(value)) return false;
    } else if (prop.type === 'boolean') {
      if (typeof value !== 'boolean') return false;
    }
  }
  return true;
}

/**
 * @param {Record<string, unknown>|null|undefined} a
 * @param {Record<string, unknown>|null|undefined} b
 * @param {Array<{ key: string }>} properties
 */
export function themeConfigsEqual(a, b, properties) {
  const left = a && typeof a === 'object' ? a : {};
  const right = b && typeof b === 'object' ? b : {};
  for (const prop of properties) {
    if (left[prop.key] !== right[prop.key]) return false;
  }
  return true;
}
