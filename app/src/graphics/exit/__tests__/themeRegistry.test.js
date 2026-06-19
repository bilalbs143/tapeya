import { describe, expect, it } from 'vitest';

import { FullScreenShell } from '@/graphics/exit/shells/FullScreenShell';
import { LowerThirdShell } from '@/graphics/exit/shells/LowerThirdShell';
import { PassthroughShell } from '@/graphics/exit/shells/PassthroughShell';
import {
  ensureThemeAssetsLoaded,
  ensureThemeStylesLoaded,
  getThemeCommandComponent,
  getThemeMeta,
  listThemeCommandKeys,
  resolveDisplayModeShell,
} from '@/graphics/exit/themeRegistry';

describe('themeRegistry', () => {
  describe('resolveDisplayModeShell', () => {
    it('maps display modes to the correct shell component', () => {
      expect(resolveDisplayModeShell('FS')).toBe(FullScreenShell);
      expect(resolveDisplayModeShell('LT')).toBe(LowerThirdShell);
      expect(resolveDisplayModeShell(null)).toBe(PassthroughShell);
      expect(resolveDisplayModeShell(undefined)).toBe(PassthroughShell);
    });
  });

  describe('getThemeMeta', () => {
    it('returns theme1 meta with ThemeRoot', () => {
      const meta = getThemeMeta('theme1');
      expect(meta).not.toBeNull();
      expect(meta?.slug).toBe('theme1');
      expect(typeof meta?.ThemeRoot).toBe('function');
    });

    it('returns null for unknown slug', () => {
      expect(getThemeMeta('not-a-real-theme')).toBeNull();
    });
  });

  describe('ensureThemeStylesLoaded', () => {
    it('loads theme styles once per folder', async () => {
      await ensureThemeStylesLoaded('theme1');
      await ensureThemeStylesLoaded('theme1');
      expect(getThemeMeta('theme1')?.styleImports?.length).toBeGreaterThan(0);
    });

    it('resolves no-op for unknown slug', async () => {
      await expect(ensureThemeStylesLoaded('missing-theme')).resolves.toBeUndefined();
    });
  });

  describe('ensureThemeAssetsLoaded', () => {
    it('resolves for theme1 (styles; fonts no-op without document.fonts in test env)', async () => {
      await expect(ensureThemeAssetsLoaded('theme1')).resolves.toBeUndefined();
      expect(getThemeMeta('theme1')?.googleFontsUrl).toBeTruthy();
      expect(getThemeMeta('theme1')?.googleFontFamilies?.length).toBeGreaterThan(0);
    });
  });

  describe('getThemeCommandComponent', () => {
    it('resolves a lazy component for a registered theme command', () => {
      const component = getThemeCommandComponent('theme1', 'LOWER_THIRD', 'LT_DEFAULT');
      expect(component).not.toBeNull();
      expect(typeof component).toBe('object');
      expect(String(component?.$$typeof)).toContain('react.lazy');
    });

    it('resolves command type from manifest when commandType is omitted', () => {
      const withType = getThemeCommandComponent('theme1', 'LOWER_THIRD', 'LT_DEFAULT');
      const inferred = getThemeCommandComponent('theme1', null, 'LT_DEFAULT');
      expect(withType).toBe(inferred);
    });

    it('returns null for unknown theme slug', () => {
      expect(getThemeCommandComponent('missing-theme', 'LOWER_THIRD', 'LT_DEFAULT')).toBeNull();
    });

    it('returns null for unknown command key', () => {
      expect(getThemeCommandComponent('theme1', 'LOWER_THIRD', 'NOT_A_REAL_COMMAND')).toBeNull();
    });
  });

  describe('listThemeCommandKeys', () => {
    it('lists command keys discovered under theme1/commands', () => {
      const keys = listThemeCommandKeys('theme1');
      expect(keys).toContain('LT_DEFAULT');
      expect(keys).toContain('PLAYING_11');
      expect(keys.length).toBeGreaterThan(90);
    });
  });
});
