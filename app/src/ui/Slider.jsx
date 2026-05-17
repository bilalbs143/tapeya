/**
 * Radix Slider - range slider input
 */

import * as SliderPrimitive from '@radix-ui/react-slider';

const root = 'relative flex w-full touch-none select-none items-center';
const track = 'relative h-2 w-full grow overflow-hidden rounded-full bg-slate-200';
const range = 'absolute h-full bg-indigo-600';
const thumb =
  'block h-5 w-5 rounded-full border-2 border-indigo-600 bg-white shadow transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

export function Slider({ className = '', ...props }) {
  return (
    <SliderPrimitive.Root className={`${root} ${className}`} {...props}>
      <SliderPrimitive.Track className={track}>
        <SliderPrimitive.Range className={range} />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className={thumb} />
    </SliderPrimitive.Root>
  );
}
