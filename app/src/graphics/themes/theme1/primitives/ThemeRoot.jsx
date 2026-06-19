/**
 * Applies theme broadcast CSS custom properties to a subtree.
 *
 * Broadcast tokens are on :root via generated _tokens.css. This wrapper
 * scopes Tapeya styles and provides antialiased rendering for overlay surfaces.
 */
import { cn } from '@/lib/utils';

import { CSS_VARS } from '../config';

export function ThemeRoot({ children, className }) {
  return (
    <div className={cn('theme1 antialiased', className)} style={CSS_VARS}>
      {children}
    </div>
  );
}
