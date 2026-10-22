/** Overlay URL + theme config helpers — app broadcastGraphics contract. */

const SOON_MS = 15 * 60 * 1000;
const COLOR_RE = /^#[0-9a-fA-F]{6}$/;

/** OBS overlay hex defaults (wire strings, not app UI tokens). */

export const GRAPHIC_COLOR_FALLBACK = '#000000';
export const GRAPHIC_ACCENT_FALLBACK = '#2AA449';

export type ThemeSchemaProperty = {
  key: string;
  label: string;
  type: 'color' | 'boolean' | string;
  default?: unknown;
};

export type GraphicTheme = {
  id: number;
  slug: string;
  name: string;
  configSchema: { properties?: ThemeSchemaProperty[] } | null;
  defaultConfig: Record<string, unknown> | null;
  isActive: boolean;
};

export type GraphicSession = {
  id: number;
  matchId: number;
  graphicThemeId: number;
  config: Record<string, unknown> | null;
  signedOverlayUrl: string | null;
  signedOverlayExpiresAt: string | null;
};

export function overlayExpiresSoon(iso: string | null | undefined, now = Date.now(), withinMs = SOON_MS): boolean {
  if (!iso) return false;
  const t = new Date(iso).getTime();
  return Number.isFinite(t) && t - now <= withinMs;
}

export function formatOverlayExpiry(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString();
}

export async function copyText(text: string): Promise<boolean> {
  if (!text) return false;
  if (!navigator?.clipboard?.writeText) return false;
  await navigator.clipboard.writeText(text);
  return true;
}

export function themeSchemaProperties(theme: GraphicTheme | null | undefined): ThemeSchemaProperty[] {
  const props = theme?.configSchema?.properties;
  return Array.isArray(props) ? props.filter((p) => p?.key && (p.type === 'color' || p.type === 'boolean')) : [];
}

export function themePropertyLabel(
  prop: ThemeSchemaProperty | null | undefined,
  homeName = 'Home',
  awayName = 'Away'
): string {
  const label = typeof prop?.label === 'string' ? prop.label : '';
  return label.replace(/\bhome\b/gi, homeName || 'Home').replace(/\baway\b/gi, awayName || 'Away');
}

export function buildThemeConfig(
  theme: GraphicTheme | null | undefined,
  sessionConfig: Record<string, unknown> | null = null,
  draftConfig: Record<string, unknown> | null = null
): Record<string, unknown> {
  const defaults = theme?.defaultConfig && typeof theme.defaultConfig === 'object' ? theme.defaultConfig : {};
  const session = sessionConfig && typeof sessionConfig === 'object' ? sessionConfig : {};
  const draft = draftConfig && typeof draftConfig === 'object' ? draftConfig : {};
  const out: Record<string, unknown> = {};

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
      out[key] = GRAPHIC_COLOR_FALLBACK;
    }
  }

  return out;
}

export function isValidThemeConfig(
  theme: GraphicTheme | null | undefined,
  config: Record<string, unknown> | null | undefined
): boolean {
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

export function themeConfigsEqual(
  a: Record<string, unknown> | null | undefined,
  b: Record<string, unknown> | null | undefined,
  properties: Array<{ key: string }>
): boolean {
  const left = a && typeof a === 'object' ? a : {};
  const right = b && typeof b === 'object' ? b : {};
  for (const prop of properties) {
    if (left[prop.key] !== right[prop.key]) return false;
  }
  return true;
}

export function themeAccentColor(theme: GraphicTheme): string {
  const colors = themeSchemaProperties(theme).filter((p) => p.type === 'color');
  const key = colors[0]?.key;
  const fromDefault = key && typeof theme.defaultConfig?.[key] === 'string' ? String(theme.defaultConfig[key]) : null;
  if (fromDefault && COLOR_RE.test(fromDefault)) return fromDefault;
  return GRAPHIC_ACCENT_FALLBACK;
}

/** Truncate signed key mid-string for display (full URL still copied). */

export function displayOverlayUrl(url: string): string {
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`);
    const k = u.searchParams.get('k') || u.pathname.split('/').pop() || '';
    if (k.length > 8) {
      const short = `${k.slice(0, 4)}…${k.slice(-4)}`;
      if (u.searchParams.has('k')) u.searchParams.set('k', short);
      else return `${u.host}${u.pathname.replace(k, short)}`;
    }
    return `${u.host}${u.pathname}${u.search}`;
  } catch {
    return String(url).replace(/^https?:\/\//, '');
  }
}
