/** Duration per flash item (ms). Configurable duration deferred to v2 — see spec §11. */
export const FLASH_DURATION_MS = 5_000;

/** @typedef {{ commandKey: string, context: object|null, contextHash: string|null }} FlashQueueItem */

/**
 * @typedef {Object} GraphicFlashState
 * @property {FlashQueueItem[]} queue
 * @property {number|string|null} ballId
 */

/** @type {GraphicFlashState} */
export const initialGraphicFlashState = {
  queue: [],
  ballId: null,
};

/**
 * Pure reducer for scoring flash queue state. Exported for unit tests.
 *
 * @param {GraphicFlashState} state
 * @param {{ type: 'FLASH', ballId: number|string|null, items: FlashQueueItem[] } | { type: 'TICK' } | { type: 'CANCEL', ballId: number|string|null }} action
 * @returns {GraphicFlashState}
 */
export function graphicFlashReducer(state, action) {
  if (action.type === 'FLASH') {
    return {
      ballId: action.ballId ?? null,
      queue: action.items,
    };
  }

  if (action.type === 'TICK') {
    if (state.queue.length === 0) {
      return state;
    }

    const nextQueue = state.queue.slice(1);

    return {
      ballId: nextQueue.length === 0 ? null : state.ballId,
      queue: nextQueue,
    };
  }

  if (action.type === 'CANCEL') {
    if (action.ballId != null && String(state.ballId ?? '') === String(action.ballId)) {
      return initialGraphicFlashState;
    }

    return state;
  }

  return state;
}

/**
 * Map a Reverb `.match.graphic.flash` payload to a reducer action.
 *
 * @param {Record<string, unknown>} event
 * @returns {{ type: 'FLASH', ballId: number|string|null, items: FlashQueueItem[] } | { type: 'CANCEL', ballId: number|string|null } | null}
 */
export function graphicFlashEventToAction(event) {
  const commands = Array.isArray(event.commands) ? event.commands : [];
  const ballId = event.ball_id ?? null;

  if (commands.length === 0) {
    return { type: 'CANCEL', ballId };
  }

  const items = commands.map((key) => ({
    commandKey: key,
    context: event.context ?? null,
    contextHash: event.context_hash ?? null,
  }));

  return { type: 'FLASH', ballId, items };
}

/**
 * @param {GraphicFlashState} state
 * @returns {FlashQueueItem|null}
 */
export function activeFlashItem(state) {
  return state.queue.length > 0 ? state.queue[0] : null;
}
