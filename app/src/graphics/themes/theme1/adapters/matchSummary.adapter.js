/**
 * Match Summary LT processor output → MatchSummaryLTBar bundle.
 */
import { toTeamRecord } from './_shared';
import { MATCH_SUMMARY_LT } from './presentationLabels';

/**
 * @param {Record<string, unknown>} props
 * @param {import('../../../types.js').ThemeTokens|undefined} tokens
 */
function buildSideTeams(props, tokens) {
  const homeTeam = props.homeTeam;
  const awayTeam = props.awayTeam;
  if (!homeTeam || !awayTeam) return null;

  return {
    home: toTeamRecord(homeTeam, 'home', tokens, 'home'),
    away: toTeamRecord(awayTeam, 'away', tokens, 'away'),
  };
}

/**
 * @param {Record<string, unknown>} entry
 * @param {Record<string, object>|null} sideTeams
 * @param {import('../../../types.js').ThemeTokens|undefined} tokens
 */
function teamRecordForEntry(entry, sideTeams, tokens) {
  const code = String(entry.teamCode);
  const side = sideTeams?.[code];

  if (side) {
    return {
      ...side,
      color: entry.accent ?? side.color,
      logoUrl: entry.logoUrl ?? side.logoUrl,
    };
  }

  return toTeamRecord(
    {
      name: entry.shortName ?? code,
      shortCode: code,
      logoUrl: entry.logoUrl,
      color: entry.accent,
    },
    code,
    tokens,
  );
}

/**
 * @param {Record<string, unknown>} props
 * @param {import('../../../types.js').ThemeTokens|undefined} tokens
 */
export function toMatchSummaryLtBundle(props, tokens) {
  const innings = Array.isArray(props.innings) ? props.innings : [];
  if (innings.length < 2) return null;

  const summaryInnings = innings.slice(0, 2);
  const sideTeams = buildSideTeams(props, tokens);
  /** @type {Record<string, object>} */
  const teams = props.teams && typeof props.teams === 'object' ? { ...props.teams } : {};

  for (const entry of summaryInnings) {
    const code = String(entry.teamCode ?? '');
    if (!code || teams[code]) continue;
    teams[code] = teamRecordForEntry(entry, sideTeams, tokens);
  }

  if (!teams[String(summaryInnings[0].teamCode)] || !teams[String(summaryInnings[1].teamCode)]) {
    return null;
  }

  return {
    summary: {
      label: props.caption ?? props.label ?? MATCH_SUMMARY_LT.label,
      vsLabel: props.vsLabel ?? MATCH_SUMMARY_LT.vsLabel,
      innings: summaryInnings,
    },
    teams,
  };
}
