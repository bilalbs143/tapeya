import { useId } from 'react';

import { Checkbox } from '@/ui/Checkbox';

/** Labeled “Don't count the ball” toggle used in dismissal dialogs. */
export function DontCountBallField({ checked, onCheckedChange }) {
  const id = useId();

  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-center gap-3 rounded-lg border border-[#282824] bg-[#141412] px-3 py-3"
    >
      <Checkbox id={id} checked={checked} onCheckedChange={onCheckedChange} />
      <span className="text-[13px] font-medium text-white">Don&apos;t Count the Ball</span>
    </label>
  );
}
