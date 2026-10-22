import { useId } from 'react';

import { SectionLabel } from '@/shared/layout';
import { cn } from '@/shared/lib/cn';
import { Form } from '@/shared/ui/Form';
import { Textarea } from '@/shared/ui/Input';
import { Switch } from '@/shared/ui/Switch';

import {
  linesOf,
  matchSettingsFooterNote,
  OFFICIAL_FIELDS,
  officialsNameHint,
  wagonWheelStatusHint,
} from '../lib/matchSettings';
import type { useMatchSettings } from './useMatchSettings';

type MatchSettingsFlow = ReturnType<typeof useMatchSettings>;

type MatchSettingsBodyProps = {
  flow: MatchSettingsFlow;
};

/** Scoring toggle + officials textareas — saves on change/blur. */
export function MatchSettingsBody({ flow }: MatchSettingsBodyProps) {
  const { readOnly, wagonWheel, text, updateLoading, onWagonChange, saveField, setOfficialText } = flow;
  const wagonWheelId = useId();

  return (
    <Form density="compact" className="flex-1 px-4 pt-3.5 pb-8" onSubmit={(e) => e.preventDefault()}>
      <SectionLabel>Scoring</SectionLabel>

      <div className="border-border-subtle bg-surface rounded-card border p-3.5">
        <label htmlFor={wagonWheelId} className={cn('flex items-center gap-2.5', readOnly && 'opacity-60')}>
          <span className="min-w-0 flex-1">
            <span className="block text-body-sm font-bold text-ink">Wagon Wheel</span>
            <span className="text-dim mt-px block text-3xs leading-snug">{wagonWheelStatusHint(wagonWheel)}</span>
          </span>
          <Switch
            id={wagonWheelId}
            checked={wagonWheel}
            disabled={readOnly || updateLoading}
            onCheckedChange={onWagonChange}
          />
        </label>
        <p className="border-border-subtle bg-page-deep text-muted mt-2.5 rounded-panel border px-2.5 py-2.5 text-3xs leading-relaxed">
          When this is on, every ball that scores runs prompts for shot direction before it stores. That&apos;s what
          fills the wagon wheel and the off-side / leg-side split in Stats — turn it off and those charts stay empty for
          the rest of the match.
        </p>
      </div>

      <SectionLabel>Match officials · one name per line</SectionLabel>

      {OFFICIAL_FIELDS.map(([key, label]) => {
        const count = linesOf(text[key]).length;
        return (
          <Textarea
            key={key}
            label={label}
            hint={officialsNameHint(count)}
            value={text[key]}
            readOnly={readOnly}
            onChange={(e) => setOfficialText(key, e.target.value)}
            onBlur={() => saveField(key)}
            placeholder="One Name per Line"
            maxLength={2000}
            className="min-h-[62px] rounded-panel text-2xs leading-relaxed"
          />
        );
      })}

      <p className="text-dim text-3xs leading-relaxed">{matchSettingsFooterNote(readOnly)}</p>
    </Form>
  );
}
