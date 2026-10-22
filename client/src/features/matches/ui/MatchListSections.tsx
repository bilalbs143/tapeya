import { cn } from '@/shared/lib/cn';

import { sectionLabelClass } from '../lib/format';
import { type Match, MATCH_SECTIONS, type MatchSection } from '../model/schemas';
import { DoneMatchRow, ScheduledMatchRow } from './ScheduledMatchRow';
import { ScorerLiveCard } from './ScorerLiveCard';
import { TossPendingCard } from './TossPendingCard';

type MatchListSectionsProps = {
  matches: Match[];
  onResume: (match: Match) => void;
  onSaveToss: (match: Match) => void;
  onOpen: (match: Match) => void;
};

export function MatchListSections({ matches, onResume, onSaveToss, onOpen }: MatchListSectionsProps) {
  return (
    <>
      {MATCH_SECTIONS.map((section) => {
        const rows = matches.filter((m) => m.section === section.key);
        if (!rows.length) return null;
        return (
          <section key={section.key} aria-labelledby={`matches-section-${section.key}`}>
            <SectionHeading id={`matches-section-${section.key}`} section={section.key} label={section.label} />
            <SectionBody
              section={section.key}
              rows={rows}
              onResume={onResume}
              onSaveToss={onSaveToss}
              onOpen={onOpen}
            />
          </section>
        );
      })}
    </>
  );
}

function SectionHeading({ id, section, label }: { id: string; section: MatchSection; label: string }) {
  return (
    <div className={cn('mb-2.5 flex items-center gap-2', section !== 'live' && 'mb-2')}>
      {section === 'live' ? (
        <span
          className="bg-positive h-1.5 w-1.5 shrink-0 rounded-full shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-positive)_22%,transparent)]"
          aria-hidden
        />
      ) : null}
      <p id={id} className={sectionLabelClass(section)}>
        {label}
      </p>
    </div>
  );
}

function SectionBody({
  section,
  rows,
  onResume,
  onSaveToss,
  onOpen,
}: {
  section: MatchSection;
  rows: Match[];
  onResume: (match: Match) => void;
  onSaveToss: (match: Match) => void;
  onOpen: (match: Match) => void;
}) {
  if (section === 'live') {
    return (
      <ul className="flex flex-col gap-2.5">
        {rows.map((m) => (
          <li key={m.id}>
            <ScorerLiveCard match={m} onResume={() => onResume(m)} />
          </li>
        ))}
      </ul>
    );
  }

  if (section === 'toss') {
    return (
      <ul className="flex flex-col gap-2.5">
        {rows.map((m) => (
          <li key={m.id}>
            <TossPendingCard match={m} onSaveToss={() => onSaveToss(m)} />
          </li>
        ))}
      </ul>
    );
  }

  if (section === 'scheduled') {
    return (
      <div className="border-border-subtle bg-surface overflow-hidden rounded-panel border">
        {rows.map((m, i) => (
          <ScheduledMatchRow
            key={m.id}
            match={m}
            onOpen={() => onOpen(m)}
            className={i < rows.length - 1 ? 'border-border-subtle border-b' : undefined}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="border-border-subtle bg-surface overflow-hidden rounded-panel border">
      {rows.map((m, i) => (
        <DoneMatchRow
          key={m.id}
          match={m}
          onOpen={() => onOpen(m)}
          className={i < rows.length - 1 ? 'border-border-subtle border-b' : undefined}
        />
      ))}
    </div>
  );
}
