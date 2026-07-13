import manifest from '../../graphics-command-manifest.json';
import { processAnimation, processFstAnimation, PROCESSOR_REGISTRY } from './processorRegistry';

/** @typedef {import('./types.js').GraphicProcessor} GraphicProcessor */

/** @type {Record<string, GraphicProcessor>} */
export const PROCESSOR_MAP = {};

for (const command of manifest.commands) {
  if (command.status === 'pending_full_stack') continue;
  if (command.category === 'backoffice_only') continue;
  if (command.category === 'animation') continue;

  const impl = PROCESSOR_REGISTRY[command.processorId];
  if (impl) {
    PROCESSOR_MAP[command.key] = impl;
  } else if (import.meta.env.DEV) {
    console.warn(`[processorMap] Missing registry entry for processorId "${command.processorId}" (key: ${command.key})`);
  }
}

const animationKeys = manifest.commands.filter((command) => command.category === 'animation').map((command) => command.key);
for (const key of animationKeys) {
  PROCESSOR_MAP[key] = processAnimation;
}

// FST commands are animation-category but also render a live scoreboard bar,
// so they need scorecard data — override processAnimation with processFstAnimation.
const fstKeys = manifest.commands.filter((command) => command.type === 'FULL_SCREEN_TRANSITION').map((command) => command.key);
for (const key of fstKeys) {
  PROCESSOR_MAP[key] = processFstAnimation;
}

/** @returns {string[]} */
export function getMigratedCommandKeys() {
  return Object.keys(PROCESSOR_MAP);
}

/** @param {string|null|undefined} commandKey */
export function hasDedicatedProcessor(commandKey) {
  return Boolean(commandKey && commandKey in PROCESSOR_MAP);
}

export { PROCESSOR_REGISTRY } from './processorRegistry';
