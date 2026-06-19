/** @typedef {import('../../../types.js').GraphicSessionSnapshot} GraphicSessionSnapshot */

/**
 * Live scoreboard block shared by most lower-third commands.
 *
 * @param {GraphicSessionSnapshot} snapshot
 */
export function scoreboardBase(snapshot) {
  const { live } = snapshot;

  return {
    commandKey: snapshot.commandKey,
    battingTeam: live.battingTeam,
    bowlingTeam: live.bowlingTeam,
    batters: live.batters,
    bowler: live.bowler,
    currentOverDeliveries: live.currentOverDeliveries ?? [],
    extras: live.battingTeam?.extras ?? 0,
    currentRR: live.currentRR ?? '',
    requiredRR: live.requiredRR ?? '',
  };
}
