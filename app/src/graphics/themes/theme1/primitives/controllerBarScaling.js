import { ltBar } from '../config';

const DESIGN_W = ltBar.designWidth;
const MOBILE_UNIFORM_BREAKPOINT = 720;

export function horizontalBarScale(containerW, edgeToEdge) {
  const isNarrow = containerW > 0 && containerW < MOBILE_UNIFORM_BREAKPOINT;

  if (edgeToEdge) {
    return containerW / DESIGN_W;
  }

  if (isNarrow) {
    return Math.min(containerW / DESIGN_W, 1);
  }

  return Math.min((containerW - 32) / DESIGN_W, 1);
}
