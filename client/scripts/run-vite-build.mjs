#!/usr/bin/env node
/**
 * Vite builds with an explicit env banner.
 * Usage: node scripts/run-vite-build.mjs <local|production|staging> [ios|android]
 *
 * - local: `.env` / `.env.production` (same as plain `vite build`)
 * - production|staging: pins API + Reverb + GA
 */
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { loadEnv } from 'vite';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const SHARED = {
  VITE_REVERB_APP_KEY: 'local-reverb-key',
  VITE_REVERB_PORT: '443',
  VITE_REVERB_SCHEME: 'https',
  VITE_GA_MEASUREMENT_ID: 'G-MR83CQDG6Z',
};

const profiles = {
  production: {
    ...SHARED,
    VITE_API_URL: 'https://api.tapeya.com/api/v1',
    VITE_APP_URL: 'https://tapeya.com',
    VITE_REVERB_HOST: 'api.tapeya.com',
  },
  staging: {
    ...SHARED,
    VITE_API_URL: 'https://dev-api.tapeya.com/api/v1',
    VITE_APP_URL: 'https://dev.tapeya.com',
    VITE_REVERB_HOST: 'dev-api.tapeya.com',
  },
};

const ENV_KEYS = [
  'VITE_API_URL',
  'VITE_APP_URL',
  'VITE_REVERB_APP_KEY',
  'VITE_REVERB_HOST',
  'VITE_REVERB_PORT',
  'VITE_REVERB_SCHEME',
  'VITE_GA_MEASUREMENT_ID',
  'VITE_SENTRY_DSN',
  'VITE_NATIVE_PLATFORM',
];

const [, , profileName, platform] = process.argv;
const known = ['local', ...Object.keys(profiles)];

if (!profileName || !known.includes(profileName)) {
  console.error(`Usage: node scripts/run-vite-build.mjs <${known.join('|')}> [ios|android]`);
  process.exit(1);
}

if (platform && platform !== 'ios' && platform !== 'android') {
  console.error(`Unknown platform "${platform}". Use ios, android, or omit.`);
  process.exit(1);
}

const pinned = profileName === 'local' ? null : profiles[profileName];
const fromDotenv = loadEnv('production', root, 'VITE_');

function resolve(key) {
  if (key === 'VITE_NATIVE_PLATFORM') return platform || fromDotenv[key] || process.env[key] || '';
  if (pinned?.[key] != null) return pinned[key];
  return process.env[key] || fromDotenv[key] || '';
}

function display(key, value) {
  if (!value) return '(unset)';
  if (key === 'VITE_SENTRY_DSN' && value.length > 48) {
    return `${value.slice(0, 28)}…${value.slice(-12)}`;
  }
  return value;
}

const target = platform === 'ios' ? 'iOS app' : platform === 'android' ? 'Android app' : 'Web app';
const width = Math.max(...ENV_KEYS.map((k) => k.length));

console.log('');
console.log('┌─ Tapeya client build');
console.log(`│  Target      ${target}`);
console.log(`│  Environment ${profileName}`);
console.log(`│  Env source  ${pinned ? 'pinned (run-vite-build.mjs)' : '.env / .env.production'}`);
console.log('│  Vite env');
for (const key of ENV_KEYS) {
  console.log(`│    ${key.padEnd(width)}  ${display(key, resolve(key))}`);
}
if (profileName === 'local' && !resolve('VITE_REVERB_HOST')) {
  console.log('│  note: unset Reverb → runtime derives host/port from VITE_API_URL');
}
console.log('└────────────────────────────────────────');
console.log('');

const env = { ...process.env, ...pinned };
if (platform) env.VITE_NATIVE_PLATFORM = platform;

const viteBin = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js');
const result = spawnSync(process.execPath, [viteBin, 'build'], { env, stdio: 'inherit', cwd: root });
process.exit(result.status ?? 1);
