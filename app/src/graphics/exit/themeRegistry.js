import { lazy } from 'react';

import manifest from '../../../../shared/graphics-command-manifest.json';
import themesConfig from '../../../../shared/graphics-themes.json';
import { FullScreenShell } from './shells/FullScreenShell';
import { LowerThirdShell } from './shells/LowerThirdShell';
import { PassthroughShell } from './shells/PassthroughShell';

/**
 * @typedef {Object} ThemeMeta
 * @property {string} slug
 * @property {string} folder
 * @property {string} [label]
 * @property {import('react').ComponentType<{ children: import('react').ReactNode }>} ThemeRoot
 * @property {string[]} [styleImports]
 * @property {string} [googleFontsUrl]
 * @property {string[]} [googleFontFamilies]
 */

/** @type {Record<string, { themeMeta: ThemeMeta }>} */
const themeMetaModules = import.meta.glob('../themes/*/themeMeta.js', { eager: true });

/** @type {Record<string, () => Promise<unknown>>} */
const themeStyleLoaders = import.meta.glob(['../themes/*/styles/_tokens.css', '../themes/*/styles/*.scss']);

/** @type {Set<string>} */
const loadedThemeStyleFolders = new Set();

/** @type {Set<string>} */
const loadedThemeFontFolders = new Set();

/** @type {Map<string, Promise<void>>} */
const pendingStylesheetInjects = new Map();

/**
 * Injects a <link rel="stylesheet"> by id and resolves when the stylesheet is
 * parsed (onload). Re-entrant: returns the in-flight promise or resolves if already injected.
 *
 * @param {string} id   — unique id attribute for the <link> element
 * @param {string} href — stylesheet URL
 * @returns {Promise<void>}
 */
function injectStylesheetOnce(id, href) {
  if (typeof document === 'undefined') {
    return Promise.resolve();
  }

  if (document.getElementById(id)) {
    return Promise.resolve();
  }

  const inFlight = pendingStylesheetInjects.get(id);
  if (inFlight) {
    return inFlight;
  }

  /** @type {Promise<void>} */
  const promise = new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = href;
    link.onload = () => {
      pendingStylesheetInjects.delete(id);
      resolve();
    };
    link.onerror = () => {
      pendingStylesheetInjects.delete(id);
      reject(new Error(`Failed to load stylesheet: ${href}`));
    };
    document.head.appendChild(link);
  });

  pendingStylesheetInjects.set(id, promise);
  return promise;
}

/**
 * After the Google Fonts stylesheet is parsed, explicitly load each family.
 * `document.fonts.ready` may already be settled from app fonts — load() waits for theme faces.
 *
 * @param {string[]|undefined} families
 * @returns {Promise<void>}
 */
async function waitForThemeFonts(families) {
  if (typeof document === 'undefined' || !document.fonts) {
    return;
  }

  if (!families?.length) {
    await document.fonts.ready;
    return;
  }

  await Promise.all(
    families.map((family) =>
      document.fonts.load(`1em "${family}"`).catch(() => {
        if (import.meta.env.DEV) {
          console.warn(`[themeRegistry] Font failed to load: ${family}`);
        }
      }),
    ),
  );
}

/**
 * Build slug → folder and slug → meta from shared/graphics-themes.json.
 * Command component loading uses a separate import.meta.glob (already dynamic).
 */
function buildThemeRegistry() {
  /** @type {Record<string, string>} */
  const slugToFolder = {};
  /** @type {Record<string, ThemeMeta>} */
  const metaBySlug = {};

  for (const theme of themesConfig.themes) {
    const folder = theme.folder ?? theme.slug;
    slugToFolder[theme.slug] = folder;

    const modulePath = `../themes/${folder}/themeMeta.js`;
    const mod = themeMetaModules[modulePath];
    if (!mod?.themeMeta) {
      if (import.meta.env.DEV) {
        console.warn(`[themeRegistry] Missing themeMeta at ${modulePath} for slug "${theme.slug}"`);
      }
      continue;
    }

    metaBySlug[theme.slug] = mod.themeMeta;
    metaBySlug[folder] = mod.themeMeta;
  }

  return { slugToFolder, metaBySlug };
}

const registry = buildThemeRegistry();

/** @type {Record<string, string>} */
const THEME_SLUG_TO_FOLDER = registry.slugToFolder;

/** @type {Record<string, ThemeMeta>} */
const THEME_META = registry.metaBySlug;

/** @type {Map<string, string>} */
const MANIFEST_KEY_TO_TYPE = new Map(manifest.commands.map((command) => [command.key, command.type]));

const themeCommandModules = import.meta.glob('../themes/*/commands/*/*.jsx');

const componentCache = new Map();

/**
 * @param {string|null|undefined} themeSlug
 * @returns {string|null}
 */
function resolveThemeFolder(themeSlug) {
  if (!themeSlug) return null;
  return THEME_SLUG_TO_FOLDER[themeSlug] ?? null;
}

/**
 * @param {string} themeFolder
 * @param {string} commandType
 * @param {string} commandKey
 */
function modulePathFor(themeFolder, commandType, commandKey) {
  return `../themes/${themeFolder}/commands/${commandType}/${commandKey}.jsx`;
}

/**
 * @param {string|null|undefined} commandKey
 * @param {string|null|undefined} commandType
 */
function resolveCommandType(commandKey, commandType) {
  if (commandType) return commandType;
  if (!commandKey) return null;
  return MANIFEST_KEY_TO_TYPE.get(commandKey) ?? null;
}

/**
 * @param {string|null|undefined} displayMode
 * @returns {import('react').ComponentType<{ children: import('react').ReactNode, tokens?: import('../types.js').ThemeTokens }>}
 */
export function resolveDisplayModeShell(displayMode) {
  if (displayMode === 'FS') return FullScreenShell;
  if (displayMode === 'LT') return LowerThirdShell;
  return PassthroughShell;
}

/**
 * Returns a lazy React component for themes/<slug>/commands/<commandType>/<commandKey>.jsx, or null.
 *
 * @param {string|null|undefined} themeSlug
 * @param {string|null|undefined} commandType
 * @param {string|null|undefined} commandKey
 * @returns {import('react').LazyExoticComponent<import('react').ComponentType<any>>|null}
 */
export function getThemeCommandComponent(themeSlug, commandType, commandKey) {
  if (!commandKey) return null;

  const resolvedType = resolveCommandType(commandKey, commandType);
  if (!resolvedType) return null;

  const themeFolder = resolveThemeFolder(themeSlug);
  if (!themeFolder) return null;

  const modulePath = modulePathFor(themeFolder, resolvedType, commandKey);
  const loader = themeCommandModules[modulePath];

  if (!loader) return null;

  const cacheKey = `${themeFolder}/${resolvedType}/${commandKey}`;
  if (!componentCache.has(cacheKey)) {
    const typedLoader = /** @type {() => Promise<{ default: import('react').ComponentType<any> }>} */ (loader);
    componentCache.set(cacheKey, lazy(typedLoader));
  }

  return componentCache.get(cacheKey);
}

/**
 * Loads CSS/SCSS for the active theme folder only (lazy, once per folder).
 *
 * @param {string|null|undefined} themeSlug
 * @returns {Promise<void>}
 */
export function ensureThemeStylesLoaded(themeSlug) {
  const folder = resolveThemeFolder(themeSlug);
  if (!folder || loadedThemeStyleFolders.has(folder)) {
    return Promise.resolve();
  }

  const prefix = `../themes/${folder}/styles/`;
  const loaders = Object.entries(themeStyleLoaders)
    .filter(([path]) => path.startsWith(prefix))
    .map(([, loader]) => loader());

  loadedThemeStyleFolders.add(folder);

  if (loaders.length === 0) {
    return Promise.resolve();
  }

  return Promise.all(loaders).then(() => undefined);
}

/**
 * Loads Google Fonts for the active theme (lazy, once per folder).
 * Awaits stylesheet onload, then `document.fonts.load()` per family so OBS
 * captures the first frame with the correct typeface.
 *
 * @param {string|null|undefined} themeSlug
 * @returns {Promise<void>}
 */
export async function ensureThemeFontsLoaded(themeSlug) {
  const folder = resolveThemeFolder(themeSlug);
  if (!folder || loadedThemeFontFolders.has(folder)) return;

  const meta = THEME_META[themeSlug ?? ''] ?? THEME_META[folder];
  const url = meta?.googleFontsUrl;
  if (!url) {
    loadedThemeFontFolders.add(folder);
    return;
  }

  await injectStylesheetOnce(`theme-fonts:${folder}`, url);
  await waitForThemeFonts(meta?.googleFontFamilies);

  loadedThemeFontFolders.add(folder);
}

/**
 * Loads both CSS/SCSS styles and Google Fonts for the active theme in parallel.
 * Use this instead of ensureThemeStylesLoaded in the overlay gate.
 *
 * @param {string|null|undefined} themeSlug
 * @returns {Promise<void>}
 */
export function ensureThemeAssetsLoaded(themeSlug) {
  return Promise.all([ensureThemeStylesLoaded(themeSlug), ensureThemeFontsLoaded(themeSlug)]).then(() => undefined);
}

/**
 * @param {string|null|undefined} themeSlug
 */
export function getThemeMeta(themeSlug) {
  if (!themeSlug) return null;

  const folder = resolveThemeFolder(themeSlug);
  if (!folder) return null;

  return THEME_META[themeSlug] ?? THEME_META[folder] ?? null;
}

/**
 * @param {string} themeSlug
 * @returns {string[]}
 */
export function listThemeCommandKeys(themeSlug) {
  const themeFolder = resolveThemeFolder(themeSlug);
  if (!themeFolder) return [];

  const prefix = `../themes/${themeFolder}/commands/`;

  return Object.keys(themeCommandModules)
    .filter((path) => path.startsWith(prefix) && path.endsWith('.jsx'))
    .map((path) => {
      const relative = path.slice(prefix.length);
      const segments = relative.split('/');
      if (segments.length !== 2) return null;
      return segments[1].replace(/\.jsx$/, '');
    })
    .filter(/** @returns {key is string} */ (key) => key !== null);
}
