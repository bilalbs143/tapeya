import { createContext } from 'react';

/** @typedef {import('../types.js').GraphicRenderPlan} GraphicRenderPlan */
/** @typedef {import('../types.js').GraphicSessionSnapshot} GraphicSessionSnapshot */

/**
 * @typedef {Object} GraphicControllerContextValue
 * @property {GraphicSessionSnapshot|null} snapshot
 * @property {GraphicRenderPlan|null} renderPlan
 * @property {string} themeSlug — from `session.theme.slug` (graphic session SSOT)
 * @property {boolean} isLoading
 * @property {boolean} isError
 */

export const GraphicControllerContext = createContext(/** @type {GraphicControllerContextValue|null} */ (null));
