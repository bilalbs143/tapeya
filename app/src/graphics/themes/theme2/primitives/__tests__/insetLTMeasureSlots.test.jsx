// @vitest-environment jsdom

import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { InsetLTAnimatedNumber, InsetLTCrest, InsetLTLogo } from '../insetLTMeasureSlots';

describe('insetLTMeasureSlots', () => {
  it('InsetLTCrest renders a fixed block when measuring', () => {
    const { container } = render(<InsetLTCrest measuring size={86} team={{ name: 'A' }} accent="#fff" />);
    expect(container.querySelector('span[aria-hidden="true"]')).toBeTruthy();
    expect(container.querySelector('.bc-crest')).toBeFalsy();
  });

  it('InsetLTAnimatedNumber renders static text when measuring', () => {
    const { container } = render(<InsetLTAnimatedNumber measuring value={42} className="score" style={{ fontSize: 32 }} />);
    expect(container.textContent).toBe('42');
  });

  it('InsetLTLogo skips img when measuring', () => {
    const { container } = render(<InsetLTLogo measuring src="/logo.png" alt="Tapeya" height={72} className="logo" />);
    expect(container.querySelector('img')).toBeFalsy();
    expect(container.querySelector('span[aria-hidden="true"]')).toBeTruthy();
  });
});
