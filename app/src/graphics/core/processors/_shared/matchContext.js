import { coalesceTrim } from '../../utils';

/** @typedef {import('../../../types.js').GraphicSessionSnapshot} GraphicSessionSnapshot */

/**
 * @param {GraphicSessionSnapshot} snapshot
 */
export function matchTeams(snapshot) {
  const { match } = snapshot;

  return {
    homeTeam: {
      id: match.homeTeamId,
      name: match.homeTeamName,
      shortCode: match.homeTeamShortCode,
      logoUrl: match.homeTeamLogoUrl,
    },
    awayTeam: {
      id: match.awayTeamId,
      name: match.awayTeamName,
      shortCode: match.awayTeamShortCode,
      logoUrl: match.awayTeamLogoUrl,
    },
  };
}

/**
 * Match chrome fields used by intro, playing XI, charts, and breaks.
 *
 * @param {GraphicSessionSnapshot} snapshot
 */
export function buildMatchContext(snapshot) {
  const { match, tournament } = snapshot;
  const { homeTeam, awayTeam } = matchTeams(snapshot);

  return {
    homeTeam,
    awayTeam,
    matchNumber: match.number,
    venue: match.venue,
    venueDisplayLine: match.venueDisplayLine,
    tournamentName: tournament.name?.trim() ?? '',
    tournamentShort: tournament.shortCode,
    tournamentLogoUrl: tournament.logoUrl,
    matchLabel: tournament.name?.trim() ?? '',
  };
}

/**
 * Attach normalized home/away team slices for theme adapters (crests, logos, short codes).
 *
 * @param {GraphicSessionSnapshot} snapshot
 * @param {Record<string, unknown>} [props]
 */
export function withMatchTeams(snapshot, props = {}) {
  const teams = matchTeams(snapshot);
  return {
    ...props,
    homeTeam: props.homeTeam ?? teams.homeTeam,
    awayTeam: props.awayTeam ?? teams.awayTeam,
  };
}

/**
 * Raw venue name and optional pre-formatted display line from payload / match context.
 * Presentation (LIVE FROM + uppercase) is owned by the theme1 adapter layer.
 *
 * @param {GraphicSessionSnapshot} snapshot
 */
export function resolveVenueFields(snapshot) {
  const p = snapshot.payload ?? {};
  const { match } = snapshot;

  return {
    venue: coalesceTrim(p.venue, p.venue_name, match.venue),
    venueDisplayLine: coalesceTrim(p.venue_display_line, match.venueDisplayLine),
  };
}

/**
 * Tournament name for graphic subtitles — never includes match number.
 *
 * @param {GraphicSessionSnapshot} snapshot
 */
export function tournamentLabelOnly(snapshot) {
  const p = snapshot.payload ?? {};
  const fromPayload = p.tournament_label ?? p.tournament_name;
  if (fromPayload != null && String(fromPayload).trim() !== '') {
    return String(fromPayload).trim();
  }
  return snapshot.tournament?.name?.trim() ?? '';
}
