// @vitest-environment jsdom

import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { assets } from '../../config';
import { isPlayerAvatarPlaceholder, resolvePlayerAvatarUrl } from '../playerAvatar';
import { PlayerAvatarImage } from '../PlayerAvatarImage';

describe('playerAvatar helpers', () => {
  it('treats empty and placeholder URLs as placeholder', () => {
    expect(isPlayerAvatarPlaceholder(null)).toBe(true);
    expect(isPlayerAvatarPlaceholder('')).toBe(true);
    expect(isPlayerAvatarPlaceholder('   ')).toBe(true);
    expect(isPlayerAvatarPlaceholder(assets.playerPlaceholder)).toBe(true);
    expect(isPlayerAvatarPlaceholder('https://cdn.example/app/images/background/player-placeholder-theme1.png')).toBe(true);
  });

  it('treats real player URLs as non-placeholder', () => {
    expect(isPlayerAvatarPlaceholder('https://cdn.example/players/waqar.jpg')).toBe(false);
  });

  it('resolves placeholders to the theme asset', () => {
    expect(resolvePlayerAvatarUrl(null)).toBe(assets.playerPlaceholder);
    expect(resolvePlayerAvatarUrl('https://cdn.example/players/waqar.jpg')).toBe('https://cdn.example/players/waqar.jpg');
  });
});

describe('PlayerAvatarImage', () => {
  it('renders lining background only for placeholder avatars', () => {
    const { container, rerender } = render(<PlayerAvatarImage src={null} alt="Player" />);
    expect(container.querySelector('[aria-hidden]')).not.toBeNull();

    rerender(<PlayerAvatarImage src="https://cdn.example/players/waqar.jpg" alt="Player" />);
    expect(container.querySelector('[aria-hidden]')).toBeNull();
  });

  it('uses cover-top fit for real player photos', () => {
    const { container } = render(<PlayerAvatarImage src="https://cdn.example/players/waqar.jpg" alt="Player" fit="cover-top" />);
    expect(container.querySelector('img')?.className).toContain('object-cover');
  });
});
