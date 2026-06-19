#!/usr/bin/env node
/**
 * Monorepo entry — delegates to tapeya-theme-controller/scripts/generate-wrappers.mjs
 */
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const script = path.resolve(__dirname, '../tapeya-theme-controller/scripts/generate-wrappers.mjs');
const result = spawnSync(process.execPath, [script], { stdio: 'inherit' });

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}
