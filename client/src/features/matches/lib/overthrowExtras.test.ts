import { describe, expect, it } from 'vitest';

import { overthrowDialogTitle, overthrowSelectionToUiFields } from './overthrowExtras';

describe('overthrowExtras', () => {
  it('titles presets', () => {
    expect(overthrowDialogTitle(null)).toBe('Overthrow');
    expect(overthrowDialogTitle('wide')).toBe('Overthrow (Wide)');
    expect(overthrowDialogTitle('no_ball')).toBe('Overthrow (No Ball)');
  });

  it('maps selection to UiBall fields', () => {
    expect(overthrowSelectionToUiFields({ deliveryType: 'wide', runs: 2 })).toEqual({
      type: 'overthrow',
      overthrowDeliveryType: 'wide',
      overthrowRuns: 2,
    });
  });
});
