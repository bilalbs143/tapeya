import type { useSearchParams } from 'react-router-dom';

const TAB_VALUES = new Set(['pad', 'card', 'balls', 'partnership', 'stats', 'info']);

export type ScoreTab = 'pad' | 'card' | 'balls' | 'partnership' | 'stats' | 'info';

export function isScoreTab(value: string | null): value is ScoreTab {
  return value != null && TAB_VALUES.has(value);
}

export function setScoreTab(setSearchParams: ReturnType<typeof useSearchParams>[1], nextTab: ScoreTab) {
  setSearchParams(
    (prev) => {
      const copy = new URLSearchParams(prev);
      if (nextTab === 'pad') copy.delete('tab');
      else copy.set('tab', nextTab);
      return copy;
    },
    { replace: false }
  );
}
