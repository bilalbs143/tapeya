import { ltBar } from '../config';

const DESIGN_W = ltBar.designWidth;
const MOBILE_UNIFORM_BREAKPOINT = 720;

export function horizontalBarScale(containerW, edgeToEdge) {
  const resolvedW = containerW > 0 ? containerW : DESIGN_W;
  const isNarrow = resolvedW < MOBILE_UNIFORM_BREAKPOINT;

  if (edgeToEdge) {
    return resolvedW / DESIGN_W;
  }

  if (isNarrow) {
    return Math.min(resolvedW / DESIGN_W, 1);
  }

  return Math.min((resolvedW - 32) / DESIGN_W, 1);
}
