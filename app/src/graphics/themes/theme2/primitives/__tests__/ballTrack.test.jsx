// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { BallTrack } from '../atoms';

describe('BallTrack', () => {
  it('renders placeholder slots up to max for a short over', () => {
    const { container } = render(<BallTrack chips={[{ code: '4' }, { code: '1' }]} max={6} size={20} />);

    expect(container.querySelectorAll('.bc-ball-chip')).toHaveLength(2);
    expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(4);
  });

  it('expands beyond max when extras add more than six deliveries', () => {
    const chips = [{ code: '6' }, { code: '6' }, { code: '1' }, { code: '4' }, { code: 'WD' }, { code: '0' }, { code: 'WD' }];

    const { container } = render(<BallTrack chips={chips} max={6} size={20} />);

    expect(screen.getAllByText('WD')).toHaveLength(2);
    expect(container.querySelectorAll('.bc-ball-chip')).toHaveLength(7);
  });
});
