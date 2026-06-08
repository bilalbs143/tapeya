import { formatDecimal } from '@/lib/utils/displayUtils';

const NO_VALUE = '-';

/**
 * Converts season-stats or ranking API data into table rows for a given statType.
 *
 * @param {string} statType - 'run-scorers' | 'wicket-takers' | 'sixes' | 'fours'
 * @param {object|object[]} data - Season stats object or ranking row array
 * @param {Record<string, string>} [nameMap] - Reserved for future name overrides
 * @returns {object[]}
 */
export function buildStatsTotalRows(statType, data, nameMap = {}) {
  if (Array.isArray(data)) {
    return buildRankingStatsTotalRows(statType, data, nameMap);
  }
  return buildSeasonStatsTotalRows(statType, data, nameMap);
}

function resolveName(nameMap, name, id) {
  if (id != null && nameMap[String(id)]) return nameMap[String(id)];
  return name ?? NO_VALUE;
}

function buildSeasonStatsTotalRows(statType, stats, nameMap) {
  if (!stats) return [];

  if (statType === 'run-scorers') {
    return (stats.top_run_scorers ?? []).map((p, index) => ({
      rank: index + 1,
      playerName: resolveName(nameMap, p.name, p.id),
      mat: p.innings ?? 0,
      runs: p.runs ?? 0,
      inns: p.innings ?? 0,
      balls: p.balls_faced ?? NO_VALUE,
      hs: NO_VALUE,
      avg: formatDecimal(p.average, 2) === '—' ? NO_VALUE : formatDecimal(p.average, 2),
      sr: NO_VALUE,
      six: p.sixes ?? NO_VALUE,
      four: p.fours ?? NO_VALUE,
      '50s': NO_VALUE,
      '100s': NO_VALUE,
    }));
  }

  if (statType === 'wicket-takers') {
    return (stats.top_wicket_takers ?? []).map((p, index) => ({
      rank: index + 1,
      playerName: resolveName(nameMap, p.name, p.id),
      mat: NO_VALUE,
      wkts: p.wickets ?? 0,
      balls: NO_VALUE,
      overs: p.overs ?? NO_VALUE,
      mdns: NO_VALUE,
      runs: p.runs_conceded ?? NO_VALUE,
      inns: NO_VALUE,
      bbi: NO_VALUE,
      ave: NO_VALUE,
      econ: formatDecimal(p.economy, 2) === '—' ? NO_VALUE : formatDecimal(p.economy, 2),
      sr: NO_VALUE,
      4: NO_VALUE,
      5: NO_VALUE,
    }));
  }

  if (statType === 'fours') {
    return (stats.most_fours ?? []).map((p, index) => ({
      rank: index + 1,
      playerName: resolveName(nameMap, p.name, p.id),
      mat: p.innings ?? 0,
      inns: p.innings ?? 0,
      four: p.fours ?? 0,
    }));
  }

  return (stats.most_sixes ?? []).map((p, index) => ({
    rank: index + 1,
    playerName: resolveName(nameMap, p.name, p.id),
    mat: p.innings ?? 0,
    inns: p.innings ?? 0,
    six: p.sixes ?? 0,
  }));
}

function buildRankingStatsTotalRows(statType, rankingData, nameMap) {
  if (!Array.isArray(rankingData) || rankingData.length === 0) return [];

  if (statType === 'run-scorers') {
    return rankingData.map((p, i) => ({
      rank: i + 1,
      playerName: resolveName(nameMap, p.player?.name ?? p.name, p.player_id ?? p.id),
      mat: p.stats?.innings ?? p.innings ?? NO_VALUE,
      runs: p.stats?.runs ?? p.score ?? NO_VALUE,
      inns: p.stats?.innings ?? p.innings ?? NO_VALUE,
      balls: NO_VALUE,
      hs: NO_VALUE,
      avg: formatDecimal(p.stats?.average ?? p.average, 2) === '—' ? NO_VALUE : formatDecimal(p.stats?.average ?? p.average, 2),
      sr: NO_VALUE,
      six: NO_VALUE,
      four: NO_VALUE,
      '50s': NO_VALUE,
      '100s': NO_VALUE,
    }));
  }

  if (statType === 'wicket-takers') {
    return rankingData.map((p, i) => ({
      rank: i + 1,
      playerName: resolveName(nameMap, p.player?.name ?? p.name, p.player_id ?? p.id),
      mat: p.stats?.innings ?? p.innings ?? NO_VALUE,
      wkts: p.stats?.wickets ?? p.wickets ?? NO_VALUE,
      balls: NO_VALUE,
      overs: NO_VALUE,
      mdns: NO_VALUE,
      runs: NO_VALUE,
      inns: p.stats?.innings ?? p.innings ?? NO_VALUE,
      bbi: NO_VALUE,
      ave: NO_VALUE,
      econ: formatDecimal(p.stats?.economy ?? p.economy, 2) === '—' ? NO_VALUE : formatDecimal(p.stats?.economy ?? p.economy, 2),
      sr: NO_VALUE,
      four_wkt: NO_VALUE,
      five_wkt: NO_VALUE,
    }));
  }

  if (statType === 'sixes') {
    return rankingData.map((p, i) => ({
      rank: i + 1,
      playerName: resolveName(nameMap, p.player?.name ?? p.name, p.player_id ?? p.id),
      mat: p.stats?.innings ?? p.innings ?? NO_VALUE,
      inns: p.stats?.innings ?? p.innings ?? NO_VALUE,
      six: p.stats?.sixes ?? p.stat ?? NO_VALUE,
    }));
  }

  if (statType === 'fours') {
    return rankingData.map((p, i) => ({
      rank: i + 1,
      playerName: resolveName(nameMap, p.player?.name ?? p.name, p.player_id ?? p.id),
      mat: p.stats?.innings ?? p.innings ?? NO_VALUE,
      inns: p.stats?.innings ?? p.innings ?? NO_VALUE,
      four: p.stats?.fours ?? p.stat ?? NO_VALUE,
    }));
  }

  return [];
}
