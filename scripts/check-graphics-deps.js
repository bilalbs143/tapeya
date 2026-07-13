#!/usr/bin/env node

/**
 * Fail when the graphics build output contains consumer-only dependencies.
 * Run after: cd app && npm run build:graphics
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.resolve(__dirname, '../app/dist-graphics');

const FORBIDDEN_STRINGS = [
  'fbevents',
  'connect.facebook.net',
  '@capacitor',
  'react-router-dom',
  'redux-persist',
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
    console.error(`\nGraphics deps check FAILED: ${DIST_DIR} not found. Run: cd app && npm run build:graphics\n`);
    process.exit(1);
  }

  const files = collectFiles(DIST_DIR);
  /** @type {string[]} */
  const violations = [];

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const relative = path.relative(DIST_DIR, file);

    for (const needle of FORBIDDEN_STRINGS) {
      if (content.includes(needle)) {
        violations.push(`${relative}: contains forbidden "${needle}"`);
      }
    }
  }

  if (violations.length > 0) {
    console.error('\nGraphics deps check FAILED:\n');
    for (const message of violations) {
      console.error(`  • ${message}`);
    }
    console.error('');
    process.exit(1);
  }

  console.log(`Graphics deps check passed (${files.length} files scanned in dist-graphics/)`);
}

main();
