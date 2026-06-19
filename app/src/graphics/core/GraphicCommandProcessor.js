import { graphicDebugLog, graphicLogger, isGraphicDebugEnabled } from '../entry/debugLog';
import { hasDedicatedProcessor, PROCESSOR_MAP } from './processorMap';

/** @typedef {import('../types.js').GraphicRenderPlan} GraphicRenderPlan */

/** @typedef {import('../types.js').GraphicSessionSnapshot} GraphicSessionSnapshot */

/**
 * @param {GraphicSessionSnapshot} snapshot
 * @returns {Record<string, unknown>}
 */
function buildComponentProps(snapshot) {
  const { commandKey } = snapshot;

  const processor = commandKey ? PROCESSOR_MAP[commandKey] : null;

  if (processor) {
    const result = processor(snapshot);
    return result ?? null;
  }

  graphicDebugLog('processor:missing', { commandKey, reason: 'no_processor' });

  return {};
}

/**
 * @param {GraphicSessionSnapshot} snapshot
 * @returns {GraphicRenderPlan | null}
 */
export function processGraphicCommand(snapshot) {
  const { commandKey } = snapshot;

  if (!commandKey) {
    graphicDebugLog('processor:missing', { commandKey: null, reason: 'empty_command_key' });

    return null;
  }

  if (!hasDedicatedProcessor(commandKey)) {
    graphicDebugLog('processor:missing', { commandKey, reason: 'not_in_processor_map' });
  } else {
    graphicDebugLog('processor:run', {
      commandKey,
      commandId: snapshot.commandId,
      contextHash: snapshot.contextHash,
      dedicated: true,
    });
  }

  const componentProps = buildComponentProps(snapshot);
  if (componentProps === null) {
    graphicDebugLog('processor:clear', { commandKey, reason: 'processor_returned_null' });
    return null;
  }

  if (isGraphicDebugEnabled()) {
    graphicLogger('log', 'processor:props', {
      commandKey,
      commandType: snapshot.commandType,
      displayMode: snapshot.displayMode,
      dedicated: hasDedicatedProcessor(commandKey),
      componentPropsKeys: componentProps && typeof componentProps === 'object' ? Object.keys(componentProps) : [],
      ...(commandKey === 'TOSS_LT' && {
        tossWinnerName: componentProps?.tossWinnerName,
        choseToBatOrBowl: componentProps?.choseToBatOrBowl,
      }),
      ...(commandKey === 'RESULT_LT' && {
        mode: componentProps?.mode,
        resultLineOverride: componentProps?.resultLineOverride,
        winningTeam: componentProps?.winningTeam,
      }),
    });
  }

  return {
    commandKey,
    commandType: snapshot.commandType,
    commandId: snapshot.commandId,
    contextHash: snapshot.contextHash,
    displayMode: snapshot.displayMode,
    themeSlug: snapshot.themeSlug,
    tokens: snapshot.config,
    componentProps,
  };
}
