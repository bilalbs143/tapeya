import { describe, expect, it } from 'vitest';

import {
  ballStripLabelForCommand,
  breakCaptionForCommand,
  chartLabelsForCommand,
  formatChaseAnnouncement,
  formatTossDecision,
  tourStatTitleForCommand,
} from '@/graphics/themes/theme2/adapters/presentationLabels';

describe('theme2 presentationLabels', () => {
  it('resolves break captions by command key', () => {
    expect(breakCaptionForCommand('TEA_BREAK', null)).toBe('TEA BREAK');
    expect(breakCaptionForCommand('RAIN_STOPPED', null)).toBe('RAIN STOPPED PLAY');
    expect(breakCaptionForCommand('TEA_BREAK', 'Custom')).toBe('Custom');
  });

  it('resolves chart titles by command key', () => {
    expect(chartLabelsForCommand('WORM')).toEqual({ title: 'Worm', yLabel: 'Runs' });
    expect(chartLabelsForCommand('MANHATTAN')).toEqual({ title: 'MANHATTAN', yLabel: 'RUNS PER OVER' });
  });

  it('resolves ball strip labels by command key', () => {
    expect(ballStripLabelForCommand('LAST_12_BALLS', null)).toBe('Last 12 Balls');
  });

  it('resolves tour stat titles by command key', () => {
    expect(tourStatTitleForCommand('TOUR_SIXES')).toBe('SIXES');
  });

  it('formats toss and chase fixture copy', () => {
    expect(formatTossDecision('Home XI', 'bat')).toBe('Home XI won the toss and elected to bat first');
    expect(formatTossDecision('Home XI', 'bowl')).toBe('Home XI won the toss and elected to bowl first');
    expect(formatChaseAnnouncement('HOM', 31, 10, 7)).toBe('HOM REQUIRES 31 RUNS WITH 10 WICKETS AND 7 BALLS');
  });
});
