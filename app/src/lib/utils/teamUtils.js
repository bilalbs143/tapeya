import { TEAM_LOGO_VARIANTS } from '@/lib/constants/teamAssets';

/**
 * @param {object|string|null|undefined} team
 * @returns {string|null}
 */
export function extractTeamLogo(team) {
  if (team == null) return null;
  if (typeof team === 'string') {
    const trimmed = team.trim();
    return trimmed || null;
  }
  const logo = team.logo ?? team.logo_url ?? null;
  if (typeof logo !== 'string') return null;
  const trimmed = logo.trim();
  return trimmed || null;
}

/**
 * @param {string|null|undefined} name
 * @param {string} [fallback='T']
 * @returns {string}
 */
export function getTeamInitial(name, fallback = 'T') {
  const str = String(name || fallback).trim();
  const words = str.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return str.slice(0, 2).toUpperCase();
}

/**
 * @param {'default'|'dialog'|'dialogSelect'|'draft'|'fixture'|'list'|'match'|'organizerCard'|'scorecardCard'|'scorecardInline'|'scoring'|'teamsTab'} variant
 * @returns {string|null}
 */
export function getTeamLogoFallbackSrc(variant = 'default') {
  return TEAM_LOGO_VARIANTS[variant]?.fallbackSrc ?? TEAM_LOGO_VARIANTS.default.fallbackSrc;
}

/**
 * @param {object|string|null|undefined} team
 * @param {'default'|'dialog'|'dialogSelect'|'draft'|'fixture'|'list'|'match'|'organizerCard'|'scorecardCard'|'scorecardInline'|'scoring'|'teamsTab'} [variant='default']
 * @returns {string|null}
 */
export function getTeamLogoUrl(team, variant = 'default') {
  return extractTeamLogo(team) ?? getTeamLogoFallbackSrc(variant);
}
