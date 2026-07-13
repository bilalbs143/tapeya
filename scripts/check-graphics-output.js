#!/usr/bin/env node

/**
 * Fail when the graphics build output contains CSS/JS forbidden on vMix 24 (Chrome 86).
 * Scans dist-graphics/ (.css, .js, .html) for Chrome-86-unsafe properties and Tailwind
 * utilities that compile to them (color-mix, dvh/svh/lvh, backdrop-filter, mix-blend-mode,
 * bg-clip-text, aspect-ratio, text-balance, field-sizing, @starting-style, @container,
 * inset shorthand, padding-inline/block, margin-inline/block (CSS + React camelCase),
 * Tailwind inset-* (not inset-x/y), oklch/oklab, dvw/svw/lvw, :has()/:is()/:where(),
 * @property, overflow: clip, text-underline-offset, subgrid).
 * Run after: cd app && npm run build:graphics
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.resolve(__dirname, '../app/dist-graphics');

const FORBIDDEN_PATTERNS = [
  // Chrome 111+ / vMix 24 unsafe
  { name: 'color-mix()', regex: /color-mix\s*\(/i },
  { name: '100dvh', regex: /100dvh\b/ },
  { name: 'dvh unit', regex: /\bdvh\b/ },
  // Same CSS Values & Units L4 cohort as dvh (Chrome 108) — same risk
  { name: 'svh unit', regex: /\bsvh\b/ },
  { name: 'lvh unit', regex: /\blvh\b/ },
  // backdrop-filter / backdrop-blur-* — unreliable on embedded Chromium / GPU paths
  { name: 'backdrop-filter', regex: /-webkit-backdrop-filter\s*:|(?<![-\w])backdrop-filter\s*:/i },
  // mix-blend-* utilities
  { name: 'mix-blend-mode', regex: /mix-blend-mode\s*:/i },
  // bg-clip-text (needs -webkit-background-clip; flaky on older OBS/vMix stacks)
  {
    name: 'background-clip:text',
    regex: /-webkit-background-clip\s*:\s*text\b|(?<![-\w])background-clip\s*:\s*text\b/i,
  },
  // aspect-ratio — Chrome 88+
  { name: 'aspect-ratio', regex: /(?<![-\w])aspect-ratio\s*:/i },
  // text-balance — text-wrap: balance (Chrome 114+)
  { name: 'text-wrap: balance', regex: /text-wrap\s*:\s*balance\b/i },
  // field-sizing — Chrome 123+
  { name: 'field-sizing', regex: /(?<![-\w])field-sizing\s*:/i },
  // @starting-style — Chrome 117+
  { name: '@starting-style', regex: /@starting-style\b/i },
  // inset shorthand — Chrome 87+ (CSS longhand; box-shadow `inset` is excluded by lookbehind)
  { name: 'inset (shorthand)', regex: /(?<![-\w])inset\s*:/i },
  { name: 'inset-inline', regex: /(?<![-\w])inset-inline(?:-start|-end)?\s*:/i },
  { name: 'inset-block', regex: /(?<![-\w])inset-block(?:-start|-end)?\s*:/i },
  // CSS logical properties — Chrome 87+ (CSS longhands)
  { name: 'padding-inline', regex: /(?<![-\w])padding-inline\s*:/i },
  { name: 'padding-block', regex: /(?<![-\w])padding-block\s*:/i },
  { name: 'margin-inline', regex: /(?<![-\w])margin-inline\s*:/i },
  { name: 'margin-block', regex: /(?<![-\w])margin-block\s*:/i },
  { name: 'border-inline', regex: /(?<![-\w])border-inline(?:-start|-end)?(?:-\w+)?\s*:/i },
  { name: 'border-block', regex: /(?<![-\w])border-block(?:-start|-end)?(?:-\w+)?\s*:/i },
  // React inline-style camelCase — same Chrome 87+ APIs; autoprefixer never rewrites these
  { name: 'paddingInline (JS)', regex: /\bpaddingInline\b/ },
  { name: 'paddingBlock (JS)', regex: /\bpaddingBlock\b/ },
  { name: 'marginInline (JS)', regex: /\bmarginInline\b/ },
  { name: 'marginBlock (JS)', regex: /\bmarginBlock\b/ },
  { name: 'insetInline (JS)', regex: /\binsetInline\b/ },
  { name: 'insetBlock (JS)', regex: /\binsetBlock\b/ },
  { name: 'borderInline (JS)', regex: /\bborderInline(?:Start|End|Width|Style|Color)?\b/ },
  { name: 'borderBlock (JS)', regex: /\bborderBlock(?:Start|End|Width|Style|Color)?\b/ },
  // Modern color spaces — Chrome 111+
  { name: 'oklch()', regex: /oklch\s*\(/i },
  { name: 'oklab()', regex: /oklab\s*\(/i },
  { name: 'lab()', regex: /(?<![-\w])lab\s*\(/i },
  { name: 'lch()', regex: /(?<![-\w])lch\s*\(/i },
  // Same Values L4 cohort as dvh
  { name: 'dvw unit', regex: /\bdvw\b/ },
  { name: 'svw unit', regex: /\bsvw\b/ },
  { name: 'lvw unit', regex: /\blvw\b/ },
  // text-wrap: pretty — Chrome 117+
  { name: 'text-wrap: pretty', regex: /text-wrap\s*:\s*pretty\b/i },
  // container-type without @container — Chrome 105+
  { name: 'container-type', regex: /(?<![-\w])container-type\s*:/i },
  // accent-color — Chrome 93+
  { name: 'accent-color', regex: /(?<![-\w])accent-color\s*:/i },
  // content-visibility — flaky on older CEF
  { name: 'content-visibility', regex: /(?<![-\w])content-visibility\s*:/i },
  // Container queries — Chrome 105+
  { name: '@container', regex: /@container\b/i },
  // :has() — Chrome 105+
  { name: ':has() selector', regex: /:has\s*\(/i },
  // :is() / :where() — Chrome 88+. Exclude Tailwind preflight's own inert :where()
  // resets (abbr:where([title]), input:where([type=...]), [hidden]:where(...)) —
  // this theme never renders <abbr>, <input>, or a raw `hidden` attribute, so these
  // specific rules are dead weight, same reasoning as the --tw-backdrop-blur exclusion.
  { name: ':is() selector', regex: /:is\s*\(/i },
  { name: ':where() selector', regex: /(?<!\babbr)(?<!\binput)(?<!\[hidden\]):where\s*\(/i },
  // @property — Chrome 85/99 (Tailwind v4 relies on this heavily; guards against
  // an accidental version upgrade off the pinned Tailwind v3 alias)
  { name: '@property', regex: /@property\s+--/ },
  // overflow: clip — Chrome 90+
  { name: 'overflow: clip', regex: /(?<![-\w])overflow(?:-x|-y)?\s*:\s*clip\b/i },
  // text-underline-offset — Chrome 87+
  { name: 'text-underline-offset', regex: /(?<![-\w])text-underline-offset\s*:/i },
  // subgrid — Chrome 117+
  { name: 'grid-template-*: subgrid', regex: /grid-template-(?:columns|rows)\s*:\s*subgrid\b/i },
  // Tailwind class names that compile to the above (catch in bundled JS/HTML too).
  // Exclude --tw-backdrop-* variable declarations (inert preflight defaults, not actual usage).
  // Exclude inset-x-* / inset-y-* (physical left/right or top/bottom — Chrome 86 safe).
  { name: 'inset-* class (shorthand)', regex: /(?<![-\w])(?:-)?(?:\w+:)*inset-(?:0|auto|px|full|\[[^\]]+\])\b/ },
  { name: 'backdrop-blur-* class', regex: /(?<!--tw-)\bbackdrop-blur(?:-\w+)?\b/ },
  { name: 'mix-blend-* class', regex: /\bmix-blend-(?:\w+(?:-\w+)*)?\b/ },
  { name: 'bg-clip-text class', regex: /\bbg-clip-text\b/ },
  { name: 'text-balance class', regex: /\btext-balance\b/ },
  { name: 'aspect-* class', regex: /\baspect-(?:auto|square|video|\[[^\]]+\])\b/ },
  { name: 'has-[...] variant class', regex: /\bhas-\[/ },
  { name: 'overflow-clip class', regex: /\boverflow-clip\b/ },
  { name: 'underline-offset-* class', regex: /\bunderline-offset-(?:auto|\d+|\[[^\]]+\])\b/ },
];

function collectFiles(dir) {
  /** @type {string[]} */
  const files = [];

  if (!fs.existsSync(dir)) {
    return files;
  }

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectFiles(fullPath));
      continue;
    }

    if (/\.(css|js|html)$/i.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

function main() {
  if (!fs.existsSync(DIST_DIR)) {
    console.error(`\nGraphics output check FAILED: ${DIST_DIR} not found. Run: cd app && npm run build:graphics\n`);
    process.exit(1);
  }

  const files = collectFiles(DIST_DIR);
  /** @type {string[]} */
  const violations = [];

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const relative = path.relative(DIST_DIR, file);

    for (const { name, regex } of FORBIDDEN_PATTERNS) {
      if (regex.test(content)) {
        violations.push(`${relative}: contains forbidden ${name}`);
      }
    }
  }

  if (violations.length > 0) {
    console.error('\nGraphics output check FAILED:\n');
    for (const message of violations) {
      console.error(`  • ${message}`);
    }
    console.error('');
    process.exit(1);
  }

  console.log(`Graphics output check passed (${files.length} files scanned in dist-graphics/)`);
}

main();
