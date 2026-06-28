/**
 * Processor team shapes → Tapeya teams map + match codes.
 */
import { resolveTeamCode, toTeamRecord } from './_shared';

/**
 * @param {{
 *   homeTeam?: Record<string, unknown>,
 *   awayTeam?: Record<string, unknown>,
 *   battingTeam?: Record<string, unknown>,
 *   bowlingTeam?: Record<string, unknown>,
 * }} props
 * @param {import('../../../types.js').ThemeTokens|undefined} tokens
 */
export function toTeams(props, tokens) {
  if (props.homeTeam && props.awayTeam) {
    return {
      home: { ...toTeamRecord(props.homeTeam, 'home', tokens, 'home'), id: props.homeTeam.id },
      away: { ...toTeamRecord(props.awayTeam, 'away', tokens, 'away'), id: props.awayTeam.id },
    };
  }

  const batting = props.battingTeam;
  const bowling = props.bowlingTeam;
  if (batting && bowling) {
    // battingTeamSide ('home'|'away') is forwarded from scoreboardBase so we can
    // pick the right color token even when navigating by batting/bowling pair.
    const battingSide = props.battingTeamSide ?? null;
    const bowlingSide = battingSide === 'home' ? 'away' : battingSide === 'away' ? 'home' : null;
    return {
      batting: { ...toTeamRecord(batting, 'batting', tokens, battingSide), id: batting.id },
      bowling: { ...toTeamRecord(bowling, 'bowling', tokens, bowlingSide), id: bowling.id },
    };
  }

  return null;
}

/**
 * @param {Record<string, unknown>} props
 * @param {import('../../../types.js').ThemeTokens|undefined} tokens
 * @param {Record<string, object>|null} teams
 */
export function toMatch(props, tokens, teams) {
  if (!teams) return null;

  if (teams.batting && teams.bowling) {
    return {
      battingCode: 'batting',
      bowlingCode: 'bowling',
      league: props.tournamentName ?? props.tournamentLabel ?? '',
      matchNo: '',
    };
  }

  const batting = props.battingTeam ?? {};
  const bowling = props.bowlingTeam ?? {};
  const battingCode = resolveTeamCode(batting, teams) ?? 'home';
  const bowlingCode = resolveTeamCode(bowling, teams) ?? (battingCode === 'home' ? 'away' : 'home');

  return {
    battingCode,
    bowlingCode,
    league: props.tournamentName ?? props.tournamentLabel ?? '',
    matchNo: '',
  };
}

/**
 * @param {Record<string, unknown>} props
 * @param {import('../../../types.js').ThemeTokens|undefined} tokens
 */
export function toTeamsAndMatch(props, tokens) {
  const teams = toTeams(props, tokens);
  if (!teams) return null;
  const match = toMatch(props, tokens, teams);
  if (!match) return null;
  return { teams, match };
}
