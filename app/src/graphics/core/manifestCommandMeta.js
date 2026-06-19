import manifest from '../../../../shared/graphics-command-manifest.json';

/** @typedef {{ commandType: string|null, displayMode: string|null, category: string|null }} ManifestCommandMeta */

/** @type {Map<string, { type: string, displayMode: (string|null), category: string }>} */
const manifestByKey = new Map(manifest.commands.map((command) => [command.key, command]));

/**
 * Resolve command type and display mode from the shared manifest.
 *
 * @param {string|null|undefined} commandKey
 * @returns {ManifestCommandMeta}
 */
export function resolveManifestCommandMeta(commandKey) {
  if (!commandKey) {
    return { commandType: null, displayMode: null, category: null };
  }

  const entry = manifestByKey.get(commandKey);
  if (!entry) {
    return { commandType: null, displayMode: null, category: null };
  }

  return {
    commandType: entry.type ?? null,
    displayMode: entry.displayMode ?? null,
    category: entry.category ?? null,
  };
}

/**
 * Apply an active flash item onto a normalized session snapshot.
 * Keeps Layer-1 commandId/contextHash unless the flash carries a newer hash.
 *
 * @param {import('../types.js').GraphicSessionSnapshot|null} snapshot
 * @param {{ commandKey: string, context: object|null, contextHash: string|null }|null} flashItem
 * @returns {import('../types.js').GraphicSessionSnapshot|null}
 */
export function applyFlashToSnapshot(snapshot, flashItem) {
  if (!flashItem || !snapshot) {
    return snapshot;
  }

  const meta = resolveManifestCommandMeta(flashItem.commandKey);

  return {
    ...snapshot,
    commandKey: flashItem.commandKey,
    commandType: meta.commandType,
    displayMode: meta.displayMode,
    ...(flashItem.contextHash ? { contextHash: flashItem.contextHash } : {}),
  };
}
