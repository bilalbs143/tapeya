import { hashGraphicContext } from '../contextHash';
import { normalizeConfig } from './config';
import { normalizeLive } from './live';
import { normalizeMatch, normalizeTournament } from './match';
import { resolveContextTeams } from './teams';

/** @typedef {import('../../types.js').GraphicSessionSnapshot} GraphicSessionSnapshot */

/**
 * Normalize a raw graphic session into a typed snapshot for processors.
 * Never throws — missing fields fall back to safe defaults.
 *
 * @param {Record<string, unknown>|null|undefined} rawSession
 * @param {string} themeSlug
 * @returns {GraphicSessionSnapshot | null}
 */
export function normalizeSession(rawSession, themeSlug) {
  if (!rawSession || typeof rawSession !== 'object') return null;

  const active = rawSession.active_command && typeof rawSession.active_command === 'object' ? rawSession.active_command : null;
  const legacyContext = rawSession.context && typeof rawSession.context === 'object' ? rawSession.context : {};
  const teams = resolveContextTeams(legacyContext);

  return {
    commandKey: active?.command_key ?? null,
    commandId: active?.id ?? null,
    commandType: active?.command_type ?? null,
    displayMode: active?.display_mode ?? null,
    payload: active?.payload ?? null,
    themeSlug,
    contextHash:
      typeof rawSession.context_hash === 'string' && rawSession.context_hash !== ''
        ? rawSession.context_hash
        : hashGraphicContext(legacyContext),
    match: normalizeMatch(legacyContext),
    tournament: normalizeTournament(legacyContext),
    live: normalizeLive(legacyContext, teams),
    nextMatchFixture: legacyContext.next_match_fixture ?? null,
    config: normalizeConfig(rawSession.config),
  };
}

export { normalizeBatters, normalizeTeam, resolveContextTeams } from './teams';
