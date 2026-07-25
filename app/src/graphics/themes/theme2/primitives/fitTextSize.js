/**
 * Find the largest font size (px) that fits within maxWidth.
 *
 * @param {(sizePx: number) => number} measureWidthAtSize returns rendered text width at a font size
 * @param {number} maxWidth available width in px
 * @param {number} maxFontSize starting / default font size in px
 * @param {number} minFontSize smallest allowed font size in px
 */
export function findFitFontSize(measureWidthAtSize, maxWidth, maxFontSize, minFontSize) {
  if (maxWidth <= 0) return maxFontSize;

  let size = maxFontSize;
  while (size > minFontSize && measureWidthAtSize(size) > maxWidth) {
    size -= 1;
  }

  return size;
}

/**
 * Measure an element and return a font size that fits within maxWidth.
 *
 * @param {HTMLElement} element text node with final typography classes applied
 * @param {{ maxWidth: number, maxFontSize: number, minFontSize: number }} options
 */
export function measureFitFontSize(element, { maxWidth, maxFontSize, minFontSize }) {
  return findFitFontSize(
    (sizePx) => {
      element.style.fontSize = `${sizePx}px`;
      return element.scrollWidth;
    },
    maxWidth,
    maxFontSize,
    minFontSize,
  );
}
