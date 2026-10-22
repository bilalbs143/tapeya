import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/** tailwind-merge with custom token groups — otherwise `text-body-sm` loses to `text-ink`. */
const RADII = ['chip', 'icon', 'field', 'panel', 'card', 'sheet'] as const;
const SIZES = [
  '4xs',
  '3xs',
  '2xs',
  'body-sm',
  'body-lg',
  'title-sm',
  'title',
  'display-sm',
  'display',
  'score',
] as const;

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      rounded: [{ rounded: [...RADII] }],
      'rounded-t': [{ 'rounded-t': [...RADII] }],
      'rounded-b': [{ 'rounded-b': [...RADII] }],
      'font-size': [{ text: [...SIZES] }],
      tracking: [{ tracking: ['eyebrow'] }],
      'max-w': [{ 'max-w': ['dialog'] }],
      shadow: [{ shadow: ['card', 'pop'] }],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
