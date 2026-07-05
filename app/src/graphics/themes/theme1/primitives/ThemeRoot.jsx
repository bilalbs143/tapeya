/**
 * Applies theme broadcast CSS custom properties to a subtree.
 *
 * Broadcast tokens are on :root via generated _tokens.css. This wrapper
 * scopes Tapeya styles and provides antialiased rendering for overlay surfaces.
 */
import { useEffect } from 'react';

import { cn } from '@/lib/utils';

import { assets, CSS_VARS } from '../config';

// ThemeRoot remounts on every command switch (nested inside a per-command-keyed
// error boundary in GraphicRenderer), so guard the actual preload at module
// scope — it only needs to run once per browser tab, as early as possible,
// so brandLogoWhite/playerPlaceholder are already cached by the time a command
// that falls back to them (e.g. FOLLOW_PLATFORM's logo) is triggered, instead
// of visibly popping in mid-broadcast on first use.
let themeAssetsPreloaded = false;

function preloadThemeAssets() {
  if (themeAssetsPreloaded) return;
  themeAssetsPreloaded = true;
  for (const url of [assets.brandLogoWhite, assets.playerPlaceholder]) {
    if (!url) continue;
    const img = new Image();
    img.src = url;
  }
}

export function ThemeRoot({ children, className }) {
  useEffect(() => {
    preloadThemeAssets();
  }, []);

  return (
    <div className={cn('theme1 antialiased', className)} style={CSS_VARS}>
      {children}
    </div>
  );
}
