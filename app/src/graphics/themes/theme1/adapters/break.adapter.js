/**
 * Break processors → VSBreakGraphic data shape.
 * Processor output: { homeTeam, awayTeam, label?, venue? }
 */
import { toTeamRecord, tournamentSub } from './_shared';
import { breakCaptionForCommand } from './presentationLabels';
import { formatLiveFromVenueLine } from './venueLine.adapter';

/**
 * @param {Record<string, unknown>} props
 * @param {import('../../../types.js').ThemeTokens|undefined} tokens
 */
export function toBreakBundle(props, tokens) {
  const homeTeam = props.homeTeam;
  const awayTeam = props.awayTeam;
  if (!homeTeam || !awayTeam) return null;

  const teams = {
    home: toTeamRecord(homeTeam, 'home', tokens, 'home'),
    away: toTeamRecord(awayTeam, 'away', tokens, 'away'),
  };

  const breakData = {
    caption: breakCaptionForCommand(props.commandKey, props.caption ?? props.label ?? null),
    tournamentName: (props.tournamentName ?? props.tournamentLabel ?? tournamentSub(props)) || null,
    venueLine: formatLiveFromVenueLine(props),
    teams: [
      { teamCode: 'home', accent: teams.home.color, logoUrl: teams.home.logoUrl },
      { teamCode: 'away', accent: teams.away.color, logoUrl: teams.away.logoUrl },
    ],
  };

  return { breakData, teams };
}

/**
 * Next match FS — break layout with tournament + live-from venue above VS hero.
 *
 * @param {Record<string, unknown>} props
 * @param {import('../../../types.js').ThemeTokens|undefined} tokens
 */
export function toNextMatchBundle(props, tokens) {
  const resolved = toBreakBundle(
    {
      ...props,
      label: 'NEXT MATCH',
      caption: 'NEXT MATCH',
    },
    tokens,
  );
  return resolved;
}

/**
 * This match FS — same break-interval layout as innings / tea / lunch breaks.
 *
 * @param {Record<string, unknown>} props
 * @param {import('../../../types.js').ThemeTokens|undefined} tokens
 */
export function toThisMatchBundle(props, tokens) {
  return toBreakBundle(
    {
      ...props,
      label: 'THIS MATCH',
      caption: 'THIS MATCH',
    },
    tokens,
  );
}
