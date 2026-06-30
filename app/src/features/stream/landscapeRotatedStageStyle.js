/**
 * CSS 90° CW rotation for landscape live broadcast stages (web + iOS chrome portal).
 *
 * @param {{ w: number, h: number }} size — pre-rotation viewport / zone bounds
 * @param {{ promoteLayer?: boolean }} [options] — `translateZ(1px)` for compositing over native video
 */
export function buildCssRotatedStageStyle(size, { promoteLayer = false } = {}) {
  const translateZ = promoteLayer ? ' translateZ(1px)' : '';

  return {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: size.h,
    height: size.w,
    transform: `translate(-50%, -50%) rotate(90deg)${translateZ}`,
  };
}

/** Placeholder while dimensions are not yet measured (portaled chrome only). */
export function buildCssRotatedStageHiddenStyle() {
  return {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 0,
    height: 0,
    opacity: 0,
  };
}
