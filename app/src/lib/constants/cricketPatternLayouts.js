/**
 * Hand-balanced, random-looking outline motifs. Positions are deterministic so
 * compose and published cards render identically without layout flicker.
 *
 * @typedef {{ icon: string, top: string, left: string, size: number, rotate: number, opacity?: number, seamColor?: string, color?: string }} PatternItem
 */

const GOLD = 'text-[var(--color-brand)]';
const INK = 'text-[#211707]';

/** @type {Record<string, PatternItem[]>} */
export const CRICKET_PATTERN_LAYOUTS = {
  pitch: [
    { icon: 'ball', top: '-8%', left: '-5%', size: 82, rotate: -14, opacity: 0.2 },
    { icon: 'bat', top: '7%', left: '80%', size: 58, rotate: 18, opacity: 0.2 },
    { icon: 'wickets', top: '68%', left: '7%', size: 52, rotate: -5, opacity: 0.16 },
    { icon: 'sparkle', top: '77%', left: '84%', size: 27, rotate: 15, opacity: 0.22, color: GOLD },
    { icon: 'ball', top: '39%', left: '92%', size: 28, rotate: 12, opacity: 0.14, color: GOLD },
    { icon: 'sparkle', top: '43%', left: '2%', size: 18, rotate: -8, opacity: 0.13 },
    { icon: 'bat', top: '87%', left: '48%', size: 27, rotate: 24, opacity: 0.11, color: GOLD },
  ],
  night: [
    { icon: 'star', top: '-7%', left: '72%', size: 72, rotate: 11, opacity: 0.16 },
    { icon: 'ball', top: '70%', left: '-4%', size: 64, rotate: -18, opacity: 0.15 },
    { icon: 'bolt', top: '12%', left: '7%', size: 34, rotate: -9, opacity: 0.2, color: GOLD },
    { icon: 'sparkle', top: '68%', left: '84%', size: 31, rotate: 18, opacity: 0.25 },
    { icon: 'sparkle', top: '38%', left: '91%', size: 15, rotate: -4, opacity: 0.18, color: GOLD },
    { icon: 'star', top: '82%', left: '51%', size: 18, rotate: 22, opacity: 0.13 },
    { icon: 'sparkle', top: '43%', left: '3%', size: 17, rotate: 7, opacity: 0.13 },
    { icon: 'ball', top: '-3%', left: '43%', size: 25, rotate: 18, opacity: 0.11, color: GOLD },
  ],
  gold: [
    { icon: 'crown', top: '-8%', left: '68%', size: 78, rotate: 8, opacity: 0.2, color: INK },
    { icon: 'trophy', top: '61%', left: '-3%', size: 70, rotate: -10, opacity: 0.17, color: INK },
    { icon: 'star', top: '7%', left: '6%', size: 35, rotate: -12, opacity: 0.18, color: INK },
    { icon: 'ribbon', top: '70%', left: '84%', size: 45, rotate: 14, opacity: 0.17, color: INK },
    { icon: 'sparkle', top: '43%', left: '93%', size: 20, rotate: 5, opacity: 0.22, color: INK },
    { icon: 'star', top: '43%', left: '2%', size: 21, rotate: -8, opacity: 0.12, color: INK },
    { icon: 'sparkle', top: '87%', left: '49%', size: 18, rotate: 17, opacity: 0.13, color: INK },
  ],
  balls: [
    { icon: 'ball', top: '-13%', left: '68%', size: 96, rotate: 13, opacity: 0.2, seamColor: 'var(--color-brand)' },
    { icon: 'ball', top: '67%', left: '-5%', size: 72, rotate: -18, opacity: 0.17, seamColor: 'var(--color-brand)' },
    { icon: 'bat', top: '4%', left: '5%', size: 48, rotate: -14, opacity: 0.16, color: GOLD },
    { icon: 'bolt', top: '71%', left: '83%', size: 40, rotate: 9, opacity: 0.18, color: GOLD },
    { icon: 'sparkle', top: '42%', left: '92%', size: 22, rotate: 20, opacity: 0.2 },
    { icon: 'ball', top: '40%', left: '1%', size: 25, rotate: -8, opacity: 0.12 },
    { icon: 'sparkle', top: '87%', left: '49%', size: 18, rotate: 12, opacity: 0.13, color: GOLD },
  ],
  wickets: [
    { icon: 'trophy', top: '-10%', left: '70%', size: 88, rotate: 7, opacity: 0.2 },
    { icon: 'wickets', top: '62%', left: '-3%', size: 70, rotate: -7, opacity: 0.17 },
    { icon: 'crown', top: '8%', left: '5%', size: 43, rotate: -9, opacity: 0.17, color: GOLD },
    { icon: 'ball', top: '72%', left: '82%', size: 48, rotate: 19, opacity: 0.18, color: GOLD },
    { icon: 'star', top: '42%', left: '94%', size: 24, rotate: 8, opacity: 0.15 },
    { icon: 'bat', top: '40%', left: '1%', size: 28, rotate: -16, opacity: 0.12 },
    { icon: 'sparkle', top: '87%', left: '50%', size: 18, rotate: 10, opacity: 0.13, color: GOLD },
  ],
  bats: [
    { icon: 'stadiumLight', top: '-8%', left: '3%', size: 66, rotate: -7, opacity: 0.14 },
    { icon: 'stadiumLight', top: '-8%', left: '78%', size: 66, rotate: 7, opacity: 0.14 },
    { icon: 'ball', top: '70%', left: '84%', size: 48, rotate: 12, opacity: 0.12, color: GOLD },
    { icon: 'sparkle', top: '72%', left: '5%', size: 24, rotate: -8, opacity: 0.12 },
    { icon: 'star', top: '87%', left: '48%', size: 20, rotate: 12, opacity: 0.1, color: GOLD },
  ],
  boundary: [
    { icon: 'ribbon', top: '-11%', left: '69%', size: 92, rotate: 13, opacity: 0.2 },
    { icon: 'bolt', top: '8%', left: '7%', size: 45, rotate: -12, opacity: 0.2, color: GOLD },
    { icon: 'ball', top: '67%', left: '-4%', size: 70, rotate: -17, opacity: 0.16 },
    { icon: 'star', top: '72%', left: '82%', size: 44, rotate: 10, opacity: 0.17, color: GOLD },
    { icon: 'sparkle', top: '42%', left: '93%', size: 20, rotate: 5, opacity: 0.2 },
    { icon: 'bolt', top: '43%', left: '1%', size: 22, rotate: -8, opacity: 0.12 },
    { icon: 'ball', top: '87%', left: '48%', size: 22, rotate: 17, opacity: 0.12, color: GOLD },
  ],
  century: [
    { icon: 'confetti', top: '-9%', left: '72%', size: 78, rotate: 12, opacity: 0.2, color: GOLD },
    { icon: 'crown', top: '68%', left: '-5%', size: 72, rotate: -10, opacity: 0.17 },
    { icon: 'star', top: '4%', left: '5%', size: 43, rotate: -8, opacity: 0.2 },
    { icon: 'trophy', top: '67%', left: '82%', size: 48, rotate: 9, opacity: 0.17, color: GOLD },
    { icon: 'sparkle', top: '43%', left: '93%', size: 22, rotate: 13, opacity: 0.2 },
    { icon: 'sparkle', top: '80%', left: '52%', size: 17, rotate: -7, opacity: 0.13, color: GOLD },
    { icon: 'confetti', top: '42%', left: '0%', size: 25, rotate: -20, opacity: 0.12 },
    { icon: 'star', top: '-2%', left: '44%', size: 22, rotate: 12, opacity: 0.12, color: GOLD },
  ],
};
