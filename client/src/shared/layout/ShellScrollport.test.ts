import { afterEach, describe, expect, it, vi } from 'vitest';

import { handleNavRootReselect, scrollShellToTop } from './shellScroll';

describe('scrollShellToTop', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('scrolls shell and opted-in page scrollers that are not already at top', () => {
    const shell = document.createElement('div');
    shell.setAttribute('data-shell-scrollport', '');
    shell.scrollTop = 120;
    shell.scrollTo = vi.fn();

    const page = document.createElement('div');
    page.setAttribute('data-scroll-to-top', '');
    page.scrollTop = 80;
    page.scrollTo = vi.fn();

    const idle = document.createElement('div');
    idle.setAttribute('data-scroll-to-top', '');
    idle.scrollTop = 0;
    idle.scrollTo = vi.fn();

    document.body.append(shell, page, idle);

    const windowScroll = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});

    scrollShellToTop('smooth');

    expect(shell.scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'smooth' });
    expect(page.scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'smooth' });
    expect(idle.scrollTo).not.toHaveBeenCalled();
    expect(windowScroll).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'smooth' });
  });
});

describe('handleNavRootReselect', () => {
  it('consumes only when already on the nav root', () => {
    const preventDefault = vi.fn();
    expect(handleNavRootReselect({ preventDefault }, '/reels', '/reels')).toBe(true);
    expect(preventDefault).toHaveBeenCalledOnce();

    preventDefault.mockClear();
    expect(handleNavRootReselect({ preventDefault }, '/reels/12', '/reels')).toBe(false);
    expect(preventDefault).not.toHaveBeenCalled();
  });
});
