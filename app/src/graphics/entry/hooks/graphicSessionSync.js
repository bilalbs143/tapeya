/**
 * Pure helpers for graphics session query args and RTK cache patches.
 * Extracted from useGraphicSession for unit testing without Redux/Echo.
 */

/**
 * @param {string|undefined} accessToken Stateless overlay access token from the URL path.
 * @returns {string|null}
 */
export function resolveSessionQueryArg(accessToken) {
  if (!accessToken) return null;
  return accessToken;
}

/**
 * Match id for Reverb channels — from loaded session.
 *
 * @param {{ match_id?: string|number }|undefined|null} session
 * @returns {string|null}
 */
export function resolveMatchIdForReverb(session) {
  if (session?.match_id != null) return String(session.match_id);
  return null;
}

/**
 * Apply a Reverb `.match.graphic.activated` payload to a session draft.
 *
 * @param {Record<string, unknown>} draft
 * @param {Record<string, unknown>} event
 * @returns {{ shouldRefetchContext: boolean }}
 */
export function patchSessionFromReverbEvent(draft, event) {
  let shouldRefetchContext = false;

  draft.active_command = {
    command_key: event.command_key,
    command_type: event.command_type,
    display_mode: event.display_mode ?? null,
    payload: event.payload ?? null,
    id: event.command_id,
  };

  if (event.context_hash != null) {
    shouldRefetchContext = event.context_hash !== draft.context_hash;
    draft.context_hash = event.context_hash;
  }

  if (event.graphic_theme_id != null) {
    const prevThemeId = draft.graphic_theme_id;
    draft.graphic_theme_id = event.graphic_theme_id;
    if (event.graphic_theme_id !== prevThemeId) {
      shouldRefetchContext = true;
    }
  }

  if (Object.prototype.hasOwnProperty.call(event, 'config')) {
    draft.config = event.config ?? null;
  }

  return { shouldRefetchContext };
}

/**
 * Update context_hash when a flash/scoring event carries a new hash.
 *
 * @param {Record<string, unknown>} draft
 * @param {string|null|undefined} nextHash
 * @returns {boolean} whether the caller should refetch full context over HTTP
 */
export function patchSessionContextHash(draft, nextHash) {
  if (nextHash == null) return false;

  if (nextHash !== draft.context_hash) {
    draft.context_hash = nextHash;
    return true;
  }

  return false;
}
