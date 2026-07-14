/**
 * FOW processors → FallOfWicketsLTBar data shape.
 */
import { BROADCAST_NAME_STYLE } from '@tapeya/graphics-core/domain/playerNameResolver';

import {
  coalescePlayerImageUrlGated,
  parseInningsScore,
  resolveFsNameParts,
  resolveLtNameParts,
  resolveLtPlayerName,
  resolvePlayerImageUrlGated,
  resolveTeamCode,
  toTeamRecord,
  tournamentSub,
} from './_shared';
import { toTeams } from './teams.adapter';

function formatDismissal(value) {
  const text = String(value ?? '').trim();
  return text ? text.toUpperCase() : '';
}

/**
 * @param {Record<string, unknown>} props
 * @param {import('../../../types.js').ThemeTokens|undefined} tokens
 */
export function toFallOfWicketsData(props, tokens) {
  const teams = toTeams(props, tokens);
  if (!teams) return null;

  const batting = props.battingTeam ?? {};
  const wickets = Array.isArray(props.wickets) ? props.wickets : [];
  if (!wickets.length) return null;

  const parsedScore = parseInningsScore(batting.score, batting.wickets);
  if (!parsedScore) return null;
  const { total, wkts, scoreSep } = parsedScore;
  const battingCode = teams.batting ? 'batting' : (resolveTeamCode(batting, teams) ?? 'home');

  return {
    teams,
    data: {
      battingTeamCode: battingCode,
      teamLabel: batting.shortCode ?? batting.name ?? teams[battingCode]?.code,
      oversText: batting.overs ? `${batting.overs} OVER` : '',
      total,
      wkts,
      scoreSep,
      wickets: wickets.map((w, index) => ({
        number: w.number ?? w.wicket_number ?? index + 1,
        score: w.score ?? w.runs ?? '—',
        batter: resolveLtPlayerName(wicketBatterName(w)),
      })),
    },
  };
}

/**
 * @param {Record<string, unknown>} props
 * @param {import('../../../types.js').ThemeTokens|undefined} tokens
 * @param {import('@tapeya/graphics-core/domain/playerNameResolver').BroadcastNameStyle} nameStyle
 */
function previewLastWicketBatter(props, tokens, nameStyle) {
  if (!props.firstName && !props.name) return null;

  let teams = toTeams(props, tokens);
  const code = String(props.teamCode ?? 'home');
  if (!teams) {
    teams = {
      home: toTeamRecord(props.homeTeam ?? {}, 'home', tokens, 'home'),
      away: toTeamRecord(props.awayTeam ?? {}, 'away', tokens, 'away'),
    };
  }

  const theme1Team =
    teams[code] ??
    toTeamRecord(
      props.homeTeam ?? props.awayTeam ?? { name: code },
      code,
      tokens,
      code === 'home' || code === 'away' ? code : null,
    );
  const resolveParts = nameStyle === BROADCAST_NAME_STYLE.compact ? resolveLtNameParts : resolveFsNameParts;
  const { firstName, lastName, displayName } = resolveParts({
    name: props.name,
    firstName: props.firstName,
    lastName: props.lastName,
  });

  return {
    teams,
    sub: tournamentSub(props),
    batter: {
      name: displayName,
      firstName,
      lastName,
      runs: props.runs ?? 0,
      balls: props.balls ?? 0,
      ones: props.ones ?? 0,
      twos: props.twos ?? 0,
      threes: props.threes ?? 0,
      fours: props.fours ?? 0,
      sixes: props.sixes ?? 0,
      sr: props.sr ?? '—',
      dismissal: formatDismissal(props.dismissal ?? props.dismissal_text),
      role: props.role ?? '',
      teamCode: code,
      avatarUrl: resolvePlayerImageUrlGated(props, tokens),
      logoUrl: props.logoUrl ?? theme1Team.logoUrl ?? null,
    },
  };
}

/**
 * @param {Record<string, unknown>} wicket
 */
function wicketBatterName(wicket) {
  return String(
    wicket.batter ?? wicket.batsman ?? wicket.name ?? wicket.batsman_display_name ?? wicket.batsman_name ?? '',
  ).trim();
}

/**
 * @param {Array<Record<string, unknown>>} battingOrder
 */
function findLastDismissedBatter(battingOrder) {
  if (!Array.isArray(battingOrder)) return null;

  for (let index = battingOrder.length - 1; index >= 0; index -= 1) {
    const row = battingOrder[index];
    const status = row.status ?? '';
    if (status === 'dismissed' || row.dismissal_text || row.dismissalText) {
      return row;
    }
  }

  return null;
}

/**
 * @param {Record<string, unknown>} last
 * @param {Record<string, unknown>|null} dismissedRow
 * @param {import('@tapeya/graphics-core/domain/playerNameResolver').BroadcastNameStyle} nameStyle
 */
function buildLastWicketBatter(last, dismissedRow, nameStyle) {
  const rawName = wicketBatterName(last) || String(dismissedRow?.display_name ?? dismissedRow?.name ?? '').trim();
  const resolveParts = nameStyle === BROADCAST_NAME_STYLE.compact ? resolveLtNameParts : resolveFsNameParts;
  const { firstName, lastName, displayName } = resolveParts(rawName);

  return {
    name: displayName,
    firstName,
    lastName,
    runs: last.runs ?? dismissedRow?.runs ?? 0,
    balls: last.balls ?? dismissedRow?.balls ?? 0,
    ones: last.ones ?? dismissedRow?.ones ?? 0,
    twos: last.twos ?? dismissedRow?.twos ?? 0,
    threes: last.threes ?? dismissedRow?.threes ?? 0,
    fours: last.fours ?? dismissedRow?.fours ?? 0,
    sixes: last.sixes ?? dismissedRow?.sixes ?? 0,
    sr: last.sr ?? dismissedRow?.sr ?? '—',
    dismissal: formatDismissal(
      last.dismissal ?? last.dismissal_text ?? dismissedRow?.dismissal_text ?? dismissedRow?.dismissalText,
    ),
  };
}

/**
 * @param {Record<string, unknown>} props
 * @param {import('../../../types.js').ThemeTokens|undefined} tokens
 * @param {{ nameStyle?: import('@tapeya/graphics-core/domain/playerNameResolver').BroadcastNameStyle }} [options]
 */
export function toLastWicketFsBatter(props, tokens, { nameStyle = BROADCAST_NAME_STYLE.standard } = {}) {
  if ((props.firstName || props.name) && !Array.isArray(props.wickets)) {
    return previewLastWicketBatter(props, tokens, nameStyle);
  }

  const teams = toTeams(props, tokens);
  if (!teams) return null;

  const wickets = Array.isArray(props.wickets) ? props.wickets : [];
  const last = wickets[wickets.length - 1];
  if (!last) return null;

  const dismissedRow = findLastDismissedBatter(props.battingOrder);
  const batter = buildLastWicketBatter(last, dismissedRow, nameStyle);
  if (!batter.name && !batter.firstName && !batter.lastName) return null;

  const battingTeam = props.battingTeam ?? {};
  const teamCode = teams.batting ? 'batting' : (resolveTeamCode(battingTeam, teams) ?? 'home');

  return {
    teams,
    sub: tournamentSub(props),
    batter: {
      ...batter,
      teamCode,
      avatarUrl: coalescePlayerImageUrlGated(tokens, last, dismissedRow),
      logoUrl: last.logoUrl ?? battingTeam.logoUrl ?? null,
    },
  };
}
