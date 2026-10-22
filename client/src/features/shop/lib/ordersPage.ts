export function buyerOrderCardTitle(firstItemName: string | null | undefined): string {
  return firstItemName ?? 'Order';
}

export function buyerOrderExtraItemsLabel(extraCount: number): string | null {
  if (extraCount <= 0) return null;
  return `+${extraCount} more item${extraCount === 1 ? '' : 's'}`;
}
