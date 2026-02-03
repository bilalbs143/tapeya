import { useDispatch, useSelector } from 'react-redux';

/**
 * Typed hooks - use these instead of useDispatch/useSelector.
 * When migrating to TypeScript, add store type here for full type inference.
 */
export const useAppDispatch = useDispatch;
export const useAppSelector = useSelector;
