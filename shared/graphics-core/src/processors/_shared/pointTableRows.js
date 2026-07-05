/** @typedef {import('../../types.js').GraphicSessionSnapshot} GraphicSessionSnapshot */

/**
 * @param {unknown} rawRow
 * @param {number} index
 */
export function normalizePointTableRow(rawRow, index) {
  const row = /** @type {Record<string, any>} */ (rawRow);
  const nrrRaw = row.nrr ?? row.net_run_rate ?? row.netRunRate;
  let nrr = null;
  if (nrrRaw != null && nrrRaw !== '') {
    const parsed = Number(nrrRaw);
    nrr = Number.isFinite(parsed) ? parsed : null;
  }

  const nr = row.nr ?? row.no_result ?? row.noResult ?? 0;

  return {
    rank: row.rank ?? index + 1,
    code: row.code ?? row.team_code ?? row.teamCode ?? String(row.team_id ?? row.teamId ?? index + 1),
    name: row.name ?? row.team_name ?? row.teamName ?? '',
    played: row.played ?? 0,
    won: row.won ?? 0,
    lost: row.lost ?? 0,
    nr,
    pts: row.pts ?? row.points ?? 0,
    nrr,
    accent: row.accent ?? null,
  };
}

/**
 * @param {GraphicSessionSnapshot} snapshot
 * @param {unknown} payloadRows
 */
export function pointTableRowsFromSnapshot(snapshot, payloadRows) {
  if (Array.isArray(payloadRows) && payloadRows.length > 0) {
    return payloadRows.map(normalizePointTableRow);
  }

  const payloadStandings = snapshot.payload?.standings;
  if (Array.isArray(payloadStandings) && payloadStandings.length > 0) {
    return payloadStandings.map(normalizePointTableRow);
  }

  const liveStandings = snapshot.live?.standings;
  if (Array.isArray(liveStandings) && liveStandings.length > 0) {
    return liveStandings.map(normalizePointTableRow);
  }

  return [];
}
