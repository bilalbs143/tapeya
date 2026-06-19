// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { BallChip } from '../atoms';

describe('BallChip', () => {
  it('keeps simple tokens circular', () => {
    const { container } = render(<BallChip code="4" size={28} animate={false} />);
    const chip = container.querySelector('.bc-ball-chip');

    expect(chip?.classList.contains('bc-ball-chip--compound')).toBe(false);
    expect(chip?.style.width).toBe('28px');
    expect(chip?.style.height).toBe('28px');
  });

  it('uses compound pill layout for wicket extras', () => {
    const { container } = render(<BallChip code="WD+W" size={28} animate={false} />);
    const chip = container.querySelector('.bc-ball-chip');

    expect(chip?.classList.contains('bc-ball-chip--compound')).toBe(true);
    expect(chip?.style.width).toBe('auto');
    expect(chip?.style.minWidth).toBe('28px');
    expect(['0', '0px']).toContain(chip?.style.paddingInline);
    expect(Number.parseFloat(chip?.style.fontSize ?? '0')).toBeLessThan(28 * 0.42);
    expect(screen.getByText('WD+W')).toBeTruthy();
  });

  it('scales font further for longer compound tokens', () => {
    const short = render(<BallChip code="NB+W" size={28} animate={false} />).container.querySelector('.bc-ball-chip');
    const long = render(<BallChip code="2NB+W" size={28} animate={false} />).container.querySelector('.bc-ball-chip');

    expect(Number.parseFloat(long.style.fontSize)).toBeLessThan(Number.parseFloat(short.style.fontSize));
  });
});
