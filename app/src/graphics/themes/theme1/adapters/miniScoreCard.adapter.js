/**
 * MINI_SCORECARD processor output → MiniScoreCardLTBar bundle.
 */
import { toTeamRecord } from './_shared';

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
 * @param {Record<string, unknown>} props
 * @param {import('../../../types.js').ThemeTokens|undefined} tokens
 */
export function toMiniScoreCardBundle(props, tokens) {
  const teamCode = props.teamCode != null ? String(props.teamCode) : '';
  if (!teamCode) return null;

  const sideTeams = buildSideTeams(props, tokens);
  /** @type {Record<string, object>} */
  const teams = props.teams && typeof props.teams === 'object' ? { ...props.teams } : {};

  if (!teams[teamCode]) {
    const side = sideTeams?.[teamCode];
    if (side) {
      teams[teamCode] = side;
    } else {
      teams[teamCode] = toTeamRecord(
        {
          name: props.teamLabel ?? teamCode,
          shortCode: props.teamLabel ?? teamCode,
        },
        teamCode,
        tokens,
      );
    }
  }

  if (!teams[teamCode]) return null;

  return {
    miniScoreCard: {
      teamCode,
      teamLabel: props.teamLabel,
      oversText: props.oversText ?? '',
      total: props.total ?? 0,
      wkts: props.wkts ?? 0,
      scoreSep: props.scoreSep ?? '-',
    },
    teams,
  };
}
