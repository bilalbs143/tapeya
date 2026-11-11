export { useGetPlayerStatsQuery, useGetPlayerTeamsQuery } from './api/statsApi';
export { formatDecimal, formatNum } from './lib/format';
export type { PlayerStats, PlayerTeam, StatsBucket } from './model/schemas';
export { ProfileStats } from './ui/ProfileStats';

/** Lazy entry for `/stats` — keeps StatsPage out of the shared barrel chunk. */
export function loadStatsPage() {
  return import('./pages/StatsPage');
}
