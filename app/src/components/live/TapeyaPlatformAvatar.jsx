import { TAPEYA_PLATFORM_AVATAR } from '@/lib/utils/liveStreamUtils';

/** Brand-ring Tapeya mark for admin / match streams without a self-serve broadcaster. */
export function TapeyaPlatformAvatar({ sizeClass = 'h-11 w-11' } = {}) {
  return (
    <span className="inline-flex shrink-0 rounded-full bg-[linear-gradient(135deg,var(--color-brand),var(--color-brand-dark))] p-[2px]">
      <span className={`border-surface bg-surface grid place-items-center overflow-hidden rounded-full border-2 ${sizeClass}`}>
        <img src={TAPEYA_PLATFORM_AVATAR} alt="" className="h-full w-full object-contain p-1" draggable={false} />
      </span>
    </span>
  );
}
