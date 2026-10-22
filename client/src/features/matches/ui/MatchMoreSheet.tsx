import { useNavigate } from 'react-router-dom';

import { BaseDialog, DialogBody, DialogDescription, DialogHeader, DialogTitle } from '@/shared/dialogs/BaseDialog';
import { cn } from '@/shared/lib/cn';
import { BarChartIcon, BroadcastIcon, InfoIcon, ListIcon, SettingsIcon } from '@/shared/ui/icons';

import { matchRoutes } from '../routes';

export type MoreTabId = 'partnership' | 'stats' | 'info';

const TABS: Array<{ id: MoreTabId; title: string; hint: string; icon: MoreIconName }> = [
  { id: 'partnership', title: 'Partnership', hint: 'Every stand, both innings', icon: 'list' },
  { id: 'stats', title: 'Stats', hint: 'Run worm, wagon wheel, player numbers', icon: 'chart' },
  { id: 'info', title: 'Info', hint: 'Toss, venue, overs, match id', icon: 'info' },
];

type MatchMoreSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matchId: number;
  /** Operator rows (settings) — hidden for view-only. */
  canOperate?: boolean | undefined;
  onSelectTab: (id: MoreTabId) => void;
};

type MoreIconName = 'list' | 'chart' | 'info' | 'settings' | 'broadcast';

/** (settings + broadcast graphics). */

export function MatchMoreSheet({ open, onOpenChange, matchId, canOperate = false, onSelectTab }: MatchMoreSheetProps) {
  const navigate = useNavigate();

  return (
    <BaseDialog open={open} onOpenChange={onOpenChange} sheet contentClassName="tab:max-w-dialog">
      <DialogHeader>
        <DialogTitle>This Match</DialogTitle>
        <DialogDescription className="font-mono text-3xs font-medium tracking-eyebrow uppercase">
          Everything the old six-tab strip held
        </DialogDescription>
      </DialogHeader>

      <DialogBody>
        <div className={cn('flex flex-col gap-2')}>
          {TABS.map((t) => (
            <MoreRow
              key={t.id}
              title={t.title}
              hint={t.hint}
              tone="brand"
              icon={t.icon}
              onClick={() => {
                onSelectTab(t.id);
                onOpenChange(false);
              }}
            />
          ))}
        </div>

        {canOperate ? (
          <div className="mt-3">
            <p className="font-mono text-dim mb-2 text-4xs font-bold tracking-eyebrow uppercase">Operator</p>
            <div className="flex flex-col gap-2">
              <MoreRow
                title="Broadcast Graphics"
                hint="Overlay feed for the stream"
                tone="positive"
                icon="broadcast"
                onClick={() => {
                  onOpenChange(false);
                  navigate(matchRoutes.graphics(matchId));
                }}
              />
              <MoreRow
                title="Match Settings"
                hint="Wagon wheel, umpires, scorers, commentators"
                tone="muted"
                icon="settings"
                onClick={() => {
                  onOpenChange(false);
                  navigate(matchRoutes.settings(matchId));
                }}
              />
            </div>
          </div>
        ) : null}
      </DialogBody>
    </BaseDialog>
  );
}

function MoreRow({
  title,
  hint,
  tone,
  icon,
  onClick,
}: {
  title: string;
  hint: string;
  tone: 'brand' | 'muted' | 'positive';
  icon: MoreIconName;
  onClick: () => void;
}) {
  const chip =
    tone === 'positive'
      ? 'bg-positive/16 text-positive'
      : tone === 'muted'
        ? 'bg-page-deep text-muted'
        : 'bg-brand/12 text-brand-text';

  return (
    <button
      type="button"
      onClick={onClick}
      className="border-border-subtle bg-surface focus-visible:outline-brand hover:bg-surface-raised flex min-h-14 w-full items-center gap-3 rounded-card border px-3.5 text-left focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      <span className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-icon', chip)}>
        <MoreIcon name={icon} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-ink">{title}</span>
        <span className="text-muted block text-3xs">{hint}</span>
      </span>
      <span className="text-dim text-sm font-semibold" aria-hidden>
        ›
      </span>
    </button>
  );
}

function MoreIcon({ name }: { name: MoreIconName }) {
  const className = 'h-4 w-4';
  if (name === 'list') return <ListIcon className={className} />;
  if (name === 'chart') return <BarChartIcon className={className} />;
  if (name === 'info') return <InfoIcon className={className} />;
  if (name === 'broadcast') return <BroadcastIcon className={className} />;
  return <SettingsIcon className={className} />;
}
