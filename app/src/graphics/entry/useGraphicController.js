import { useContext } from 'react';

import { GraphicControllerContext } from './graphicControllerContext';

/**
 * @returns {import('./graphicControllerContext.js').GraphicControllerContextValue}
 */
export function useGraphicController() {
  const value = useContext(GraphicControllerContext);
  if (!value) {
    throw new Error('useGraphicController must be used within GraphicControllerProvider');
  }
  return value;
}
