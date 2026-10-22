/** Standard extra run options (0–6) shared by wide / no-ball / bye / lb sheets. */

export const EXTRA_RUN_OPTIONS = [0, 1, 2, 3, 4, 5, 6] as const;

export type ExtraRunOption = (typeof EXTRA_RUN_OPTIONS)[number];
