import { useRetiredFlow } from './useRetiredFlow';

/**
 * @param {object[]} batsmen On-crease batters
 */
export function useRetiredHurtFlow(batsmen = []) {
  return useRetiredFlow(batsmen);
}
