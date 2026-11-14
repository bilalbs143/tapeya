import { useTabLayout } from '@/shared/layout';

/** Desk layout from 900px — boxed 9:16 with prev/next vs phone snap scroll. */
export function useReelsTabLayout(): boolean {
  return useTabLayout();
}
