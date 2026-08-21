// @vitest-environment node
import { describe, expect, it } from 'vitest';

import { isNotFoundError, isUnauthorizedError } from '../apiErrors';
import {
  buildThemeConfig,
  formatOverlayExpiry,
  isValidThemeConfig,
  overlayExpiresSoon,
  themeConfigsEqual,
  themePropertyLabel,
  themeSchemaProperties,
} from '../utils/broadcastGraphics';

const theme = {
  id: 1,
  name: 'Test',
  config_schema: {
    properties: [
      { key: 'homeBgColor', label: 'Home Team Color', type: 'color', default: '#1e3a5f' },
      { key: 'awayBgColor', label: 'Away Team Color', type: 'color', default: '#5c3d1e' },
      { key: 'enableImages', label: 'Show Player Images', type: 'boolean', default: false },
    ],
  },
  default_config: { homeBgColor: '#1e3a5f', awayBgColor: '#5c3d1e', enableImages: false },
};

describe('isNotFoundError', () => {
  it('matches numeric and string 404', () => {
    expect(isNotFoundError({ status: 404 })).toBe(true);
    expect(isNotFoundError({ status: '404' })).toBe(true);
    expect(isNotFoundError({ data: { type: 'NOT_FOUND' } })).toBe(true);
    expect(isNotFoundError({ status: 403 })).toBe(false);
    expect(isNotFoundError(null)).toBe(false);
  });
});

describe('isUnauthorizedError', () => {
  it('matches 401 only', () => {
    expect(isUnauthorizedError({ status: 401 })).toBe(true);
    expect(isUnauthorizedError({ status: 404 })).toBe(false);
  });
});

describe('overlayExpiresSoon', () => {
  it('is true within the window', () => {
    const now = Date.parse('2026-08-20T00:00:00Z');
    expect(overlayExpiresSoon('2026-08-20T00:10:00Z', now)).toBe(true);
    expect(overlayExpiresSoon('2026-08-20T01:00:00Z', now)).toBe(false);
    expect(overlayExpiresSoon(null, now)).toBe(false);
  });
});

describe('formatOverlayExpiry', () => {
  it('returns null for invalid values', () => {
    expect(formatOverlayExpiry(null)).toBeNull();
    expect(formatOverlayExpiry('not-a-date')).toBeNull();
  });
});

describe('themeSchemaProperties', () => {
  it('returns only color and boolean props', () => {
    expect(themeSchemaProperties(theme)).toHaveLength(3);
    expect(themeSchemaProperties(null)).toEqual([]);
  });
});

describe('themePropertyLabel', () => {
  it('swaps home and away for team names', () => {
    expect(themePropertyLabel({ label: 'Home Team Color' }, 'Tigers', 'Lions')).toBe('Tigers Team Color');
    expect(themePropertyLabel({ label: 'Away Team Color' }, 'Tigers', 'Lions')).toBe('Lions Team Color');
  });
});

describe('buildThemeConfig', () => {
  it('prefers draft, then session, then defaults', () => {
    expect(buildThemeConfig(theme)).toEqual({
      homeBgColor: '#1e3a5f',
      awayBgColor: '#5c3d1e',
      enableImages: false,
    });
    expect(buildThemeConfig(theme, { homeBgColor: '#ff0000', enableImages: true })).toEqual({
      homeBgColor: '#ff0000',
      awayBgColor: '#5c3d1e',
      enableImages: true,
    });
    expect(buildThemeConfig(theme, { homeBgColor: '#ff0000' }, { homeBgColor: '#00ff00' })).toEqual({
      homeBgColor: '#00ff00',
      awayBgColor: '#5c3d1e',
      enableImages: false,
    });
  });
});

describe('isValidThemeConfig', () => {
  it('requires hex colors and booleans', () => {
    expect(isValidThemeConfig(theme, buildThemeConfig(theme))).toBe(true);
    expect(isValidThemeConfig(theme, { ...buildThemeConfig(theme), homeBgColor: 'red' })).toBe(false);
    expect(isValidThemeConfig(theme, { ...buildThemeConfig(theme), enableImages: 'yes' })).toBe(false);
  });
});

describe('themeConfigsEqual', () => {
  it('compares schema keys only', () => {
    const props = themeSchemaProperties(theme);
    expect(themeConfigsEqual(buildThemeConfig(theme), buildThemeConfig(theme), props)).toBe(true);
    expect(themeConfigsEqual(buildThemeConfig(theme), { ...buildThemeConfig(theme), enableImages: true }, props)).toBe(false);
  });
});
