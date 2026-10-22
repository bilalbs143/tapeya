import { describe, expect, it } from 'vitest';

import { sanitizeHtml, stripCmsChrome } from './sanitizeHtml';

describe('stripCmsChrome', () => {
  it('removes outer article and leading h1', () => {
    const raw = '<article><h1>Terms</h1><p>Body</p></article>';
    expect(stripCmsChrome(raw)).toBe('<p>Body</p>');
  });
});

describe('sanitizeHtml', () => {
  it('returns empty for blank input', () => {
    expect(sanitizeHtml(null, 'cms')).toBe('');
    expect(sanitizeHtml('   ', 'product')).toBe('');
  });

  it('strips script and event handlers on cms profile', () => {
    const dirty =
      '<p>Hello<script>alert(1)</script></p><img src=x onerror=alert(1) /><a href="javascript:alert(1)">x</a>';
    const clean = sanitizeHtml(dirty, 'cms');
    expect(clean).toContain('<p>Hello</p>');
    expect(clean).not.toMatch(/script|onerror|javascript:/i);
  });

  it('keeps safe formatting tags for product profile', () => {
    const raw = '<p>Bat <strong>pro</strong></p><ul><li>Willow</li></ul><h3>Specs</h3>';
    const clean = sanitizeHtml(raw, 'product');
    expect(clean).toContain('<strong>pro</strong>');
    expect(clean).toContain('<li>Willow</li>');
    expect(clean).toContain('<h3>Specs</h3>');
  });

  it('drops product-level h1 but cms allows h2', () => {
    expect(sanitizeHtml('<h1>Title</h1><p>x</p>', 'product')).not.toContain('<h1>');
    expect(sanitizeHtml('<h2>Section</h2><p>x</p>', 'cms')).toContain('<h2>Section</h2>');
  });

  it('forces rel on target=_blank links', () => {
    const clean = sanitizeHtml('<a href="https://example.com" target="_blank">Shop</a>', 'product');
    expect(clean).toContain('rel="noopener noreferrer"');
  });

  it('applies CMS chrome strip before purify', () => {
    const clean = sanitizeHtml('<article><h1>Privacy</h1><p>We care.</p></article>', 'cms');
    expect(clean).toBe('<p>We care.</p>');
  });
});
