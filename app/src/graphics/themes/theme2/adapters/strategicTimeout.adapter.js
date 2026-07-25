/**
 * Strategic Timeout processor output → break bumper with live countdown.
 */
import { fsBreak } from '../config';
import { toBreakBundle } from './break.adapter';

/**
 * @param {Record<string, unknown>} props
 * @param {import('../../../types.js').ThemeTokens|undefined} tokens
 */
export function toStrategicTimeoutBundle(props, tokens) {
  const resolved = toBreakBundle(props, tokens);
  if (!resolved) return null;

  const timerSeconds = Number(props.timerSeconds ?? props.durationSeconds ?? fsBreak.defaultTimerSeconds);

  return {
    data: {
      ...resolved.breakData,
      showTimer: true,
      timerSeconds: Number.isFinite(timerSeconds) && timerSeconds > 0 ? timerSeconds : fsBreak.defaultTimerSeconds,
    },
    teams: resolved.teams,
  };
}
