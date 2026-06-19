/**
 * Strategic Timeout processor output → StrategicTimeoutGraphic bundle.
 */
import { toBreakBundle } from './break.adapter';

/**
 * @param {Record<string, unknown>} props
 * @param {import('../../../types.js').ThemeTokens|undefined} tokens
 */
export function toStrategicTimeoutBundle(props, tokens) {
  const resolved = toBreakBundle(props, tokens);
  if (!resolved) return null;

  return {
    data: resolved.breakData,
    teams: resolved.teams,
  };
}
