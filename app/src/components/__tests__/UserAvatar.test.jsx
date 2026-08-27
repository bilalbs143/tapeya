// @vitest-environment jsdom

import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { DEFAULT_USER_AVATAR, UserAvatar } from '@/components/UserAvatar';

function renderAvatar(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('UserAvatar', () => {
  it('covers portrait photos from the top so they are not stretched', () => {
    const { container } = renderAvatar(<UserAvatar src="https://cdn.example/player.jpg" name="Waqar" />);
    const img = container.querySelector('img');
    expect(img?.className).toContain('object-cover');
    expect(img?.className).toContain('object-top');
  });

  it('links to the creator reels profile when userId is set', () => {
    const { container } = renderAvatar(<UserAvatar src="https://cdn.example/player.jpg" name="Ali" userId={12} />);
    const link = container.querySelector('a');
    expect(link?.getAttribute('href')).toBe('/reels/u/12');
    expect(link?.getAttribute('aria-label')).toBe("View Ali's profile");
  });

  it('does not link without a valid userId', () => {
    const { container } = renderAvatar(<UserAvatar src="https://cdn.example/player.jpg" name="Ali" />);
    expect(container.querySelector('a')).toBeNull();
  });

  it('falls back to the default avatar when src is missing', () => {
    const { container } = renderAvatar(<UserAvatar name="Guest" />);
    const img = container.querySelector('img');
    expect(img?.getAttribute('src')).toBe(DEFAULT_USER_AVATAR);
  });
});
