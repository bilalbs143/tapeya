export function productMaxQty(stock: number): number {
  return Math.min(10, Math.max(1, stock));
}

export function productStockLabel(outOfStock: boolean, lowStock: boolean, stock: number): string {
  if (outOfStock) return 'Out of Stock';
  if (lowStock) return `Only ${stock} Left`;
  return 'In Stock';
}

export function productStockToneClass(outOfStock: boolean, lowStock: boolean): string {
  if (outOfStock) return 'text-danger-soft';
  if (lowStock) return 'text-brand-text';
  return 'text-positive-2';
}

export function productAddToCartLabel(outOfStock: boolean, lineTotalFormatted: string): string {
  return outOfStock ? 'Out of Stock' : `Add to Cart · ${lineTotalFormatted}`;
}
