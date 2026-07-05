/**
 * Generates :root CSS custom properties from graphics theme config.js files.
 *
 * Output is formatted with Prettier so `npm run format` does not rewrite _tokens.css.
 *
 * Usage:
 *   node scripts/generate-theme-tokens.mjs              # all registered themes
 *   node scripts/generate-theme-tokens.mjs --theme theme1
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import prettier from 'prettier';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const themesRoot = resolve(root, 'src/graphics/themes');
const themesRegistryPath = resolve(root, '../shared/graphics-themes.json');

const themeArg = process.argv.find((arg) => arg.startsWith('--theme='));
const themeFlagIndex = process.argv.indexOf('--theme');
const themeSlug =
  themeArg?.slice('--theme='.length) ?? (themeFlagIndex >= 0 ? process.argv[themeFlagIndex + 1] : null);

/**
 * @returns {string[]}
 */
function discoverThemeFolders() {
  if (existsSync(themesRegistryPath)) {
    const registry = JSON.parse(readFileSync(themesRegistryPath, 'utf8'));
    const folders = (registry.themes ?? [])
      .map((theme) => theme.folder ?? theme.slug)
      .filter((folder) => typeof folder === 'string' && folder.length > 0);

    if (folders.length > 0) {
      return [...new Set(folders)];
    }
  }

  if (!existsSync(themesRoot)) {
    return [];
  }

  return readdirSync(themesRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((folder) => existsSync(resolve(themesRoot, folder, 'config.js')));
}

/**
 * @param {string} themeFolder
 */
async function generateTokensForTheme(themeFolder) {
  const configPath = resolve(themesRoot, `${themeFolder}/config.js`);
  const outPath = resolve(themesRoot, `${themeFolder}/styles/_tokens.css`);

  if (!existsSync(configPath)) {
    console.warn(`Skipping ${themeFolder}: missing ${configPath}`);
    return false;
  }

  const { ROOT_CSS_VARS } = await import(configPath);
  if (!ROOT_CSS_VARS || typeof ROOT_CSS_VARS !== 'object') {
    console.warn(`Skipping ${themeFolder}: config.js does not export ROOT_CSS_VARS`);
    return false;
  }

  const lines = Object.entries(ROOT_CSS_VARS)
    .map(([name, value]) => `  ${name}: ${value};`)
    .join('\n');

  const css = `/* Auto-generated from src/graphics/themes/${themeFolder}/config.js — do not edit by hand */\n:root {\n${lines}\n}\n`;

  const prettierConfig = (await prettier.resolveConfig(outPath)) ?? {};
  const formatted = await prettier.format(css, { ...prettierConfig, parser: 'css', filepath: outPath });

  writeFileSync(outPath, formatted, 'utf8');
  process.stdout.write(`Wrote ${outPath}\n`);
  return true;
}

const themeFolders = themeSlug ? [themeSlug] : discoverThemeFolders();

if (themeFolders.length === 0) {
  console.error(
    themeSlug
      ? `Theme "${themeSlug}" was not found.`
      : 'No themes found. Add themes to shared/graphics-themes.json or create src/graphics/themes/<folder>/config.js.',
  );
  process.exit(1);
}

let generatedCount = 0;
for (const themeFolder of themeFolders) {
  if (await generateTokensForTheme(themeFolder)) {
    generatedCount += 1;
  }
}

if (generatedCount === 0) {
  console.error('No theme token files were generated.');
  process.exit(1);
}
