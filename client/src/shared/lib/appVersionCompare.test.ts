import { describe, expect, it } from 'vitest';

import { compareDotVersions, shouldPromptAppUpdate } from './appVersionCompare';

describe('appVersionCompare', () => {
  it('compares dotted versions', () => {
    expect(compareDotVersions('1.0.0', '1.0.1')).toBe(-1);
    expect(compareDotVersions('1.2.0', '1.1.9')).toBe(1);
    expect(compareDotVersions('2.0', '2.0.0')).toBe(0);
    expect(compareDotVersions('v1.0.0', '1.0.1')).toBe(-1);
    expect(compareDotVersions('beta', '1.0.0')).toBeNull();
  });

  it('prompts when installed is behind configured', () => {
    expect(shouldPromptAppUpdate('1.0.0', '1.0.1')).toBe(true);
    expect(shouldPromptAppUpdate('1.0.1', '1.0.1')).toBe(false);
    expect(shouldPromptAppUpdate('1.1.0', '1.0.9')).toBe(false);
    expect(shouldPromptAppUpdate('', '1.0.0')).toBe(false);
    expect(shouldPromptAppUpdate('build-a', 'build-b')).toBe(true);
  });
});
