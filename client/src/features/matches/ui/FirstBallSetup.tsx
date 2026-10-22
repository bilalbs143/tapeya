import { cn } from '@/shared/lib/cn';
import { BallIcon, BatIcon, ClipboardIcon } from '@/shared/ui/icons';

type FirstBallSetupProps = {
  battingName: string;
  fieldingShort: string;
  squadSize: number;
  playersPerSide: number;
  /** What the crease still needs. */
  needs: 'openers' | 'bowler';
  battersDone: boolean;
  battersLabel?: string | undefined;
  /** Tournament (or empty XI) — must declare before crease. */
  needDeclareXi?: boolean | undefined;
  onDeclareXi?: (() => void) | undefined;
  onSelectBatters: () => void;
  onSelectBowler: () => void;
  className?: string | undefined;
};

/** SET THE FIRST BALL · N TO SET · Declare XI / Add Batsman / Add Bowler; pad stays locked. */

export function FirstBallSetup({
  battingName,
  fieldingShort,
  squadSize,
  playersPerSide,
  needs,
  battersDone,
  battersLabel,
  needDeclareXi = false,
  onDeclareXi,
  onSelectBatters,
  onSelectBowler,
  className,
}: FirstBallSetupProps) {
  const steps = [
    {
      key: 'xi',
      title: 'Declare the Batting XI',
      body: `${battingName} has ${squadSize} in the squad. Pick ${playersPerSide}, then the two at the crease and the opening bowler.`,
      action: 'Pick the XI',
      onAction: onDeclareXi,
      done: !needDeclareXi,
      show: needDeclareXi,
      muted: false,
      icon: 'xi' as const,
    },
    {
      key: 'crease',
      title: battersDone ? 'Batters Set' : 'Add Batsman',
      body: battersDone ? battersLabel || 'Openers Ready' : 'Pick two, mark who takes strike',
      action: 'Select',
      onAction: needDeclareXi ? undefined : onSelectBatters,
      done: battersDone && !needDeclareXi,
      show: true,
      muted: needDeclareXi,
      icon: 'bat' as const,
    },
    {
      key: 'bowler',
      title: 'Add Bowler',
      body: `From the ${fieldingShort} squad`,
      action: needs === 'bowler' ? 'Select' : 'Next',
      onAction: needDeclareXi || needs !== 'bowler' ? undefined : onSelectBowler,
      done: false,
      show: true,
      muted: needDeclareXi || needs === 'openers' || !battersDone,
      icon: 'bowl' as const,
    },
  ].filter((s) => s.show);

  const remaining = steps.filter((s) => !s.done).length;

  return (
    <div className={cn('border-border-subtle bg-surface overflow-hidden', className)}>
      <div className="flex min-h-9 items-center gap-2 px-3.5 pt-3 pb-2.5">
        <span className="font-mono text-brand-text text-4xs leading-normal font-bold tracking-eyebrow uppercase">
          Set the first ball
        </span>
        <span className="font-mono text-body ml-auto text-3xs leading-normal font-bold tracking-eyebrow uppercase">
          {remaining} to set
        </span>
      </div>

      <p className="text-dim px-3.5 pb-2 text-3xs leading-snug">
        {battingName} · {squadSize} in the playing XI
      </p>

      <div className="flex flex-col gap-2 px-2.5 pb-3">
        {steps.map((step) => (
          <SetupRow
            key={step.key}
            icon={step.icon}
            title={step.title}
            hint={step.body}
            done={step.done}
            muted={step.muted}
            action={step.done ? null : step.action}
            onAction={step.onAction}
          />
        ))}
      </div>
    </div>
  );
}

function SetupRow({
  icon,
  title,
  hint,
  action,
  onAction,
  muted,
  done,
}: {
  icon: 'bat' | 'bowl' | 'xi';
  title: string;
  hint: string;
  action: string | null;
  onAction?: (() => void) | undefined;
  muted: boolean;
  done: boolean;
}) {
  return (
    <div
      className={cn(
        'flex min-h-14 items-center gap-2.5 rounded-field border px-3 py-2',
        muted && !done ? 'border-border-subtle/60 bg-page-deep opacity-55' : 'border-border-subtle bg-page-deep',
        done && 'border-positive/35 bg-positive/10 opacity-100'
      )}
    >
      <SetupIcon kind={icon} active={!muted && !done} done={done} />
      <div className="min-w-0 flex-1">
        <p className={cn('text-body-sm font-bold', muted && !done ? 'text-muted' : 'text-ink')}>{title}</p>
        <p className="text-dim mt-0.5 text-3xs leading-snug">{hint}</p>
      </div>
      {action ? (
        onAction ? (
          <button
            type="button"
            onClick={onAction}
            className="bg-brand shrink-0 rounded-icon px-3.5 py-2 text-xs leading-normal font-bold text-white"
          >
            {action}
          </button>
        ) : (
          <span className="text-dim shrink-0 px-2 text-2xs leading-normal font-bold tracking-eyebrow uppercase">
            {action}
          </span>
        )
      ) : done ? (
        <span className="text-positive-2 font-mono shrink-0 text-3xs leading-normal font-bold tracking-eyebrow uppercase">
          Done
        </span>
      ) : null}
    </div>
  );
}

function SetupIcon({ kind, active, done }: { kind: 'bat' | 'bowl' | 'xi'; active: boolean; done: boolean }) {
  return (
    <span
      className={cn(
        'grid h-8 w-8 shrink-0 place-items-center rounded-icon',
        done ? 'bg-positive/20 text-positive-2' : active ? 'bg-brand/16 text-brand-text' : 'bg-surface-raised text-dim'
      )}
      aria-hidden
    >
      {kind === 'bowl' ? (
        <BallIcon className="h-4 w-4" strokeWidth={1.9} />
      ) : kind === 'xi' ? (
        <ClipboardIcon className="h-4 w-4" strokeWidth={1.9} />
      ) : (
        <BatIcon className="h-4 w-4" strokeWidth={1.9} />
      )}
    </span>
  );
}
