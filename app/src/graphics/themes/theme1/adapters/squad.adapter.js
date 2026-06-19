/**
 * Squad processors → SquadListGraphic data shape.
 */
import { toTeamRecord, tournamentSub } from './_shared';

/**
 * @param {Array<Record<string, unknown>>} players
 */
function mapSquadPlayers(players) {
  return players.map((p) => ({
    id: p.player_id ?? p.id,
    name: p.name ?? p.display_name ?? '',
    role: p.role ?? p.playing_role ?? '',
    avatarUrl: p.avatarUrl ?? p.image_url ?? p.avatar_url ?? null,
    captain: Boolean(p.captain ?? p.is_captain),
    wicketKeeper: Boolean(p.wicketKeeper ?? p.is_wicket_keeper ?? p.wicket_keeper),
  }));
}

/**
 * @param {Record<string, unknown>} props
 * @param {import('../../../types.js').ThemeTokens|undefined} tokens
 * @param {'batting'|'bowling'} mode
 */
export function toSquadBundle(props, tokens, mode) {
  const players = Array.isArray(props.players) ? props.players : [];
  if (!players.length) return null;

  const sub = tournamentSub(props);

  // Preview/fixture shape — title, sub, and teamCode are already graphic-ready.
  if (props.title && !props.team) {
    const code = String(props.teamCode ?? (mode === 'bowling' ? 'bowling' : 'batting'));
    const accent = props.accent || (mode === 'bowling' ? tokens?.awayBgColor : tokens?.homeBgColor) || 'var(--accentA)';

    return {
      teams: {
        [code]: {
          code: code.toUpperCase(),
          name: props.title,
          fullName: props.title,
          displayName: props.title,
          color: accent,
          logoUrl: props.logoUrl ?? null,
        },
      },
      data: {
        teamCode: code,
        title: props.title,
        sub,
        accent,
        logoUrl: props.logoUrl ?? null,
        requiredRR: props.requiredRR ?? props.requiredRunRate ?? '',
        defaultAvatarUrl: props.defaultAvatarUrl ?? null,
        players: mapSquadPlayers(players),
      },
    };
  }

  const team = props.team;
  if (!team) return null;

  const code = mode === 'bowling' ? 'bowling' : 'batting';
  const theme1Team = toTeamRecord(team, code, tokens);
  const teams = { [code]: theme1Team };

  return {
    teams,
    data: {
      teamCode: code,
      title: team.name ?? theme1Team.displayName,
      sub,
      accent: theme1Team.color,
      logoUrl: team.logoUrl ?? props.teamLogoUrl ?? props.tournamentLogoUrl ?? null,
      requiredRR: props.requiredRunRate ?? props.requiredRR ?? '',
      defaultAvatarUrl: props.defaultAvatarUrl ?? null,
      players: mapSquadPlayers(players),
    },
  };
}
