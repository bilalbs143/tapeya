#!/usr/bin/env node

/**

 * Graphics drift check (manifest ↔ registry ↔ themes ↔ processors; no legacy shims).

 *

 * Ensures parity between:

 *   - shared/graphics-command-manifest.json (generated from PHP enum)

 *   - shared/graphics-themes.json (registered overlay themes)

 *   - manifest overlay keys (all commands except pending_full_stack)

 *   - app/src/graphics/core/processorRegistry.js (processorId → implementation)
 *   - app/src/graphics/core/processorMap.js (manifest-driven wiring)

 *   - app/src/graphics/themes/{theme}/commands/{TYPE}/{KEY}.jsx (1:1 theme files)

 *

 * Usage: node scripts/check-graphics-drift.js

 */



import fs from 'node:fs';

import path from 'node:path';

import { fileURLToPath } from 'node:url';



const __dirname = path.dirname(fileURLToPath(import.meta.url));

const REPO_ROOT = path.resolve(__dirname, '..');



const MANIFEST_PATH = path.join(REPO_ROOT, 'shared/graphics-command-manifest.json');

const THEMES_PATH = path.join(REPO_ROOT, 'shared/graphics-themes.json');

const PROCESSOR_REGISTRY_PATH = path.join(REPO_ROOT, 'app/src/graphics/core/processorRegistry.js');

const GRAPHIC_COMMAND_KEYS_PATH = path.join(REPO_ROOT, 'app/src/graphics/core/graphicCommandKeys.js');

const THEMES_ROOT = path.join(REPO_ROOT, 'app/src/graphics/themes');



function fail(messages) {

  console.error('\nGraphics drift check FAILED:\n');

  for (const message of messages) {

    console.error(`  • ${message}`);

  }

  console.error('');

  process.exit(1);

}



function loadManifest() {

  if (!fs.existsSync(MANIFEST_PATH)) {

    fail([`Manifest not found at ${MANIFEST_PATH}. Run: cd api && php artisan graphics:export-manifest`]);

  }



  const raw = fs.readFileSync(MANIFEST_PATH, 'utf8');

  const manifest = JSON.parse(raw);



  if (!Array.isArray(manifest.commands)) {

    fail(['Manifest is missing a "commands" array.']);

  }



  return manifest;

}



function loadThemesConfig() {

  if (!fs.existsSync(THEMES_PATH)) {

    fail([`Themes config not found at ${THEMES_PATH}.`]);

  }



  const raw = fs.readFileSync(THEMES_PATH, 'utf8');

  const config = JSON.parse(raw);



  if (!Array.isArray(config.themes)) {

    fail(['graphics-themes.json is missing a "themes" array.']);

  }



  return config;

}



/** @param {object} manifest */
function manifestOverlayKeys(manifest) {
  return manifest.commands
    .filter((command) => command.status !== 'pending_full_stack')
    .map((command) => command.key);
}



/**

 * @param {string} themeFolder

 * @returns {Map<string, string>} commandKey -> commandType subfolder

 */

function listThemeCommandFiles(themeFolder) {

  const commandsDir = path.join(THEMES_ROOT, themeFolder, 'commands');

  /** @type {Map<string, string>} */

  const files = new Map();



  if (!fs.existsSync(commandsDir)) {

    return files;

  }



  for (const entry of fs.readdirSync(commandsDir, { withFileTypes: true })) {

    if (!entry.isDirectory()) {

      continue;

    }



    const commandType = entry.name;

    const typeDir = path.join(commandsDir, commandType);



    for (const file of fs.readdirSync(typeDir)) {

      if (!file.endsWith('.jsx')) continue;

      const key = file.replace(/\.jsx$/, '');

      files.set(key, commandType);

    }

  }



  return files;

}



function requiredManifestKeys(manifest, nullComponentKeys) {

  return manifest.commands.filter(

    (command) =>

      command.status !== 'pending_full_stack' &&

      !nullComponentKeys.has(command.key) &&

      command.category !== 'backoffice_only',

  );

}



function validateThemeCompleteness(manifest, manifestByKey, nullComponentKeys, errors) {

  const themesConfig = loadThemesConfig();

  const requiredCommands = requiredManifestKeys(manifest, nullComponentKeys);



  for (const theme of themesConfig.themes) {

    const folder = theme.folder ?? theme.slug;

    const themeFiles = listThemeCommandFiles(folder);



    if (theme.completeness === 'full') {

      for (const command of requiredCommands) {

        const actualType = themeFiles.get(command.key);

        if (!actualType) {

          errors.push(

            `Theme "${theme.slug}" is missing command file themes/${folder}/commands/${command.type}/${command.key}.jsx`,

          );

          continue;

        }



        if (actualType !== command.type) {

          errors.push(

            `Theme "${theme.slug}" command "${command.key}" is in commands/${actualType}/ but manifest expects commands/${command.type}/`,

          );

        }

      }



      if (themeFiles.size !== requiredCommands.length) {

        errors.push(

          `Theme "${theme.slug}" has ${themeFiles.size} command files but manifest expects ${requiredCommands.length}`,

        );

      }

    } else if (theme.completeness === 'partial') {

      const expected = Array.isArray(theme.commands) ? theme.commands : [];

      for (const key of expected) {

        const command = manifestByKey.get(key);

        if (!command) {

          errors.push(`Partial theme "${theme.slug}" references unknown manifest key "${key}"`);

          continue;

        }



        const actualType = themeFiles.get(key);

        if (!actualType) {

          errors.push(

            `Partial theme "${theme.slug}" is missing command file themes/${folder}/commands/${command.type}/${key}.jsx`,

          );

          continue;

        }



        if (actualType !== command.type) {

          errors.push(

            `Partial theme "${theme.slug}" command "${key}" is in commands/${actualType}/ but manifest expects commands/${command.type}/`,

          );

        }

      }



      for (const [key] of themeFiles) {

        if (!expected.includes(key)) {

          errors.push(

            `Partial theme "${theme.slug}" has unexpected command file "${key}.jsx" (not listed in graphics-themes.json)`,

          );

        }

      }

    } else {

      errors.push(`Theme "${theme.slug}" has unknown completeness "${theme.completeness}"`);

    }



    for (const [key] of themeFiles) {

      if (!manifestByKey.has(key)) {

        errors.push(`Theme "${theme.slug}" command file "${key}.jsx" is not in the PHP manifest`);

      }

    }

  }

}



/**
 * Explicit PROCESSOR_REGISTRY keys from processorRegistry.js.
 * @returns {Set<string>}
 */
function readRegistryKeysFromProcessorRegistrySource() {
  if (!fs.existsSync(PROCESSOR_REGISTRY_PATH)) {
    fail([`processorRegistry.js not found at ${PROCESSOR_REGISTRY_PATH}`]);
  }

  const source = fs.readFileSync(PROCESSOR_REGISTRY_PATH, 'utf8');
  const mapStart = source.indexOf('export const PROCESSOR_REGISTRY = {');
  if (mapStart === -1) {
    fail(['Could not find PROCESSOR_REGISTRY in processorRegistry.js']);
  }

  const mapBodyStart = source.indexOf('{', mapStart) + 1;
  const mapBodyEnd = source.indexOf('\n};', mapBodyStart);
  if (mapBodyEnd === -1) {
    fail(['Could not find closing }; for PROCESSOR_REGISTRY in processorRegistry.js']);
  }

  const mapBody = source.slice(mapBodyStart, mapBodyEnd);
  const keys = new Set();

  for (const match of mapBody.matchAll(/^\s+([A-Z][A-Z0-9_]+):/gm)) {
    keys.add(match[1]);
  }

  if (keys.size === 0) {
    fail(['Could not parse any explicit keys from PROCESSOR_REGISTRY in processorRegistry.js']);
  }

  return keys;
}

/**
 * Load NULL_COMPONENT_KEYS from the generated constants file.
 * Falls back to manifest categories if the constants file is absent.
 * @param {object} manifest
 * @returns {Promise<Set<string>>}
 */
async function loadNullComponentKeys(manifest) {
  if (fs.existsSync(GRAPHIC_COMMAND_KEYS_PATH)) {
    const { NULL_COMPONENT_KEYS } = await import(`file://${GRAPHIC_COMMAND_KEYS_PATH}`);
    if (NULL_COMPONENT_KEYS instanceof Set) return NULL_COMPONENT_KEYS;
  }
  // Fallback: derive from manifest categories
  return new Set(
    manifest.commands
      .filter((c) => c.category === 'clear' || c.category === 'backoffice_only')
      .map((c) => c.key),
  );
}

/**
 * Validate that every PROCESSOR_REGISTRY key is referenced by the manifest.
 * @param {Map<string, object>} manifestByKey
 * @param {string[]} errors
 */
function validateNoOrphanProcessorKeys(manifestByKey, errors) {
  const registryIds = readRegistryKeysFromProcessorRegistrySource();
  const manifest = [...manifestByKey.values()];
  for (const id of registryIds) {
    const used = manifest.some(
      (command) =>
        command.processorId === id &&
        command.status !== 'pending_full_stack' &&
        command.category !== 'backoffice_only' &&
        command.category !== 'animation',
    );
    if (!used) {
      errors.push(
        `processorRegistry.js defines "${id}" but no manifest command references it — remove the entry or fix the manifest`,
      );
    }
  }
}

/**
 * Validate the generated graphicCommandKeys.js is in sync with the manifest.
 * @param {object} manifest
 * @param {string[]} errors
 */
async function validateGeneratedConstantsSync(manifest, errors) {
  if (!fs.existsSync(GRAPHIC_COMMAND_KEYS_PATH)) {
    errors.push(
      `graphicCommandKeys.js not found at ${GRAPHIC_COMMAND_KEYS_PATH} — run: cd api && php artisan graphics:export-manifest`,
    );
    return;
  }

  const { GRAPHIC_KEYS } = await import(`file://${GRAPHIC_COMMAND_KEYS_PATH}`);
  if (!GRAPHIC_KEYS || typeof GRAPHIC_KEYS !== 'object') {
    errors.push('graphicCommandKeys.js does not export a valid GRAPHIC_KEYS object');
    return;
  }

  const generatedKeys = new Set(Object.keys(GRAPHIC_KEYS));
  const manifestKeys = new Set(manifest.commands.map((c) => c.key));

  for (const key of manifestKeys) {
    if (!generatedKeys.has(key)) {
      errors.push(`graphicCommandKeys.js is missing key "${key}" — run: cd api && php artisan graphics:export-manifest`);
    }
  }

  for (const key of generatedKeys) {
    if (!manifestKeys.has(key)) {
      errors.push(`graphicCommandKeys.js has orphan key "${key}" not in manifest — run: cd api && php artisan graphics:export-manifest`);
    }
  }
}



async function validateProcessorCoverage(manifest, registryKeys, errors) {
  const registryProcessorIds = readRegistryKeysFromProcessorRegistrySource();

  for (const command of manifest.commands) {
    if (command.status === 'pending_full_stack' || command.category === 'backoffice_only') {
      continue;
    }

    if (command.category === 'animation') {
      continue;
    }

    if (!registryProcessorIds.has(command.processorId)) {
      errors.push(
        `Manifest processorId "${command.processorId}" (key: ${command.key}) is missing from processorRegistry.js`,
      );
    }
  }

  for (const key of registryKeys) {
    const command = manifest.commands.find((entry) => entry.key === key);

    if (command?.category === 'backoffice_only') {
      continue;
    }

    if (command?.category === 'animation') {
      continue;
    }

    if (command && !registryProcessorIds.has(command.processorId)) {
      errors.push(`Registry key "${key}" processorId "${command.processorId}" is missing from processorRegistry.js`);
    }
  }
}



function validateNoLegacyShims(errors) {
  for (const legacyName of ['tapeya', 'tapeya-basic', 'theme2-stub', 'theme-1', 'theme-2']) {
    const legacyDir = path.join(THEMES_ROOT, legacyName);

    if (fs.existsSync(legacyDir)) {
      errors.push(`Remove deprecated theme folder themes/${legacyName}/`);
    }
  }

  const theme1CommandsDir = path.join(THEMES_ROOT, 'theme1/commands');

  if (fs.existsSync(theme1CommandsDir)) {
    for (const entry of fs.readdirSync(theme1CommandsDir, { withFileTypes: true })) {
      if (entry.isFile() && entry.name.endsWith('.jsx')) {
        errors.push(`Flat command file theme1/commands/${entry.name} must live under commands/<TYPE>/`);
      }

      if (!entry.isDirectory()) continue;

      for (const file of fs.readdirSync(path.join(theme1CommandsDir, entry.name)).filter((name) => name.endsWith('.jsx'))) {
        const source = fs.readFileSync(path.join(theme1CommandsDir, entry.name, file), 'utf8');

        if (source.includes('/legacy/')) {
          errors.push(`Command file ${entry.name}/${file} still imports from legacy/`);
        }
      }
    }
  }
}



async function main() {

  const manifest = loadManifest();

  const registryKeys = manifestOverlayKeys(manifest);

  const errors = [];



  const manifestByKey = new Map(manifest.commands.map((command) => [command.key, command]));

  const manifestKeys = [...manifestByKey.keys()];

  const registrySet = new Set(registryKeys);

  const nullComponentKeys = await loadNullComponentKeys(manifest);



  for (const key of registryKeys) {

    if (!manifestByKey.has(key)) {

      errors.push(`Registry key "${key}" is not in the PHP manifest`);

    }

  }



  for (const command of manifest.commands) {

    const { key, status } = command;



    if (status === 'pending_full_stack') {

      continue;

    }



    if (!registrySet.has(key)) {

      errors.push(`Manifest key "${key}" (status: ${status}) is missing from overlay key set`);

    }

  }



  validateThemeCompleteness(manifest, manifestByKey, nullComponentKeys, errors);

  validateNoOrphanProcessorKeys(manifestByKey, errors);

  await validateProcessorCoverage(manifest, registryKeys, errors);

  await validateGeneratedConstantsSync(manifest, errors);

  validateNoLegacyShims(errors);



  const requiredRegistryCount = manifest.commands.filter((command) => command.status !== 'pending_full_stack').length;



  if (registryKeys.length !== requiredRegistryCount) {

    errors.push(

      `Registry has ${registryKeys.length} keys but manifest expects ${requiredRegistryCount} (all except pending_full_stack)`,

    );

  }



  if (manifestKeys.length !== new Set(manifestKeys).size) {

    errors.push('Manifest contains duplicate command keys');

  }



  if (errors.length > 0) {

    fail(errors);

  }



  const themesConfig = loadThemesConfig();

  const theme1Keys = listThemeCommandFiles('theme1');



  console.log(

    `Graphics drift check passed (${manifestKeys.length} manifest keys, ${registryKeys.length} registry keys, ${themesConfig.themes.length} themes, ${theme1Keys.size} theme1 command files).`,

  );

}



main().catch((err) => { console.error(err); process.exit(1); });

