import { Capacitor, registerPlugin } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

import { THEME_STORAGE_KEY } from '@/shared/config/themeBoot.js';

type ThemePref = 'system' | 'dark' | 'light';

type TapeyaAppearancePlugin = {
  apply: (options: { theme: ThemePref }) => Promise<void>;
};

const TapeyaAppearance = registerPlugin<TapeyaAppearancePlugin>('TapeyaAppearance');

/** Persist theme for native cold-start splash; apply UI mode when running natively. */
export async function syncNativeTheme(theme: ThemePref): Promise<void> {
  try {
    if (theme === 'system') await Preferences.remove({ key: THEME_STORAGE_KEY });
    else await Preferences.set({ key: THEME_STORAGE_KEY, value: theme });
  } catch {
    /* private mode — still try native apply */
  }

  if (!Capacitor.isNativePlatform()) return;
  try {
    await TapeyaAppearance.apply({ theme });
  } catch {
    /* plugin missing in this shell */
  }
}
