import { describe, expect, it } from 'vitest';

import { APP_PATHS } from '@/shared/config/paths';
import { safeInternalPath } from '@/shared/lib/safeInternalPath';

describe('safeInternalPath', () => {
  it('allows plain absolute app paths', () => {
    expect(safeInternalPath('/tournaments/create', APP_PATHS.home)).toBe('/tournaments/create');
  });

  it('rejects protocol-relative and non-path values', () => {
    expect(safeInternalPath('//evil.example', APP_PATHS.home)).toBe(APP_PATHS.home);
    expect(safeInternalPath('https://evil.example', APP_PATHS.home)).toBe(APP_PATHS.home);
    expect(safeInternalPath('\\evil', APP_PATHS.home)).toBe(APP_PATHS.home);
    expect(safeInternalPath(undefined, APP_PATHS.home)).toBe(APP_PATHS.home);
  });
});
