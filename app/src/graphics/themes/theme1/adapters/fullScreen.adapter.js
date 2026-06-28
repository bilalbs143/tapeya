/**
 * Full-screen processors → Tapeya internal graphic data shapes.
 */
import { resolveBroadcastPlayerName } from '../../../core/domain/playerNameResolver';
import { assets } from '../config';
import { isNotOutBatter, resolvePlayerDisplayName } from '../primitives';
import {
  normalizeAccentColor,
  resolveCounterpartSide,
  resolvePlayerImageUrlGated,
  resolveTeamCode,
  resolveTeamColor,
  toTeamRecord,
  tournamentSub,
} from './_shared';
import { toTeams } from './teams.adapter';

/**
 * Pick the raw name field, then apply broadcast formatting (two words, long-word initials).
 *
 * @param {Record<string, unknown>} row
 */
function toBroadcastDisplayName(row) {
  return resolveBroadcastPlayerName(resolvePlayerDisplayName(row));
}

/**
 * @param {Record<string, unknown>} row
 */
function mapMatchSummaryBatterRow(row) {
  const notOut = isNotOutBatter(row);
  return {
    name: toBroadcastDisplayName(row),
    runs: row.runs ?? 0,
    balls: row.balls ?? 0,
    notOut,
  };
}

/**
 * @param {Record<string, unknown>} row
 */
function mapMatchSummaryBowlerRow(row) {
  return {
    name: toBroadcastDisplayName(row),
    wickets: row.wickets ?? 0,
    runs: row.runs ?? row.runs_conceded ?? 0,
    overs: row.overs ?? row.overs_display ?? row.oversDisplay ?? '',
  };
}

/**
 * @param {Record<string, unknown>} inn
 * @param {number} index
 */
function resolveMatchSummaryTeamCode(inn, index) {
  return inn.batting_team ?? inn.team_code ?? inn.teamCode ?? (index === 0 ? 'home' : 'away');
}

/**
 * @param {Record<string, unknown>} inn
 * @param {string} teamCode
 * @param {Record<string, object>|null|undefined} teams
 * @param {Record<string, unknown>|null|undefined} crests
 */
function resolveMatchSummaryInningsAccent(inn, teamCode, teams, crests) {
  const fromInnings = normalizeAccentColor(inn.accent, '');
  if (fromInnings) return fromInnings;

  const fromTeam = normalizeAccentColor(teams?.[teamCode]?.color, '');
  if (fromTeam) return fromTeam;

  for (const crest of crests ? [crests.top, crests.bottom] : []) {
    if (!crest?.teamCode || String(crest.teamCode) !== String(teamCode)) continue;
    const fromCrest = normalizeAccentColor(crest.accent, '');
    if (fromCrest) return fromCrest;
  }

  return '#5b7cff';
}

/**
 * @param {Record<string, unknown>} props
 */
function hasMatchSummaryPreviewInnings(props) {
  const first = Array.isArray(props.innings) ? props.innings[0] : null;
  if (!first || typeof first !== 'object') return false;
  return Boolean(first.batsmen || first.top_batters || first.top_batsmen || first.bowlers || first.top_bowlers);
}

/**
 * @param {Record<string, unknown>} row
 */
function mapBattingSummaryRow(row) {
  const name = toBroadcastDisplayName(row);
  const status = row.status ?? 'yet_to_bat';
  if (row.yetToBat || (status === 'yet_to_bat' && row.runs == null)) {
    return { name, yetToBat: true };
  }
  const notOut = isNotOutBatter(row);
  return {
    name,
    dismissal: notOut ? 'NOT OUT' : (row.dismissal_text ?? row.dismissalText ?? row.dismissal ?? 'OUT'),
    runs: row.runs ?? 0,
    balls: row.balls ?? 0,
    notOut,
  };
}

/**
 * @param {Array<Record<string, unknown>>} order
 */
function mapBattingOrderRows(order) {
  return order.map(mapBattingSummaryRow);
}

/**
 * @param {Array<Record<string, unknown>>} bowlers
 */
function mapBowlers(bowlers) {
  return bowlers.map((b) => ({
    name: toBroadcastDisplayName(b),
    overs: b.overs ?? b.overs_display ?? b.oversDisplay ?? '',
    dots: b.dots ?? 0,
    runs: b.runs ?? b.runs_conceded ?? 0,
    wickets: b.wickets ?? 0,
    eco: b.economy ?? b.eco ?? '',
  }));
}

/**
 * @param {Array<Record<string, unknown>>|undefined} fow
 */
function formatFallOfWicketsLabel(fow) {
  if (!Array.isArray(fow) || !fow.length) return 'FALL OF WICKETS';
  const parts = fow
    .map((w) => {
      const score = w.score_at_dismissal ?? w.score ?? '';
      const wkt = w.wicket_number ?? w.wicket ?? '';
      return score ? `${wkt}-${score}` : null;
    })
    .filter(Boolean);
  return parts.length ? `FALL OF WICKETS : ${parts.join(', ')}` : 'FALL OF WICKETS';
}

/**
 * @param {Record<string, unknown>} props
 * @param {string} defaultCode
 * @param {import('../../../types.js').ThemeTokens|undefined} tokens
 */
function fixtureTeamRecord(props, defaultCode, tokens) {
  const code = String(props.teamCode ?? defaultCode);
  const title = props.title ?? code.toUpperCase();
  const accent = props.accent || (defaultCode === 'bowling' ? tokens?.awayBgColor : tokens?.homeBgColor) || 'var(--accentA)';

  return {
    code: code.toUpperCase(),
    name: code.toUpperCase(),
    fullName: title,
    displayName: title,
    introName: title,
    color: accent,
    logoUrl: props.crestLogoUrl ?? props.logoUrl ?? null,
  };
}

/**
 * @param {Record<string, unknown>} props
 * @param {import('../../../types.js').ThemeTokens|undefined} tokens
 */
export function toBattingSummaryBundle(props, tokens) {
  if (props.title && Array.isArray(props.batsmen) && props.batsmen.length && !Array.isArray(props.battingOrder)) {
    const code = String(props.teamCode ?? 'batting');
    const team = fixtureTeamRecord(props, code, tokens);

    const side = props.battingTeamSide ?? 'home';
    return {
      teams: { [code]: team },
      data: {
        teamCode: code,
        title: props.title,
        sub: tournamentSub(props),
        accent: team.color,
        accentAlt: resolveTeamColor(resolveCounterpartSide(side), tokens),
        crestLogoUrl: props.crestLogoUrl ?? props.logoUrl ?? null,
        scoreStrip: props.scoreStrip ?? {},
        batsmen: props.batsmen.map(mapBattingSummaryRow),
      },
    };
  }

  const battingOrder = Array.isArray(props.battingOrder) ? props.battingOrder : [];
  if (!battingOrder.length) return null;

  const battingTeam = props.battingTeam ?? {};
  const code = 'batting';
  const side = props.battingTeamSide ?? null;
  const theme1Team = toTeamRecord(battingTeam, code, tokens, side);
  const teams = { [code]: theme1Team };

  return {
    teams,
    data: {
      teamCode: code,
      title: battingTeam.name ?? theme1Team.displayName,
      sub: tournamentSub(props),
      accent: theme1Team.color,
      accentAlt: resolveTeamColor(resolveCounterpartSide(side), tokens),
      crestLogoUrl: props.teamLogoUrl ?? battingTeam.logoUrl ?? null,
      scoreStrip: {
        extras: props.inningsExtras ?? 0,
        overs: props.inningsOvers ?? '',
        total: props.inningsScore ?? '',
      },
      batsmen: mapBattingOrderRows(battingOrder),
    },
  };
}

/**
 * @param {Record<string, unknown>} props
 * @param {import('../../../types.js').ThemeTokens|undefined} tokens
 */
export function toBowlingSummaryBundle(props, tokens) {
  if (props.title && Array.isArray(props.bowlers) && props.bowlers.length && !props.bowlingTeam) {
    const code = String(props.teamCode ?? 'bowling');
    const side = props.bowlingTeamSide ?? 'away';
    const team = fixtureTeamRecord(props, code, tokens);

    return {
      teams: { [code]: team },
      data: {
        teamCode: code,
        title: props.title,
        sub: tournamentSub(props),
        accent: team.color,
        accentAlt: resolveTeamColor(resolveCounterpartSide(side), tokens),
        accentSecondary: props.accentSecondary,
        crestLogoUrl: props.crestLogoUrl ?? props.logoUrl ?? null,
        fallOfWicketsLabel: props.fallOfWicketsLabel ?? 'FALL OF WICKETS',
        scoreStrip: props.scoreStrip ?? {},
        bowlers: props.bowlers,
      },
    };
  }

  const bowlers = Array.isArray(props.bowlers) ? props.bowlers : [];
  if (!bowlers.length) return null;

  const bowlingTeam = props.bowlingTeam ?? {};
  const code = 'bowling';
  const side = props.bowlingTeamSide ?? null;
  const theme1Team = toTeamRecord(bowlingTeam, code, tokens, side);
  const teams = { [code]: theme1Team };

  return {
    teams,
    data: {
      teamCode: code,
      title: bowlingTeam.name ?? theme1Team.displayName,
      sub: tournamentSub(props),
      accent: theme1Team.color,
      accentAlt: resolveTeamColor(resolveCounterpartSide(side), tokens),
      crestLogoUrl: props.teamLogoUrl ?? bowlingTeam.logoUrl ?? null,
      fallOfWicketsLabel: formatFallOfWicketsLabel(props.fallOfWickets),
      scoreStrip: {
        extras: props.inningsExtras ?? 0,
        overs: props.inningsOvers ?? '',
        total: props.inningsScore ?? '',
      },
      bowlers: mapBowlers(bowlers),
    },
  };
}

/**
 * @param {Record<string, unknown>} props
 * @param {import('../../../types.js').ThemeTokens|undefined} tokens
 */
export function toInningFiguresBundle(props, tokens) {
  if (props.title && props.score != null && typeof props.innings === 'string' && !props.matchHeader) {
    const code = String(props.teamCode ?? 'batting');
    const team = fixtureTeamRecord(props, code, tokens);

    return {
      teams: { [code]: team },
      data: {
        teamCode: code,
        accent: team.color,
        title: props.title,
        sub: tournamentSub(props),
        logoUrl: props.logoUrl ?? team.logoUrl ?? assets.brandLogoWhite,
        score: props.score,
        innings: props.innings,
        wickets: props.wickets ?? 0,
        overs: props.overs ?? '',
        requiredRR: props.requiredRR ?? '',
      },
    };
  }

  const innings = props.innings ?? {};
  const battingTeam = props.battingTeam ?? {};
  const teams = toTeams(props, tokens);
  const code = teams ? (resolveTeamCode(battingTeam, teams) ?? 'batting') : 'batting';
  const theme1Team = teams?.[code] ?? toTeamRecord(battingTeam, code, tokens, props.battingTeamSide ?? null);

  return {
    teams: teams ?? { [code]: theme1Team },
    data: {
      teamCode: code,
      accent: theme1Team.color,
      title: props.matchHeader ?? '',
      sub: tournamentSub(props),
      logoUrl: props.teamLogoUrl ?? battingTeam.logoUrl ?? assets.brandLogoWhite,
      score: innings.runs ?? 0,
      innings: innings.innings_number_label ?? '1ST',
      wickets: innings.wickets ?? 0,
      overs: innings.overs_display ?? '',
      requiredRR: innings.required_run_rate != null ? String(innings.required_run_rate) : '',
    },
  };
}

/**
 * @param {Record<string, unknown>} props
 * @param {import('../../../types.js').ThemeTokens|undefined} tokens
 */
export function toNeedTargetBundle(props, tokens) {
  const teams = toTeams(props, tokens);
  if (!teams) return null;

  const battingCode = teams.batting ? 'batting' : (resolveTeamCode(props.battingTeam, teams) ?? 'home');
  const bowlingCode = teams.bowling ? 'bowling' : (resolveTeamCode(props.bowlingTeam, teams) ?? 'away');
  const batting = teams[battingCode];
  const bowling = teams[bowlingCode];

  return {
    teams,
    data: {
      headerTitle: `${batting?.displayName ?? ''} VS ${bowling?.displayName ?? ''}`.trim(),
      sub: tournamentSub(props),
      teamCode: battingCode,
      accent: batting?.color,
      logoUrl: props.tournamentLogoUrl ?? assets.brandLogoWhite,
      title: `${batting?.displayName ?? 'TEAM'} TO WIN`,
      runsNeeded: props.runsToWin ?? 0,
      ballsRemaining: props.ballsRemaining ?? 0,
      wicketsRemaining: props.wicketsRemaining ?? 0,
    },
  };
}

/**
 * @param {Record<string, unknown>} props
 */
function resolvePartnershipBatters(props) {
  const striker = props.striker ?? {};
  const nonStriker = props.nonStriker ?? {};
  if (striker.name || nonStriker.name) {
    return { striker, nonStriker };
  }

  const batters = Array.isArray(props.batters) ? props.batters : [];
  const onStrike = batters.find((b) => b.onStrike) ?? batters[0] ?? {};
  const other = batters.find((b) => !b.onStrike && b !== onStrike) ?? batters[1] ?? {};

  return { striker: onStrike, nonStriker: other };
}

/**
 * @param {Record<string, unknown>} batter
 * @param {{ align?: string, notOut?: boolean }} [options]
 * @param {import('../../../types.js').ThemeTokens|null|undefined} [tokens]
 */
function mapPartnershipBatterRow(batter, options = {}, tokens) {
  return {
    fullName: toBroadcastDisplayName(batter),
    runs: batter.runs ?? 0,
    balls: batter.balls ?? 0,
    align: options.align ?? batter.align ?? 'start',
    notOut: options.notOut ?? Boolean(batter.notOut ?? isNotOutBatter(batter)),
    avatarUrl: resolvePlayerImageUrlGated(batter, tokens),
  };
}

/**
 * @param {Record<string, unknown>} props
 * @param {import('../../../types.js').ThemeTokens|undefined} tokens
 */
export function toPartnershipBundle(props, tokens) {
  if (
    props.title &&
    props.partnership &&
    Array.isArray(props.batters) &&
    props.batters.length >= 2 &&
    props.partnershipRuns == null
  ) {
    const code = String(props.teamCode ?? 'batting');
    const team = fixtureTeamRecord(props, code, tokens);

    return {
      teams: { [code]: team },
      data: {
        teamCode: code,
        title: props.title,
        sub: tournamentSub(props),
        accent: team.color,
        logoUrl: props.logoUrl ?? team.logoUrl ?? assets.brandLogoWhite,
        defaultAvatarUrl: props.defaultAvatarUrl ?? null,
        partnership: props.partnership,
        batters: props.batters.map((batter, index) =>
          mapPartnershipBatterRow(
            batter,
            {
              align: index === 0 ? 'start' : 'end',
              notOut: batter.notOut ?? true,
            },
            tokens,
          ),
        ),
      },
    };
  }

  const teams = toTeams(props, tokens);
  if (!teams) return null;

  const battingTeam = props.battingTeam ?? {};
  const code = teams.batting ? 'batting' : (resolveTeamCode(battingTeam, teams) ?? 'home');
  const theme1Team = teams[code] ?? toTeamRecord(battingTeam, code, tokens, props.battingTeamSide ?? null);
  const { striker, nonStriker } = resolvePartnershipBatters(props);

  const batters = [
    mapPartnershipBatterRow(striker, { align: 'start', notOut: true }, tokens),
    mapPartnershipBatterRow(nonStriker, { align: 'end', notOut: true }, tokens),
  ].filter((b) => b.fullName);

  if (batters.length < 2) return null;

  return {
    teams,
    data: {
      title: battingTeam.name ?? theme1Team.displayName,
      sub: tournamentSub(props),
      teamCode: code,
      accent: theme1Team.color,
      logoUrl: props.tournamentLogoUrl ?? assets.brandLogoWhite,
      defaultAvatarUrl: props.defaultAvatarUrl ?? assets.playerPlaceholder,
      partnership: {
        runs: props.partnershipRuns ?? 0,
        balls: props.partnershipBalls ?? 0,
      },
      batters,
    },
  };
}

/**
 * Resolve batter rows for a partnership history entry (broadcast API + legacy shapes).
 * @param {Record<string, unknown>} entry
 * @returns {Array<Record<string, unknown>>}
 */
function partnershipEntryBatters(entry) {
  if (Array.isArray(entry.batters) && entry.batters.length >= 2) {
    return entry.batters;
  }

  if (entry.batter1_display_name || entry.batter2_display_name) {
    return [
      {
        display_name: entry.batter1_display_name,
        runs: entry.batter1_runs,
        balls: entry.batter1_balls ?? entry.player_1_balls,
        avatar_url: entry.batter1_avatar_url ?? null,
      },
      {
        display_name: entry.batter2_display_name,
        runs: entry.batter2_runs,
        balls: entry.batter2_balls ?? entry.player_2_balls,
        avatar_url: entry.batter2_avatar_url ?? null,
      },
    ].filter((b) => resolvePlayerDisplayName(b));
  }

  return [entry.batter_one ?? entry.batter1, entry.batter_two ?? entry.batter2].filter(Boolean);
}

/**
 * @param {Array<Record<string, unknown>>} partnerships
 * @param {string} accent
 * @param {import('../../../types.js').ThemeTokens|null|undefined} [tokens]
 */
function mapPartnershipHistory(partnerships, accent, tokens) {
  return partnerships
    .map((entry) => {
      const batters = partnershipEntryBatters(entry);

      return {
        batters: batters.map((b, index) => ({
          fullName: toBroadcastDisplayName(b),
          runs: b.runs ?? 0,
          balls: b.balls ?? 0,
          accent: index === 0 ? accent : '#f5c85a',
          align: index === 1 ? 'right' : undefined,
          avatarUrl: resolvePlayerImageUrlGated(b, tokens),
        })),
      };
    })
    .filter((entry) => entry.batters.length >= 2);
}

/**
 * @param {Record<string, unknown>} props
 * @param {import('../../../types.js').ThemeTokens|undefined} tokens
 */
export function toPartnershipListBundle(props, tokens) {
  const rawPartnerships = Array.isArray(props.partnerships) ? props.partnerships : [];
  if (!rawPartnerships.length) return null;

  const battingTeam = props.battingTeam ?? {};
  const code = 'batting';
  const theme1Team = toTeamRecord(battingTeam, code, tokens, props.battingTeamSide ?? null);
  const teams = { [code]: theme1Team };
  const partnerships = mapPartnershipHistory(rawPartnerships, theme1Team.color, tokens);
  if (!partnerships.length) return null;

  return {
    teams,
    data: {
      teamCode: code,
      title: battingTeam.name ?? theme1Team.displayName,
      sub: tournamentSub(props),
      accent: theme1Team.color,
      crestLogoUrl: battingTeam.logoUrl ?? null,
      leagueLogoUrl: props.tournamentLogoUrl ?? assets.brandLogoWhite,
      scoreStrip: {
        extras: props.inningsExtras ?? 0,
        overs: props.inningsOvers ?? props.battingTeam?.overs ?? '',
        total: props.inningsScore ?? props.battingTeam?.score ?? '',
      },
      partnerships,
    },
  };
}

/**
 * @param {Record<string, unknown>} props
 * @param {import('../../../types.js').ThemeTokens|undefined} tokens
 * @param {Record<string, unknown>} crests
 */
function buildMatchSummaryTeamsMap(props, tokens, crests) {
  /** @type {Record<string, object>} */
  const teams = {};
  const sideTeams = props.homeTeam && props.awayTeam ? toTeams(props, tokens) : null;
  if (sideTeams) {
    teams.home = sideTeams.home;
    teams.away = sideTeams.away;
  }

  for (const crest of [crests.top, crests.bottom]) {
    if (!crest?.teamCode) continue;
    const code = String(crest.teamCode);
    teams[code] = {
      code: code.toUpperCase(),
      name: code.toUpperCase(),
      fullName: code.toUpperCase(),
      displayName: code.toUpperCase(),
      color: normalizeAccentColor(crest.accent, 'var(--accentA)'),
      logoUrl: crest.crestLogoUrl ?? null,
    };
  }

  for (const inn of props.innings ?? []) {
    const code = String(inn.teamCode ?? '');
    if (!code || teams[code]) continue;
    teams[code] = {
      code: code.toUpperCase(),
      name: inn.shortName ?? code.toUpperCase(),
      fullName: inn.shortName ?? code.toUpperCase(),
      displayName: inn.shortName ?? code.toUpperCase(),
      color: resolveMatchSummaryInningsAccent(inn, code, teams, crests),
      logoUrl: null,
    };
  }

  return teams;
}

/**
 * @param {Array<Record<string, unknown>>} inningsRaw
 * @param {Record<string, object>} teams
 * @param {Record<string, unknown>} crests
 */
function mapMatchSummaryInningsList(inningsRaw, teams, crests) {
  return inningsRaw.map((inn, index) => {
    const teamCode = resolveMatchSummaryTeamCode(inn, index);
    const team = teams[teamCode];
    return {
      teamCode,
      shortName: inn.shortName ?? inn.short_name ?? inn.team_name ?? inn.batting_team_name ?? team?.displayName ?? '',
      accent: resolveMatchSummaryInningsAccent(inn, teamCode, teams, crests),
      total: inn.total ?? inn.runs ?? inn.total_runs ?? 0,
      wickets: inn.wickets ?? inn.total_wickets ?? 0,
      overs: inn.overs ?? inn.overs_display ?? '',
      batsmen: (inn.batsmen ?? inn.top_batsmen ?? inn.top_batters ?? []).map(mapMatchSummaryBatterRow),
      bowlers: (inn.bowlers ?? inn.top_bowlers ?? []).map(mapMatchSummaryBowlerRow),
    };
  });
}

/**
 * @param {Record<string, unknown>} crests
 * @param {Record<string, object>} teams
 * @param {Record<string, unknown>} props
 */
function buildMatchSummaryCrestsPayload(crests, teams, props) {
  return {
    top: {
      teamCode: 'home',
      accent: normalizeAccentColor(crests.top?.accent ?? teams.home?.color),
      crestLogoUrl: props.homeTeam?.logoUrl ?? teams.home?.logoUrl ?? crests.top?.crestLogoUrl,
    },
    bottom: {
      teamCode: 'away',
      accent: normalizeAccentColor(crests.bottom?.accent ?? teams.away?.color, 'var(--accentB)'),
      crestLogoUrl: props.awayTeam?.logoUrl ?? teams.away?.logoUrl ?? crests.bottom?.crestLogoUrl,
    },
  };
}

/**
 * @param {Record<string, unknown>} props
 * @param {import('../../../types.js').ThemeTokens|undefined} tokens
 */
export function toMatchSummaryBundle(props, tokens) {
  const inningsRaw = Array.isArray(props.innings) ? props.innings : [];
  if (!inningsRaw.length) return null;

  if (props.crests && hasMatchSummaryPreviewInnings(props)) {
    const teams = buildMatchSummaryTeamsMap(props, tokens, props.crests);
    return {
      teams,
      data: {
        sub: tournamentSub(props),
        needTargetLabel: props.needTargetLabel ?? props.footerLine ?? '',
        crests: props.crests,
        innings: mapMatchSummaryInningsList(inningsRaw, teams, props.crests),
      },
    };
  }

  const teams = toTeams(props, tokens);
  if (!teams) return null;

  const crests = props.crests ?? {
    top: {
      teamCode: 'home',
      accent: normalizeAccentColor(teams.home?.color),
      crestLogoUrl: props.homeTeam?.logoUrl ?? teams.home?.logoUrl,
    },
    bottom: {
      teamCode: 'away',
      accent: normalizeAccentColor(teams.away?.color, 'var(--accentB)'),
      crestLogoUrl: props.awayTeam?.logoUrl ?? teams.away?.logoUrl,
    },
  };

  return {
    teams,
    data: {
      sub: tournamentSub(props),
      needTargetLabel: props.footerLine ?? '',
      crests: buildMatchSummaryCrestsPayload(crests, teams, props),
      innings: mapMatchSummaryInningsList(inningsRaw, teams, crests),
    },
  };
}

/**
 * @param {unknown} player
 */
function formatXiPlayerName(player) {
  if (typeof player === 'string') return resolveBroadcastPlayerName(player);
  const p = player ?? {};
  const name = resolveBroadcastPlayerName(p.name ?? p.display_name ?? '');
  const tags = [];
  if (p.is_captain ?? p.captain) tags.push('C');
  if (p.is_wicket_keeper ?? p.wicketKeeper) tags.push('WK');
  return tags.length ? `${name} (${tags.join('/')})` : name;
}

/**
 * @param {Record<string, unknown>} props
 * @param {import('../../../types.js').ThemeTokens|undefined} tokens
 */
export function toPlaying11Bundle(props, tokens) {
  if (Array.isArray(props.teams) && props.teams.length >= 2) {
    /** @type {Record<string, object>} */
    const teams = {};
    const panels = props.teams.slice(0, 2).map((entry, index) => {
      const teamCode = String(entry.teamCode ?? (index === 0 ? 'home' : 'away'));
      const fallbackAccent = teamCode === 'away' || index === 1 ? 'var(--accentB)' : 'var(--accentA)';
      const accent = normalizeAccentColor(entry.accent, fallbackAccent);
      const name = entry.name ?? entry.title ?? teamCode.toUpperCase();

      teams[teamCode] = {
        code: teamCode.toUpperCase(),
        name,
        fullName: name,
        displayName: name,
        color: accent,
        logoUrl: entry.logoUrl ?? null,
      };

      return {
        teamCode,
        name,
        accent,
        logoUrl: entry.logoUrl ?? null,
        players: Array.isArray(entry.players) ? entry.players.map(formatXiPlayerName) : [],
      };
    });

    if (panels[0]?.players?.length && panels[1]?.players?.length) {
      return {
        teams,
        data: {
          title: props.title ?? 'PLAYING XI',
          sub: tournamentSub(props),
          logoUrl: props.tournamentLogoUrl ?? props.logoUrl ?? assets.brandLogoWhite,
          requiredRR: props.requiredRR ?? props.requiredRunRate ?? '',
          teams: panels,
        },
      };
    }
  }

  const teams = toTeams(props, tokens);
  if (!teams?.home || !teams?.away) return null;

  const homePlayers = Array.isArray(props.homeTeam?.players) ? props.homeTeam.players : [];
  const awayPlayers = Array.isArray(props.awayTeam?.players) ? props.awayTeam.players : [];
  if (!homePlayers.length || !awayPlayers.length) return null;

  return {
    teams,
    data: {
      title: 'PLAYING XI',
      sub: tournamentSub(props),
      logoUrl: props.tournamentLogoUrl ?? assets.brandLogoWhite,
      requiredRR: props.requiredRunRate ?? props.requiredRR ?? '',
      teams: [
        {
          teamCode: 'home',
          name: props.homeTeam?.name ?? teams.home.displayName,
          accent: normalizeAccentColor(props.homeTeam?.accent ?? teams.home.color, 'var(--accentA)'),
          logoUrl: props.homeTeam?.logoUrl ?? teams.home.logoUrl,
          players: homePlayers.map(formatXiPlayerName),
        },
        {
          teamCode: 'away',
          name: props.awayTeam?.name ?? teams.away.displayName,
          accent: normalizeAccentColor(props.awayTeam?.accent ?? teams.away.color, 'var(--accentB)'),
          logoUrl: props.awayTeam?.logoUrl ?? teams.away.logoUrl,
          players: awayPlayers.map(formatXiPlayerName),
        },
      ],
    },
  };
}
