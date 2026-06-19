/**
 * Leaderboard processors → LeaderboardGraphic data shape.
 */
import { assets } from '../config';
import { tournamentSub } from './_shared';
import { leaderboardTitleForCommand } from './presentationLabels';

/**
 * @param {Record<string, unknown>} props
 */
export function toLeaderboardData(props) {
  const rows = Array.isArray(props.rows) ? props.rows : [];
  if (!rows.length && !props.featured) return null;

  const mappedRows = rows.map((row, index) => ({
    rank: row.rank ?? index + 1,
    name: row.name ?? '',
    club: row.team_name ?? row.team ?? row.club ?? '',
    value: row.runs ?? row.wickets ?? row.value ?? '',
    isNotOut: Boolean(row.is_not_out ?? row.isNotOut),
  }));

  const featured = props.featured ?? null;

  return {
    title: leaderboardTitleForCommand(props.commandKey, props.title),
    sub: props.subtitle ?? props.sub ?? tournamentSub(props),
    data: {
      rows: mappedRows,
      featured: featured
        ? {
            name: featured.name ?? '',
            value: featured.value ?? '',
            club: featured.team_name ?? featured.team ?? '',
          }
        : mappedRows[0]
          ? {
              name: mappedRows[0].name,
              value: mappedRows[0].value,
              club: mappedRows[0].club,
            }
          : null,
      avatarUrl: props.avatarUrl ?? featured?.image_url ?? mappedRows[0]?.image_url ?? null,
      logoUrl: props.tournamentLogoUrl ?? assets.brandLogoWhite,
    },
  };
}
