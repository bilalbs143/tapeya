import { createElement, useState } from 'react';

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { GraphicErrorBoundary } from '@/graphics/exit/GraphicErrorBoundary';

/** @vitest-environment jsdom */

function ThrowWhen({ shouldThrow }) {
  if (shouldThrow) {
    throw new Error('render failed');
  }
  return createElement('div', null, 'ok');
}

function BoundaryHarness({ initialHash, initialThrow }) {
  const [contextHash, setContextHash] = useState(initialHash);
  const [shouldThrow, setShouldThrow] = useState(initialThrow);

  return createElement(
    'div',
    null,
    createElement(
      'button',
      {
        type: 'button',
        onClick: () => {
          setContextHash('hash-2');
          setShouldThrow(false);
        },
      },
      'refresh',
    ),
    createElement(GraphicErrorBoundary, { commandKey: 'LT_DEFAULT', contextHash }, createElement(ThrowWhen, { shouldThrow })),
  );
}

describe('GraphicErrorBoundary', () => {
  it('recovers when contextHash changes after a render error', async () => {
    render(createElement(BoundaryHarness, { initialHash: 'hash-1', initialThrow: true }));

    expect(screen.queryByText('ok')).toBeNull();

    await screen.getByRole('button', { name: 'refresh' }).click();

    expect(screen.getByText('ok')).toBeTruthy();
  });
});
