// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { CountUpNumber } from '../atoms';

describe('CountUpNumber', () => {
  afterEach(() => {
    cleanup();
  });

  it('starts at zero before the count-up runs', () => {
    render(<CountUpNumber value={42} />);
    expect(screen.getByText('0')).toBeTruthy();
  });
});
