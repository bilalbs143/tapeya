/**
 * Strategic Timeout full-screen — countdown timer between innings segments.
 */
import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';

import { fsBreak } from '../../config';
import { DISPLAY_FONT } from '../../primitives';
import { textGlowClass } from '../../visualEffects';
import { fsFont } from '../shared/fsTypographyStyles';
import { BreakFSLayout, TeamSide } from './vsBreak';
import { resolveVSTeams } from './vsBreak.helpers';

/** Default strategic timeout length (2:30). */
const DEFAULT_SECONDS = 150;

/** @param {number} totalSeconds */
function formatTimeout(totalSeconds) {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/** @param {number} [initialSeconds] */
function useTimeoutCountdown(initialSeconds = DEFAULT_SECONDS) {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    setSeconds(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (seconds <= 0) return undefined;

    const timer = setTimeout(() => {
      setSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearTimeout(timer);
  }, [seconds]);

  return formatTimeout(seconds);
}

/** @param {{ value: string }} props */
function TimeoutDisplay({ value }) {
  const [minutes = '00', seconds = '00'] = value.split(':');

  return (
    <div
      className={cn(
        'flex w-[300px] shrink-0 items-center justify-center rounded-2xl border px-8 py-8',
        'bg-[linear-gradient(180deg,rgba(30,38,62,0.9),rgba(14,19,32,0.92))]',
        'border-[color-mix(in_srgb,var(--accentA)_40%,transparent)]',
        '[box-shadow:0_0_calc(22px*var(--glow))_color-mix(in_srgb,var(--accentA)_20%,transparent),inset_0_1px_0_rgba(255,255,255,0.06)]',
      )}
      aria-live="polite"
      aria-label={`Time remaining ${value}`}
    >
      <span
        className={cn(
          'inline-flex items-center justify-center font-extrabold text-white',
          'tabular-nums [font-variant-numeric:tabular-nums]',
          DISPLAY_FONT,
          textGlowClass('accent'),
        )}
        style={fsFont(fsBreak.timeoutHero)}
      >
        <span className="inline-block w-[1.15em] text-right">{minutes}</span>
        <span className="inline-block w-[0.55em] text-center">:</span>
        <span className="inline-block w-[1.15em] text-left">{seconds}</span>
      </span>
    </div>
  );
}

/**
 * @param {{
 *   data: {
 *     caption?: string,
 *     tournamentName?: string|null,
 *     venueLine?: string|null,
 *     teams?: Array<{ teamCode: string, accent?: string, logoUrl?: string }>,
 *   },
 *   teams: Record<string, object>,
 * }} props
 */
export function StrategicTimeoutGraphic({ data, teams }) {
  const resolved = resolveVSTeams(data, teams);
  const timerText = useTimeoutCountdown(DEFAULT_SECONDS);

  if (!resolved) return null;

  return (
    <BreakFSLayout tournamentName={data.tournamentName} venueLine={data.venueLine} caption={data.caption}>
      <div className="flex items-center gap-[90px]">
        <TeamSide side={resolved.left} borderPulseOrder={1} showName />
        <TimeoutDisplay value={timerText} />
        <TeamSide side={resolved.right} borderPulseOrder={2} showName />
      </div>
    </BreakFSLayout>
  );
}
