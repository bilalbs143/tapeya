/**
 * Intro / toss / tournament name / result LT processors → match-fixture bar data.
 */
import { toTeamRecord } from './_shared';
import { formatChaseAnnouncement, formatTossDecision } from './presentationLabels';
import { formatLiveFromVenueLine } from './venueLine.adapter';

/** Broadcast casing for fixture-bar copy (original theme-01 used ALL CAPS). */
function fixtureBarText(value) {
  const text = String(value ?? '').trim();
  return text ? text.toUpperCase() : '';
}

/**
 * Resolve fixture-bar detail text from processor props (applies theme copy for toss/chase).
 *
 * @param {Record<string, unknown>} props
 * @param {string} detailKey
 */
export function resolveMatchFixtureDetail(props, detailKey) {
  if (detailKey === 'decision') {
    const override = props.decisionOverride ?? props.decision;
    if (override != null && String(override).trim() !== '') {
      return String(override).trim();
    }
    return formatTossDecision(props.tossWinnerName, props.choseToBatOrBowl);
  }

  const explicit =
    props[detailKey] ??
    props.matchDetailOverride ??
    props.matchDetail ??
    props.resultLineOverride ??
    props.resultLine ??
    props.matchLabel ??
    props.text ??
    '';

  if (explicit != null && String(explicit).trim() !== '') {
    return String(explicit).trim();
  }

  if (detailKey === 'matchDetail' && props.mode === 'chase') {
    return formatChaseAnnouncement(props.chasingTeamAbbrev, props.runsRequired, props.wicketsRemaining, props.ballsRemaining);
  }

  return '';
}

/**
 * @param {Record<string, unknown>} props
 * @param {import('../../../types.js').ThemeTokens|undefined} tokens
 * @param {string} [detailKey]
 */
export function toMatchFixtureBundle(props, tokens, detailKey = 'matchDetail') {
  const homeTeam = props.homeTeam;
  const awayTeam = props.awayTeam;
  if (!homeTeam || !awayTeam) return null;

  const teams = {
    home: toTeamRecord(homeTeam, 'home', tokens, 'home'),
    away: toTeamRecord(awayTeam, 'away', tokens, 'away'),
  };

  const rawDetail = resolveMatchFixtureDetail(props, detailKey);

  const fixture = {
    teams: [
      { teamCode: 'home', name: fixtureBarText(teams.home.displayName) },
      { teamCode: 'away', name: fixtureBarText(teams.away.displayName) },
    ],
    vsLabel: props.vsLabel ?? 'VS',
    title: fixtureBarText(props.title ?? props.tournamentName ?? ''),
    matchDetail: fixtureBarText(rawDetail),
  };

  return { teams, fixture };
}

/**
 * Tournament name LT — tournament title above, live-from venue below.
 *
 * @param {Record<string, unknown>} props
 * @param {import('../../../types.js').ThemeTokens|undefined} tokens
 */
export function toTournamentNameBundle(props, tokens) {
  return toMatchFixtureBundle(
    {
      ...props,
      matchDetail: formatLiveFromVenueLine(props) ?? '',
    },
    tokens,
    'matchDetail',
  );
}
