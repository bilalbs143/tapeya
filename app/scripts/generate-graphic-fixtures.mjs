#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const appRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const result = spawnSync('npx', ['vitest', 'run', 'src/graphics/__tests__/writeGraphicFixtures.test.js'], {
  cwd: appRoot,
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

process.exit(result.status ?? 1);
