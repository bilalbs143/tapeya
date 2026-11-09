/** Opaque comment dock tokens — `bg-surface` so media never shows through. */

const DOCK = 'border-border-subtle bg-surface isolate border-t px-4 pt-2.5';

/** Sheet/column footer; BottomNav or dialog owns home-indicator padding. */
export const COMMENT_COMPOSE_DOCK = `${DOCK} pb-2.5`;

/** Media player (watch / episode): home indicator via `--safe-above-keyboard`, 10px when keyboard open. */
export const COMMENT_COMPOSE_DOCK_WATCH = `${DOCK} pb-[max(10px,var(--safe-above-keyboard))]`;

export const COMMENT_COMPOSE_PILL = 'bg-page flex h-[38px] min-w-0 flex-1 items-center rounded-full px-3.5';

export const COMMENT_COMPOSE_ACTION =
  'bg-page text-dim grid h-[38px] w-[38px] shrink-0 place-items-center rounded-full disabled:opacity-40';
