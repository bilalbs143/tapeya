import { buildChartSeries, buildPhaseChartProps } from './_shared/chartSeries';
import { buildMatchContext, tournamentLabelOnly, withMatchTeams } from './_shared/matchContext';
import { processMatchIntro } from './tournament.processors';

/**
 * Cross-reference an explicit-payload XI player against the live squad by name to
 * backfill captain / wicket-keeper flags — the payload XI only ever carries
 * name/role/batting/bowling style, while those flags live on the squad record.
 *
 * @param {Record<string, any>} player
 * @param {Map<string, Record<string, any>>} squadByName
 */
function withSquadRoleFlags(player, squadByName) {
  const name = String(player?.name ?? player?.display_name ?? '').toLowerCase();
  const squadMatch = name ? squadByName.get(name) : null;
  if (!squadMatch) return player;

  return {
    ...player,
    is_captain: player?.is_captain ?? player?.captain ?? squadMatch.is_captain,
    is_wicket_keeper: player?.is_wicket_keeper ?? player?.wicketKeeper ?? squadMatch.is_wicket_keeper,
  };
}

/**
 * Prefer explicit payload XI when non-empty; otherwise use live squad from context.
 *
 * @param {{ players?: unknown[] }|null|undefined} payloadTeam
 * @param {unknown[]} squad
 */
function resolvePlayingElevenPlayers(payloadTeam, squad) {
  const payloadPlayers = payloadTeam?.players;
  if (Array.isArray(payloadPlayers) && payloadPlayers.length > 0) {
    const squadByName = new Map(
      (Array.isArray(squad) ? squad : []).map((s) => [String(s?.display_name ?? s?.name ?? '').toLowerCase(), s]),
    );
    return payloadPlayers.map((player) => withSquadRoleFlags(player, squadByName));
  }

  return Array.isArray(squad) ? squad : [];
}

/**
 * Batting Squad FS — shows the batting team's squad grid.
 * @type {import('../types.js').GraphicProcessor}
 */
export function processBattingSquad(snapshot) {
  const { live } = snapshot;
  const mc = buildMatchContext(snapshot);
  const isBattingHome = live.battingTeamSide === 'home';
  const squad = isBattingHome ? live.squadHome : live.squadAway;
  const team = isBattingHome ? mc.homeTeam : mc.awayTeam;

  return {
    team,
    teamSide: isBattingHome ? 'home' : 'away',
    tournamentLabel: tournamentLabelOnly(snapshot),
    players: Array.isArray(squad) ? squad : [],
    requiredRunRate: live.requiredRR ?? '',
  };
}

/**
 * Bowling Squad FS — shows the bowling (fielding) team's squad grid.
 * @type {import('../types.js').GraphicProcessor}
 */
export function processBowlingSquad(snapshot) {
  const { live } = snapshot;
  const mc = buildMatchContext(snapshot);
  const isBowlingHome = live.battingTeamSide !== 'home';
  const squad = isBowlingHome ? live.squadHome : live.squadAway;
  const team = isBowlingHome ? mc.homeTeam : mc.awayTeam;

  return {
    team,
    teamSide: isBowlingHome ? 'home' : 'away',
    tournamentLabel: tournamentLabelOnly(snapshot),
    players: Array.isArray(squad) ? squad : [],
    requiredRunRate: live.requiredRR ?? '',
  };
}

/** @type {import('../types.js').GraphicProcessor} */
export function processBowlingSummary(snapshot) {
  const { live, tournament } = snapshot;
  const p = /** @type {Record<string, any>} */ (snapshot.payload ?? {});

  return {
    bowlingTeam: live.bowlingTeam,
    // bowling side is the opposite of batting
    bowlingTeamSide: live.battingTeamSide === 'home' ? 'away' : 'home',
    tournamentLabel: tournamentLabelOnly(snapshot),
    bowlers: Array.isArray(p.bowlers) && p.bowlers.length > 0 ? p.bowlers : live.bowlers,
    fallOfWickets: Array.isArray(p.fall_of_wickets) && p.fall_of_wickets.length > 0 ? p.fall_of_wickets : live.fallOfWickets,
    inningsExtras: live.battingTeam?.extras ?? 0,
    inningsOvers: live.battingTeam?.overs ?? '',
    inningsScore: live.battingTeam?.score ?? '',
    teamLogoUrl: p.team_logo_url ?? live.bowlingTeam?.logoUrl ?? tournament.logoUrl,
  };
}

/** @type {import('../types.js').GraphicProcessor} */
export function processNextMatch(snapshot) {
  const p = /** @type {Record<string, any>} */ (snapshot.payload ?? {});
  const fixture = /** @type {Record<string, any>|null} */ (p.fixture ?? p.next_match ?? snapshot.nextMatchFixture ?? null);

  if (fixture && typeof fixture === 'object') {
    return {
      homeTeam: {
        name: fixture.home_team?.display_name ?? fixture.home_team?.name ?? '',
        shortCode: fixture.home_team?.short_code ?? '',
        logoUrl: fixture.home_team?.logo_url ?? null,
      },
      awayTeam: {
        name: fixture.away_team?.display_name ?? fixture.away_team?.name ?? '',
        shortCode: fixture.away_team?.short_code ?? '',
        logoUrl: fixture.away_team?.logo_url ?? null,
      },
      matchNumber: fixture.match_number ?? '',
      venue: fixture.venue_name ?? '',
      venueDisplayLine: fixture.venue_display_line ?? '',
      tournamentName: snapshot.tournament?.name ?? '',
    };
  }

  return processMatchIntro(snapshot);
}

/** @type {import('../types.js').GraphicProcessor} */
export function processPlaying11(snapshot) {
  const mc = buildMatchContext(snapshot);
  const p = /** @type {Record<string, any>} */ (snapshot.payload ?? {});
  const { live } = snapshot;

  return {
    homeTeam: {
      ...mc.homeTeam,
      name: p.home_team?.name ?? mc.homeTeam.name,
      players: resolvePlayingElevenPlayers(p.home_team, live.squadHome),
    },
    awayTeam: {
      ...mc.awayTeam,
      name: p.away_team?.name ?? mc.awayTeam.name,
      players: resolvePlayingElevenPlayers(p.away_team, live.squadAway),
    },
    tournamentLabel: tournamentLabelOnly(snapshot),
    requiredRunRate: live.requiredRR ?? '',
    side: 'both',
  };
}

/**
 * @param {'cumulative'|'runs'|'run_rate'} mode
 * @returns {import('../types.js').GraphicProcessor}
 */
function createChartProcessor(mode) {
  return (snapshot) => {
    const { teams, chartSeries, summaryCards, overCategories, yAxisMax } = buildChartSeries(snapshot.live.inningsChart, mode);

    return withMatchTeams(snapshot, {
      commandKey: snapshot.commandKey,
      chartMode: mode,
      teams,
      chartSeries,
      summaryCards,
      overCategories,
      yAxisMax,
      tournamentLabel: tournamentLabelOnly(snapshot),
    });
  };
}

/** @type {import('../types.js').GraphicProcessor} */
export const processWorm = createChartProcessor('cumulative');

/** @type {import('../types.js').GraphicProcessor} */
export function processManhattan(snapshot) {
  const phase = buildPhaseChartProps(snapshot.live.inningsChart, { showWicketBadges: true });

  return withMatchTeams(snapshot, {
    commandKey: snapshot.commandKey,
    chartMode: 'phase',
    ...phase,
    tournamentLabel: tournamentLabelOnly(snapshot),
    showWicketBadges: true,
  });
}

/** @type {import('../types.js').GraphicProcessor} */
export const processRunRateChart = createChartProcessor('run_rate');
