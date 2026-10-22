export const OVERTHROW_PRESET_WIDE = 'wide';
export const OVERTHROW_PRESET_NO_BALL = 'no_ball';

const PRESET_TITLE_SUFFIX: Record<string, string> = {
  [OVERTHROW_PRESET_WIDE]: ' (Wide)',
  [OVERTHROW_PRESET_NO_BALL]: ' (No Ball)',
};

export function overthrowDialogTitle(initialDeliveryType: string | null | undefined): string {
  if (!initialDeliveryType) return 'Overthrow';
  return `Overthrow${PRESET_TITLE_SUFFIX[initialDeliveryType] ?? ''}`;
}

export function overthrowSelectionToUiFields({ deliveryType, runs }: { deliveryType: string; runs: number }): {
  type: 'overthrow';
  overthrowDeliveryType: string;
  overthrowRuns: number;
} {
  return {
    type: 'overthrow',
    overthrowDeliveryType: deliveryType,
    overthrowRuns: Math.max(0, Number(runs) || 0),
  };
}
