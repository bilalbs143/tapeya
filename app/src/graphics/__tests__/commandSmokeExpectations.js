/**

 * Category-level markup checks for command smoke renders.

 * Uses theme shell/class markers (SSR-safe) rather than pixel text — FSStage and

 * useFitStage omit inner content until layout, but shells and LT bars still mount.

 *

 * @param {{ key: string, category: string, type: string, displayMode?: string|null }} command

 * @param {string} html

 * @param {import('@/graphics/types.js').GraphicRenderPlan} plan

 * @returns {string|null}

 */

export function assertCommandMarkupContent(command, html, _plan) {
  if (command.category === 'clear') {
    return null;
  }

  if (!html.includes('graphic-overlay-container')) {
    return 'missing graphic-overlay-container';
  }

  if (!html.includes('graphic-shell')) {
    return 'missing graphic-shell';
  }

  const { type, displayMode, key } = command;

  if (command.category === 'animation') {
    if (type === 'FULL_SCREEN_TRANSITION') {
      return html.includes('bc-controller-bar-wrap') ? null : 'FST missing controller bar shell';
    }

    return html.includes('bc-controller') || html.includes('bc-animate') ? null : 'LT animation missing theme markers';
  }

  if (command.category === 'break') {
    return html.includes('bc-controller-overlay-root--full') ? null : 'break missing full-screen overlay root';
  }

  if (type === 'TOUR_HITS') {
    return html.includes('bc-controller-stacked') ? null : 'tour hit missing stacked bar layout';
  }

  if (displayMode === 'LT') {
    if (type === 'CAPTION' || key === 'CUSTOM') {
      return html.includes('HELLO') || html.includes('bc-glow-panel') ? null : 'caption missing bar content';
    }

    if (key === 'UMPIRES' || key === 'SCORERS' || key === 'COMMENTATORS') {
      return html.includes('bc-glow-panel') ? null : 'officials bar missing glow panel';
    }

    if (key === 'TOSS_LT' || key === 'RESULT_LT' || key === 'INTRO_LT' || key === 'TOURNAMENT_NAME') {
      return html.includes('bc-controller-bar-wrap') && html.includes('bc-glow-panel')
        ? null
        : 'fixture LT missing bar structure';
    }

    return html.includes('bc-controller-bar-wrap') ? null : 'LT missing controller bar wrap';
  }

  if (displayMode === 'FS') {
    return html.includes('graphic-shell--fs') || html.includes('bc-controller-overlay-root--full')
      ? null
      : 'FS missing full-screen shell';
  }

  return null;
}
