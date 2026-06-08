import { useRetiredFlow } from './useRetiredFlow';

/**
 * @param {object[]} batsmen On-crease batters
 */
export function useRetiredOutFlow(batsmen = []) {
  return useRetiredFlow(batsmen);
}
