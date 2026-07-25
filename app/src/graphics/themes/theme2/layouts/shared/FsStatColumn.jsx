import { cn } from '@/lib/utils';

import { ROW_ANIMATE_IN } from '../../primitives';
import { StatTile } from './StatTile';

/**
 * Full-height stat chip column — stretches tiles to match avatar height.
 *
 * @param {{
 *   statFields: Array<{ key: string, label: string }>,
 *   statValues: Record<string, string | number>,
 *   statLayout: ReturnType<typeof import('./fsStatLayout').resolveFsStatLayout>,
 *   getDelay?: (index: number) => number,
 *   tone?: 'batsman' | 'bowler',
 * }} props
 */
export function FsStatColumn({ statFields, statValues, statLayout, getDelay, tone = 'batsman' }) {
  return (
    <div className="flex h-full min-h-0 flex-col" style={{ gap: statLayout.gap }}>
      {statFields.map((field, index) => (
        <div
          key={field.key}
          className={cn('flex min-h-0 flex-1', getDelay && ROW_ANIMATE_IN)}
          style={{
            ...(getDelay ? { animationDelay: `${getDelay(index)}ms` } : null),
            minHeight: statLayout.tileH,
          }}
        >
          <StatTile
            label={field.label}
            value={statValues[field.key]}
            className="h-full w-full"
            width={statLayout.tileW}
            labelSize={statLayout.labelSize}
            valueSize={statLayout.valueSize}
            paddingY={statLayout.paddingY}
            labelGap={statLayout.labelGap}
            tone={tone}
          />
        </div>
      ))}
    </div>
  );
}
