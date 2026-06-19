/**
 * Generates :root CSS custom properties from a graphics theme config.js.
 *
 * Output is formatted with Prettier so `npm run format` does not rewrite _tokens.css.
 *
 * Usage:
 *   node scripts/generate-theme-tokens.mjs --theme theme1
 */
import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import prettier from 'prettier';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const themeArg = process.argv.find((arg) => arg.startsWith('--theme='));
const themeFlagIndex = process.argv.indexOf('--theme');
const themeSlug = themeArg?.slice('--theme='.length) ?? (themeFlagIndex >= 0 ? process.argv[themeFlagIndex + 1] : null);

if (!themeSlug) {
  console.error('Usage: node scripts/generate-theme-tokens.mjs --theme <slug>');
  process.exit(1);
}

const configPath = resolve(root, `src/graphics/themes/${themeSlug}/config.js`);
const outPath = resolve(root, `src/graphics/themes/${themeSlug}/styles/_tokens.css`);

const { ROOT_CSS_VARS } = await import(configPath);

const lines = Object.entries(ROOT_CSS_VARS)
  .map(([name, value]) => `  ${name}: ${value};`)
  .join('\n');

const css = `/* Auto-generated from src/graphics/themes/${themeSlug}/config.js — do not edit by hand */\n:root {\n${lines}\n}\n`;

const prettierConfig = (await prettier.resolveConfig(outPath)) ?? {};
const formatted = await prettier.format(css, { ...prettierConfig, parser: 'css', filepath: outPath });

writeFileSync(outPath, formatted, 'utf8');
process.stdout.write(`Wrote ${outPath}\n`);
