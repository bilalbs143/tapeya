import { useCallback } from 'react';

import { baseApi, TAG_TYPES } from '@/shared/api/baseApi';
import { useAppDispatch } from '@/shared/store/hooks';
import type { AppDispatch } from '@/shared/store/store';

import { bumpContentRefreshKey } from './contentRefreshStore';
import { scrollShellToTop } from './shellScroll';

/** Brief hold so the PTR spinner is visible while remount + refetch start. */
const SOFT_REFRESH_HOLD_MS = 420;

/**
 * Soft content refresh (Facebook-like):
 * 1. Invalidate RTK Query tags so active screens refetch
 * 2. Remount the shell `<Outlet>` (page state resets; chrome stays)
 * 3. Scroll shell / page panes to top
 */
export async function softRefreshContent(dispatch: AppDispatch): Promise<void> {
  dispatch(baseApi.util.invalidateTags([...TAG_TYPES]));
  bumpContentRefreshKey();
  scrollShellToTop('instant');
  await new Promise<void>((resolve) => {
    window.setTimeout(resolve, SOFT_REFRESH_HOLD_MS);
  });
}

/** Stable pull-to-refresh handler for shell / PageDock scrollers. */
export function useSoftContentRefresh(): () => Promise<void> {
  const dispatch = useAppDispatch();
  return useCallback(() => softRefreshContent(dispatch), [dispatch]);
}
