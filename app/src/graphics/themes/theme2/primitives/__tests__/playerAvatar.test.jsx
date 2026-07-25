// @vitest-environment jsdom

import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { assets, colors, playerAvatar } from '../../config';
import { isPlayerAvatarPlaceholder, resolvePlayerAvatarUrl } from '../playerAvatar';
import { PlayerAvatarImage } from '../PlayerAvatarImage';

describe('playerAvatar helpers', () => {
  it('treats empty and placeholder URLs as placeholder', () => {
    expect(isPlayerAvatarPlaceholder(null)).toBe(true);
    expect(isPlayerAvatarPlaceholder('')).toBe(true);
    expect(isPlayerAvatarPlaceholder('   ')).toBe(true);
    expect(isPlayerAvatarPlaceholder(assets.playerPlaceholder)).toBe(true);
    expect(isPlayerAvatarPlaceholder('https://cdn.example/app/images/background/player-placeholder-theme1.png')).toBe(true);
    expect(isPlayerAvatarPlaceholder('/assets/player-placeholder.png')).toBe(true);
  });

  it('treats real player URLs as non-placeholder', () => {
    expect(isPlayerAvatarPlaceholder('https://cdn.example/players/waqar.jpg')).toBe(false);
  });

  it('resolves placeholders to the theme asset', () => {
    expect(resolvePlayerAvatarUrl(null)).toBe(assets.playerPlaceholder);
    expect(resolvePlayerAvatarUrl('/assets/player-placeholder.png')).toBe(assets.playerPlaceholder);
    expect(resolvePlayerAvatarUrl('https://cdn.example/players/waqar.jpg')).toBe('https://cdn.example/players/waqar.jpg');
  });
});

describe('PlayerAvatarImage', () => {
  it('uses the Top Bowler plate background by default', () => {
    const { container } = render(<PlayerAvatarImage src="https://cdn.example/players/waqar.jpg" alt="Player" />);
    const shell = container.firstElementChild;
    expect(shell?.getAttribute('data-avatar-plate')).toBe('theme2');
    expect(shell?.style.backgroundColor).toMatch(/#2e0a1a|rgb\(46,\s*10,\s*26\)/i);
    expect(playerAvatar.plate).toBe(colors.panelPlayer);
  });

  it('always renders lining under real JPG/PNG photos and placeholders', () => {
    const { container, rerender } = render(<PlayerAvatarImage src={null} alt="Player" />);
    expect(container.querySelector('[data-avatar-lining="theme2"]')).not.toBeNull();

    rerender(<PlayerAvatarImage src="https://cdn.example/players/waqar.jpg" alt="Player" />);
    expect(container.querySelector('[data-avatar-lining="theme2"]')).not.toBeNull();

    rerender(<PlayerAvatarImage src="https://cdn.example/players/waqar.png" alt="Player" />);
    expect(container.querySelector('[data-avatar-lining="theme2"]')).not.toBeNull();
  });

  it('keeps plate + lining for cover-top when photo is missing', () => {
    const { container } = render(<PlayerAvatarImage src={null} alt="Player" fit="cover-top" />);
    expect(container.querySelector('[data-avatar-plate="theme2"]')).not.toBeNull();
    expect(container.querySelector('[data-avatar-lining="theme2"]')).not.toBeNull();
    expect(container.querySelector('img')?.className).toContain('object-cover');
  });

  it('skips plate and lining for LT cutouts', () => {
    const { container } = render(<PlayerAvatarImage src={null} alt="Player" plate={false} lining={false} />);
    expect(container.firstElementChild?.getAttribute('data-avatar-plate')).toBeNull();
    expect(container.querySelector('[data-avatar-lining="theme2"]')).toBeNull();
  });

  it('uses cover-top fit for real player photos', () => {
    const { container } = render(<PlayerAvatarImage src="https://cdn.example/players/waqar.jpg" alt="Player" fit="cover-top" />);
    expect(container.querySelector('img')?.className).toContain('object-cover');
    expect(container.querySelector('[data-avatar-lining="theme2"]')).not.toBeNull();
  });

  it('keeps lining when a real photo fails and falls back to placeholder', () => {
    const { container } = render(<PlayerAvatarImage src="https://cdn.example/players/broken.jpg" alt="Player" />);
    const img = container.querySelector('img');
    expect(img).not.toBeNull();
    expect(container.querySelector('[data-avatar-lining="theme2"]')).not.toBeNull();

    fireEvent.error(img);

    expect(container.querySelector('[data-avatar-lining="theme2"]')).not.toBeNull();
    expect(container.querySelector('img')?.getAttribute('src')).toBe(assets.playerPlaceholder);
  });
});
