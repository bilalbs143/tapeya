import { cn } from '@/shared/lib/cn';

import { iconA11yProps, type IconProps } from './Icon.types';

const R = 21;
const CIRCUMFERENCE = 2 * Math.PI * R;

type ProgressRingIconProps = IconProps & {
  /** Progress from 0–1. */
  progress: number;
  trackClassName?: string | undefined;
  progressClassName?: string | undefined;
  strokeWidth?: number | undefined;
};

export function ProgressRingIcon({
  progress,
  className,
  trackClassName,
  progressClassName,
  strokeWidth = 3,
  ...props
}: ProgressRingIconProps) {
  const clamped = Math.min(1, Math.max(0, progress));
  const offset = CIRCUMFERENCE * (1 - clamped);

  return (
    <svg
      viewBox="0 0 48 48"
      className={cn('size-full -rotate-90', className)}
      fill="none"
      aria-hidden
      {...iconA11yProps(props)}
    >
      <circle cx="24" cy="24" r={R} className={cn('stroke-border', trackClassName)} strokeWidth={strokeWidth} />
      <circle
        cx="24"
        cy="24"
        r={R}
        className={cn('stroke-brand', progressClassName)}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
        strokeDashoffset={offset}
      />
    </svg>
  );
}
