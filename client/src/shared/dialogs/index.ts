/**
 * Safe shared entry — store + confirm only.
 * Do not re-export DialogHost here: `baseApi` and other early modules import this
 * barrel; pulling the host/registry would cycle through feature RTK slices.
 */
export { dialogStore } from './dialogStore';
export { confirm } from './helpers';
export type { DialogKey, DialogProps } from './registry';
