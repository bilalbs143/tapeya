/**
 * Tailwind v3 config — graphics (vMix / Chrome 86) build ONLY.
 *
 * The consumer app uses Tailwind v4 (@tailwindcss/vite). v4 emits color-mix()
 * and other Chrome 86-unsafe CSS, so the graphics build uses Tailwind v3
 * (installed as the `tailwindcss3` npm alias), whose output is plain CSS.
 *
 * JIT scans the content globs below — any Tailwind class or arbitrary value
 * written in graphics JSX just works; only used classes reach the bundle.
 * Guarded downstream by check:graphics-output (rejects color-mix / dvh).
 */
// v4 parity: the consumer app is Tailwind v4, where any numeric spacing
// (gap-13, mt-17) and any opacity modifier (bg-white/14) is valid. v3's
// default scales have holes, so fill them to keep both codebases writable
// with the same class vocabulary. JIT means unused entries cost nothing.
const spacing = {};
for (let i = 0; i <= 96; i += 0.5) {
  spacing[i] = i === 0 ? '0px' : `${i * 0.25}rem`;
}

const opacity = {};
for (let i = 0; i <= 100; i += 1) {
  opacity[i] = `${i / 100}`;
}

module.exports = {
  content: ['./graphics.html', './src/graphics/**/*.{js,jsx,ts,tsx}', '../shared/graphics-core/src/**/*.{js,jsx,ts,tsx}'],
  corePlugins: {
    // Preflight ON — provides box-sizing, border-style, transform/ring/shadow
    // variable defaults that utilities depend on.  The --tw-backdrop-* variables
    // it emits are excluded from check-graphics-output's forbidden-pattern scan
    // (they're inert CSS custom properties, not actual backdrop-filter usage).
    preflight: true,
  },
  theme: {
    extend: {
      spacing,
      opacity,
    },
  },
  plugins: [],
};
