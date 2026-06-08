import { extraBallLabel } from '@/lib/utils/scoringUtils';

/**
 * Map a UI ball to over-strip / balls-tab chip label and colour variant.
 *
 * @param {object|null} ball
 * @param {{ dotLabel?: string }} [options]
 */
export function getBallDisplay(ball, { dotLabel = '•' } = {}) {
  if (!ball) return { label: dotLabel, variant: 'dot' };
  switch (ball.type) {
    case 'runs': {
      const r = ball.runs ?? 0;
      if (r === 0) return { label: dotLabel, variant: 'dot' };
      if (r === 4) return { label: '4', variant: 'four' };
      if (r === 6) return { label: '6', variant: 'six' };
      return { label: String(r), variant: 'runs' };
    }
    case 'out':
      if (ball.isWide) {
        const wideLabel = extraBallLabel('wd', ball.runs ?? 0);
        return { label: `${wideLabel}+W`, variant: 'wicket' };
      }
      if (ball.dismissalType === 'retired') return { label: 'RO', variant: 'retired' };
      if (ball.dismissalType === 'mankad') return { label: 'M', variant: 'wicket' };
      if (ball.dismissalType === 'timed_out') return { label: 'TO', variant: 'retired' };
      return { label: 'W', variant: 'wicket' };
    case 'retired_hurt':
      return { label: 'RH', variant: 'retired' };
    case 'wd':
      return { label: extraBallLabel('wd', ball.runs), variant: 'extra' };
    case 'nb':
      return { label: extraBallLabel('nb', ball.runs), variant: 'extra' };
    case 'bye':
      return { label: extraBallLabel('bye', ball.runs), variant: 'extra' };
    case 'lb':
      return { label: extraBallLabel('lb', ball.runs), variant: 'extra' };
    case 'penalty': {
      const pr = ball.penaltyRuns ?? 0;
      return { label: pr > 0 ? `P${pr}` : 'P', variant: 'extra' };
    }
    case 'additional_runs': {
      const ar = ball.additionalRuns ?? 0;
      return { label: ar > 0 ? `+${ar}` : '+', variant: 'extra' };
    }
    default:
      return { label: dotLabel, variant: 'dot' };
  }
}
