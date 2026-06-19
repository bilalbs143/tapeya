/**
 * @param {{ teams?: Array<{ teamCode: string, name?: string, accent?: string, logoUrl?: string }> }} data
 * @param {Record<string, object>} teams
 */
export function resolveVSTeams(data, teams) {
  const [entryA, entryB] = data?.teams ?? [];
  if (!entryA?.teamCode || !entryB?.teamCode) return null;

  const teamA = teams[entryA.teamCode];
  const teamB = teams[entryB.teamCode];
  if (!teamA || !teamB) return null;

  const name = (team, override) => override ?? team.displayName ?? team.fullName ?? team.name ?? '';

  return {
    left: {
      team: teamA,
      name: name(teamA, entryA.name),
      accent: entryA.accent ?? teamA.color,
      logoUrl: entryA.logoUrl,
    },
    right: {
      team: teamB,
      name: name(teamB, entryB.name),
      accent: entryB.accent ?? teamB.color,
      logoUrl: entryB.logoUrl,
    },
  };
}
