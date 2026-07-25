import { createElement } from 'react';

import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { DecisionPendingFlash, FiftyUpFlash, FourFlash, WicketFlash } from '../eventFlashes';

describe('theme2 FST action overlay', () => {
  it('renders theme3-style action layers for fixed flashes', () => {
    const four = renderToStaticMarkup(createElement(FourFlash, { fixed: true }));
    expect(four).toContain('bc-fst-action');
    expect(four).toContain('bc-fst-action-glow');
    expect(four).toContain('bc-fst-action-ring');
    expect(four).toContain('FOUR');
    expect(four).toContain('bc-flash-title');

    const out = renderToStaticMarkup(createElement(WicketFlash, { fixed: true }));
    expect(out).toContain('OUT');
    expect(out).not.toContain('WICKET');

    const fifty = renderToStaticMarkup(createElement(FiftyUpFlash, { fixed: true }));
    expect(fifty).toContain('>50<');

    const decision = renderToStaticMarkup(createElement(DecisionPendingFlash, { fixed: true }));
    expect(decision).toContain('DECISION PENDING');
    expect(decision).toContain('is-compact');
  });
});
