import { ControllerBar } from '../../primitives';

/**
 * Scoreboard LT shell — forwards theme tokens so enableImages can show player photos.
 */
export function LowerThirdBar({ tokens, showPlayerImages, ...props }) {
  const imagesOn = showPlayerImages ?? (tokens != null && tokens.enableImages !== false);

  return <ControllerBar {...props} showPlayerImages={imagesOn} />;
}
