import { useId, useState } from 'react';

import { buildMatchRulesViewModel } from '@/lib/utils/matchRulesViewModel';
import { DialogHeaderRow, dialogPrimaryTitleClass, DialogScrollBody, DialogTitle } from '@/ui/Dialog';
import { ToggleChevron } from '@/ui/ToggleChevron';

function RulesRow({ label, value }) {
  return (
    <div className="flex items-start gap-3 py-2 text-[13px]">
      <span className="text-muted w-[9.5rem] shrink-0 font-medium">{label}</span>
      <span className="min-w-0 flex-1 text-white">{value}</span>
    </div>
  );
}

function CollapsibleRulesSection({ title, defaultOpen = false, rows }) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <section className="border-border-subtle bg-surface rounded-lg border">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="focus-visible:ring-brand flex w-full items-center justify-between px-3 py-3 text-left focus:outline-none focus-visible:ring-2"
        aria-expanded={open}
        aria-controls={panelId}
      >
        <span className="text-[13px] font-medium text-white">{title}</span>
        <ToggleChevron open={open} />
      </button>
      {open ? (
        <div id={panelId} className="border-border-subtle divide-y divide-[#282824] border-t px-3">
          {rows.map((row) => (
            <RulesRow key={row.label} label={row.label} value={row.value} />
          ))}
        </div>
      ) : null}
    </section>
  );
}

/**
 * Action menu → Match Rules — read-only collapsible reference.
 *
 * @param {object|null} [match]  UI match config (`apiMatchToUiMatchConfig`)
 */
export function MatchRulesDialog({ match }) {
  const { dialogTitle, sections } = buildMatchRulesViewModel(match);

  return (
    <>
      <DialogHeaderRow>
        <DialogTitle className={dialogPrimaryTitleClass}>{dialogTitle}</DialogTitle>
      </DialogHeaderRow>

      <DialogScrollBody className="flex flex-col gap-4">
        {sections.map((section) => (
          <CollapsibleRulesSection key={section.id} title={section.title} defaultOpen={section.defaultOpen} rows={section.rows} />
        ))}
      </DialogScrollBody>
    </>
  );
}
