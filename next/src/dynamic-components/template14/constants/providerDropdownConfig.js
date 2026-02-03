'use client';

export const TEMPLATE14_PROVIDER_CATEGORIES = [
  { value: 'slots', labelKey: 'slots', defaultLabel: 'slotsfdasda' },
  { value: 'arcade', labelKey: 'arcade', defaultLabel: 'arcade' },
  { value: 'hybrid', labelKey: 'hybrid_games', defaultLabel: 'hybrid games' },
  { value: 'live', labelKey: 'live_casino', defaultLabel: 'live casino' },
  { value: 'table', labelKey: 'table_games', defaultLabel: 'table games' },
];

export const isTemplate14LiveCategory = (category) =>
  category === 'live' || category === 'table';

export const getTemplate14CategoryRoute = (category) => {
  const baseRoute = isTemplate14LiveCategory(category)
    ? '/live-casino'
    : '/slot-providers';
  return `${baseRoute}?q=${category}`;
};
