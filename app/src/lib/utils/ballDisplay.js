import { getBallDisplay, isLegalDelivery, normalizeBall, presentBall } from '../../../../shared/ball-delivery/index.js';

export { getBallDisplay, presentBall };

/**
 * Resolve chip label/variant for a ball — prefers API `presentation` when present,
 * falls back to shared JS for optimistic pre-save UI.
 *
 * @param {object|null|undefined} ball
 * @param {{ dotStyle?: 'zero'|'bullet' }} [options]
 * @returns {{ label: string, variant: string, chipType?: string }}
 */
export function resolveBallChip(ball, options = {}) {
  const dotStyle = options.dotStyle ?? 'zero';
  const presentation = ball?.presentation;

  if (presentation && typeof presentation === 'object') {
    let label = presentation.label ?? presentation.display_token ?? '';
    if (presentation.chip_type === 'dot' && dotStyle === 'bullet') {
      label = '•';
    }

    return {
      label,
      variant: presentation.variant ?? 'runs',
      chipType: presentation.chip_type,
    };
  }

  return getBallDisplay(ball, options);
}

/**
 * Whether a delivery counts toward the over — prefers API presentation when present.
 *
 * @param {object|null|undefined} ball
 * @returns {boolean}
 */
export function ballIsLegalDelivery(ball) {
  if (ball?.presentation && typeof ball.presentation.is_legal === 'boolean') {
    return ball.presentation.is_legal;
  }

  return isLegalDelivery(normalizeBall(ball));
}
