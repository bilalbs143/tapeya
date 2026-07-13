import { describe, expect, it } from 'vitest';

import { getMigratedCommandKeys, PROCESSOR_MAP, PROCESSOR_REGISTRY } from '../processorMap.js';
import { processAnimation, processFstAnimation } from '../processorRegistry.js';

import manifest from '../../../graphics-command-manifest.json';

/** Mirror scripts/check-graphics-drift.js processor coverage rules. */
function manifestProcessorKeys() {
  return manifest.commands
    .filter((command) => command.status !== 'pending_full_stack' && command.category !== 'backoffice_only')
    .map((command) => command.key);
}

function manifestRegistryProcessorIds() {
  return manifest.commands
    .filter(
      (command) =>
        command.status !== 'pending_full_stack' && command.category !== 'backoffice_only' && command.category !== 'animation',
    )
    .map((command) => command.processorId);
}

describe('PROCESSOR_MAP integrity', () => {
  it('registers a function for every manifest overlay processor key', () => {
    const expectedKeys = manifestProcessorKeys();
    const missing = expectedKeys.filter((key) => typeof PROCESSOR_MAP[key] !== 'function');

    expect(missing, `Missing processors for: ${missing.join(', ')}`).toEqual([]);
  });

  it('builds PROCESSOR_MAP from manifest processorId entries in PROCESSOR_REGISTRY', () => {
    const missingRegistry = manifestRegistryProcessorIds().filter(
      (processorId) => typeof PROCESSOR_REGISTRY[processorId] !== 'function',
    );

    expect(missingRegistry, `Missing registry entries for: ${missingRegistry.join(', ')}`).toEqual([]);
  });

  it('does not expose orphan PROCESSOR_REGISTRY entries absent from the manifest', () => {
    const usedIds = new Set(manifestRegistryProcessorIds());
    const orphans = Object.keys(PROCESSOR_REGISTRY).filter((processorId) => !usedIds.has(processorId));

    expect(orphans, `Orphan registry entries: ${orphans.join(', ')}`).toEqual([]);
  });

  it('wires each non-animation manifest command key through its processorId', () => {
    const mismatches = manifest.commands
      .filter(
        (command) =>
          command.status !== 'pending_full_stack' && command.category !== 'backoffice_only' && command.category !== 'animation',
      )
      .filter((command) => PROCESSOR_MAP[command.key] !== PROCESSOR_REGISTRY[command.processorId])
      .map((command) => command.key);

    expect(mismatches, `Map wiring mismatches: ${mismatches.join(', ')}`).toEqual([]);
  });

  it('getMigratedCommandKeys matches PROCESSOR_MAP key count', () => {
    expect(getMigratedCommandKeys().sort()).toEqual(Object.keys(PROCESSOR_MAP).sort());
  });

  it('registers processAnimation for non-FST animation manifest keys', () => {
    const fstKeys = new Set(
      manifest.commands.filter((command) => command.type === 'FULL_SCREEN_TRANSITION').map((command) => command.key),
    );
    const animationKeys = manifest.commands.filter((command) => command.category === 'animation').map((command) => command.key);

    const wrong = animationKeys.filter((key) => !fstKeys.has(key) && PROCESSOR_MAP[key] !== processAnimation);

    expect(wrong, `Expected processAnimation for: ${wrong.join(', ')}`).toEqual([]);
  });

  it('registers processFstAnimation for FULL_SCREEN_TRANSITION keys', () => {
    const fstKeys = manifest.commands
      .filter((command) => command.type === 'FULL_SCREEN_TRANSITION')
      .map((command) => command.key);
    const wrong = fstKeys.filter((key) => PROCESSOR_MAP[key] !== processFstAnimation);

    expect(wrong, `Expected processFstAnimation for: ${wrong.join(', ')}`).toEqual([]);
  });
});
