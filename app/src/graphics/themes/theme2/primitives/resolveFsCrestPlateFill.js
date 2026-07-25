import { colors } from '../config';

/** Club crest plate fill — team uses session accent; tournament uses wine. */
export function resolveFsCrestPlateFill({ variant = 'team', accent, team } = {}) {
  if (variant === 'tournament') return colors.panelPlayer;
  return accent || team?.color || colors.panelPlayer;
}
