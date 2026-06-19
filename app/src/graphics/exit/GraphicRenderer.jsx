import { Suspense } from 'react';

import { graphicDebugLog } from '../entry/debugLog';
import { GraphicErrorBoundary } from './GraphicErrorBoundary';
import { getThemeCommandComponent, getThemeMeta, resolveDisplayModeShell } from './themeRegistry';

/** @typedef {import('../types.js').GraphicRenderPlan} GraphicRenderPlan */

/**
 * Single exit point for overlay rendering.
 *
 * @param {{ plan: GraphicRenderPlan }} props
 */
export function GraphicRenderer({ plan }) {
  const GraphicComponent = getThemeCommandComponent(plan.themeSlug, plan.commandType, plan.commandKey);

  if (!GraphicComponent) {
    graphicDebugLog('renderer:no_component', {
      themeSlug: plan.themeSlug,
      commandType: plan.commandType,
      commandKey: plan.commandKey,
    });
    return null;
  }

  const DisplayModeShell = resolveDisplayModeShell(plan.displayMode);
  const themeMeta = getThemeMeta(plan.themeSlug);
  if (!themeMeta?.ThemeRoot) {
    graphicDebugLog('renderer:no_theme', { themeSlug: plan.themeSlug });
    return null;
  }

  const { ThemeRoot } = themeMeta;

  graphicDebugLog('renderer:component', {
    themeSlug: plan.themeSlug,
    commandType: plan.commandType,
    commandKey: plan.commandKey,
    displayMode: plan.displayMode,
  });

  // Key on commandId + commandKey only — contextHash intentionally excluded.
  // Including contextHash caused a full boundary remount (visible flicker) on
  // every HTTP context refresh mid-flash. Error recovery happens naturally when
  // the command itself changes (new commandId or commandKey).
  const boundaryKey = `${plan.commandId ?? 'none'}-${plan.commandKey}`;

  return (
    <div className="graphic-overlay-container">
      <GraphicErrorBoundary key={boundaryKey} commandKey={plan.commandKey} contextHash={plan.contextHash}>
        <ThemeRoot>
          <DisplayModeShell tokens={plan.tokens}>
            <Suspense fallback={null}>
              <GraphicComponent {...plan.componentProps} tokens={plan.tokens} isOverlay />
            </Suspense>
          </DisplayModeShell>
        </ThemeRoot>
      </GraphicErrorBoundary>
    </div>
  );
}
