import type { NavItem } from './nav-item.model';

/** Case-insensitive filter of sidebar nav by label. Keeps section caps that still have items. */
export function filterNavItems(items: NavItem[], query: string): NavItem[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    return items;
  }

  const result: NavItem[] = [];
  let pendingCap: NavItem | null = null;

  for (const item of items) {
    if (item.navCap) {
      pendingCap = item;
      continue;
    }

    const matched = matchNavItem(item, q);
    if (matched) {
      if (pendingCap) {
        result.push(pendingCap);
        pendingCap = null;
      }
      result.push(matched);
    }
  }

  return result;
}

function matchNavItem(item: NavItem, q: string): NavItem | null {
  const nameHit = (item.displayName ?? '').toLowerCase().includes(q);

  if (item.children?.length) {
    if (nameHit) {
      // Parent label matches — keep the full group.
      return { ...item, children: [...item.children] };
    }
    const kids = item.children.map((child) => matchNavItem(child, q)).filter((child): child is NavItem => child != null);
    if (kids.length) {
      return { ...item, children: kids };
    }
    return null;
  }

  return nameHit ? item : null;
}

export function navItemsHaveLinks(items: NavItem[]): boolean {
  return items.some((item) => !item.navCap);
}
