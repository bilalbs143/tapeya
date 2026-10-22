import { type ReactNode, useMemo, useState } from 'react';

import { useGetEnumsQuery } from '@/shared/api/enumsApi';
import { cn } from '@/shared/lib/cn';
import { enumOptions } from '@/shared/model/enums';
import { EmptyState, ErrorState, Skeleton } from '@/shared/ui/states';

import type { StatsInnings, WagonBatter } from '../lib/statsFromScorecard';

type MatchSideMeta = {
  homeShort?: string | null | undefined;
  awayShort?: string | null | undefined;
};

type StatsPanelProps = {
  innings: StatsInnings[];
  match?: MatchSideMeta | undefined;
  loading?: boolean | undefined;
  error?: boolean | undefined;
  onRetry?: (() => void) | undefined;
};

const PHASES = [
  ['pp', 'PP'],
  ['mid', 'MID'],
  ['death', 'DEATH'],
  ['extras', 'EXTRAS'],
] as const;

const ZONE_FALLBACK_COLORS = ['#0063BF', '#0A78DE', '#008BBF', '#2AA449', '#5AC14F', '#4A7AB5', '#7C3AED', '#DB2777'];

function CardShell({ title, meta, children }: { title: string; meta?: string | undefined; children: ReactNode }) {
  return (
    <section
      aria-label={meta ? `${title}, ${meta}` : title}
      className="border-border-subtle bg-surface rounded-card border px-3.5 py-3.5"
    >
      <div className="flex items-baseline justify-between gap-2">
        <p className="font-mono text-dim text-4xs font-bold tracking-eyebrow uppercase">{title}</p>
        {meta ? <p className="font-mono text-dim text-4xs font-semibold tracking-eyebrow uppercase">{meta}</p> : null}
      </div>
      {children}
    </section>
  );
}

function Legend({ innings, match }: { innings: StatsInnings[]; match?: MatchSideMeta | undefined }) {
  const ordered = [...innings].reverse();
  return (
    <div className="flex items-center gap-3">
      {ordered.map((inn, i) => (
        <span key={inn.face.id} className="flex items-center gap-1.5">
          <span className={cn('h-1.5 w-1.5 rounded-full', i === 0 ? 'bg-brand' : 'bg-brand-cyan')} />
          <span className="text-dim text-4xs font-semibold">
            {inn.face.sideShort ||
              (inn.face.battingSide === 'home'
                ? match?.homeShort
                : inn.face.battingSide === 'away'
                  ? match?.awayShort
                  : inn.face.sideName) ||
              `INN ${inn.face.inningsNumber}`}
          </span>
        </span>
      ))}
    </div>
  );
}

function Bar({ value, max, tone }: { value: number | undefined; max: number; tone: 'brand' | 'cyan' }) {
  const v = value ?? 0;
  const h = Math.max(3, (v / max) * 100);
  return (
    <div
      className={cn('w-2 rounded-sm', tone === 'brand' ? 'bg-brand' : 'bg-brand-cyan')}
      style={{ height: `${h}%` }}
      title={`${v} run${v === 1 ? '' : 's'}`}
    />
  );
}

function HBar({ value, max, tone }: { value: number | undefined; max: number; tone: 'brand' | 'cyan' }) {
  const v = value ?? 0;
  const w = Math.max(4, (v / Math.max(1, max)) * 100);
  return (
    <div className="bg-page-deep h-2 overflow-hidden rounded-full">
      <div
        className={cn('h-full rounded-full', tone === 'brand' ? 'bg-brand' : 'bg-brand-cyan')}
        style={{ width: `${w}%` }}
      />
    </div>
  );
}

function arcPath(cx: number, cy: number, r: number, start: number, end: number): string {
  const x1 = cx + r * Math.cos(start);
  const y1 = cy + r * Math.sin(start);
  const x2 = cx + r * Math.cos(end);
  const y2 = cy + r * Math.sin(end);
  const large = end - start > Math.PI ? 1 : 0;
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
}

function WagonDial({ zoneCounts, zones }: { zoneCounts: Record<string, number>; zones: string[] }) {
  const order = zones.length ? zones : Object.keys(zoneCounts);
  const total = Math.max(
    1,
    order.reduce((s, z) => s + (zoneCounts[z] ?? 0), 0)
  );
  const cx = 54;
  const cy = 54;
  const r = 48;
  const wedges = order.reduce<Array<{ zone: string; start: number; end: number; color: string; intensity: number }>>(
    (acc, zone, i) => {
      const n = zoneCounts[zone] ?? 0;
      const sweep = (n / total) * Math.PI * 2 || (Math.PI * 2) / Math.max(1, order.length);
      const prev = acc[acc.length - 1];
      const start = prev ? prev.end : -Math.PI / 2;
      const end = start + sweep;
      const intensity = n ? 0.35 + (n / total) * 0.65 : 0.12;
      const color = ZONE_FALLBACK_COLORS[i % ZONE_FALLBACK_COLORS.length] ?? '#0063BF';
      return [...acc, { zone, start, end, color, intensity }];
    },
    []
  );

  return (
    <svg width="108" height="108" viewBox="0 0 108 108" aria-hidden className="shrink-0">
      <circle cx={cx} cy={cy} r={r} fill="var(--c-page-deep)" />
      {wedges.map((w) => (
        <path
          key={w.zone}
          d={arcPath(cx, cy, r, w.start, w.end)}
          fill={w.color}
          opacity={w.intensity}
          stroke="var(--c-surface)"
          strokeWidth="1.5"
        />
      ))}
      <circle cx={cx} cy={cy} r={14} fill="var(--c-surface)" />
      <line x1={cx} y1={cy - r} x2={cx} y2={cy + r} stroke="var(--c-border)" strokeWidth="1" />
      <line x1={cx - r} y1={cy} x2={cx + r} y2={cy} stroke="var(--c-border)" strokeWidth="1" />
    </svg>
  );
}

function WagonWheelCard({ batter, zoneOrder }: { batter: WagonBatter; zoneOrder: string[] }) {
  const foursRuns = batter.fours * 4;
  const sixesRuns = batter.sixes * 6;
  const legend: Array<[string, number, string | null]> = [
    ['Fours', foursRuns, '#0063BF'],
    ['Sixes', sixesRuns, '#0A78DE'],
    ['1s / 2s / 3s', batter.placed, '#008BBF'],
    ['Dots', batter.dots, null],
  ];

  return (
    <CardShell title="Wagon Wheel" meta={`${batter.runs} runs · ${batter.zonesUsed} scoring areas`}>
      <div className="mt-3 flex items-center gap-4">
        <WagonDial zoneCounts={batter.zoneCounts} zones={zoneOrder} />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          {legend.map(([label, value, color], i) => (
            <div key={label}>
              {i === 3 ? <div className="border-border-subtle mb-2 border-t" /> : null}
              <div className="flex items-center gap-2">
                {color ? (
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: color }} />
                ) : (
                  <span className="w-1.5" />
                )}
                <span className="text-muted flex-1 text-2xs font-semibold">{label}</span>
                <span className="font-mono text-xs font-extrabold text-ink tabular-nums">{value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </CardShell>
  );
}

function OffLegCard({ batter }: { batter: WagonBatter }) {
  const total = Math.max(1, batter.offRuns + batter.legRuns);
  return (
    <CardShell title="Off Side vs Leg Side">
      <div className="mt-3 flex flex-col gap-2.5">
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-dim w-16 shrink-0 text-4xs font-bold tracking-eyebrow uppercase">
            Off side
          </span>
          <div className="bg-page-deep h-2 flex-1 overflow-hidden rounded-full">
            <div
              className="bg-brand h-full rounded-full"
              style={{ width: `${Math.max(4, (batter.offRuns / total) * 100)}%` }}
            />
          </div>
          <span className="font-mono w-6 shrink-0 text-right text-2xs font-extrabold text-ink tabular-nums">
            {batter.offRuns}
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-dim w-16 shrink-0 text-4xs font-bold tracking-eyebrow uppercase">
            Leg side
          </span>
          <div className="bg-page-deep h-2 flex-1 overflow-hidden rounded-full">
            <div
              className="bg-brand-cyan h-full rounded-full"
              style={{ width: `${Math.max(4, (batter.legRuns / total) * 100)}%` }}
            />
          </div>
          <span className="font-mono w-6 shrink-0 text-right text-2xs font-extrabold text-ink tabular-nums">
            {batter.legRuns}
          </span>
        </div>
      </div>
    </CardShell>
  );
}

function NoShotDataCard({ sideName }: { sideName: string | null }) {
  return (
    <div className="border-border-subtle bg-surface flex flex-col items-center rounded-card border px-4 py-7 text-center">
      <p className="font-mono text-dim mb-2 text-4xs font-bold tracking-eyebrow uppercase">
        Empty — wagon wheel was off
      </p>
      <p className="text-sm font-bold text-ink">No Shot Data for This Innings</p>
      <p className="text-muted mt-1.5 max-w-70 text-2xs leading-relaxed">
        Wagon Wheel was off{sideName ? ` while ${sideName} batted` : ''}, so shot direction was never recorded. Turning
        it on now only affects balls from here.
      </p>
    </div>
  );
}

function OverComparisonCard({ innings, match }: { innings: StatsInnings[]; match?: MatchSideMeta | undefined }) {
  const ordered = [...innings].reverse();
  const [home, away] = ordered;
  const overs = Math.max(home?.overList.length ?? 0, away?.overList.length ?? 0);
  if (!overs) return null;

  const max = Math.max(1, ...(home?.overList ?? []).map((o) => o.runs), ...(away?.overList ?? []).map((o) => o.runs));

  return (
    <CardShell title="Over Comparison">
      <div className="mt-2 flex items-center justify-between gap-2">
        <Legend innings={innings} match={match} />
      </div>
      <div className="mt-3 flex items-end gap-1.5 overflow-x-auto pb-1">
        {Array.from({ length: overs }).map((_, i) => (
          <div key={i} className="flex shrink-0 flex-col items-center gap-1">
            <div className="flex h-17 items-end gap-0.5">
              <Bar value={home?.overList[i]?.runs} max={max} tone="brand" />
              {away ? <Bar value={away.overList[i]?.runs} max={max} tone="cyan" /> : null}
            </div>
            <span className="font-mono text-dim text-4xs tabular-nums">
              {i === 0 || i === overs - 1 || i + 1 === 9 || i + 1 === 18 ? `OV ${i + 1}` : i + 1}
            </span>
          </div>
        ))}
      </div>
    </CardShell>
  );
}

function PhaseComparisonCard({
  innings,
  match,
  emptyMode = false,
}: {
  innings: StatsInnings[];
  match?: MatchSideMeta | undefined;
  emptyMode?: boolean | undefined;
}) {
  const ordered = [...innings].reverse();
  const [home, away] = emptyMode ? innings : ordered;
  if (!home) return null;

  const max = Math.max(1, ...PHASES.map(([k]) => Math.max(home.phases[k] ?? 0, away?.phases[k] ?? 0)));

  if (emptyMode) {
    return (
      <CardShell title="Run Comparison · Still Available">
        <div className="mt-3 grid grid-cols-4 gap-2">
          {PHASES.map(([key, label]) => (
            <div key={key} className="bg-page-deep flex flex-col items-center rounded-icon px-1 py-2.5">
              <span className="font-mono text-body-sm font-extrabold text-ink tabular-nums">
                {home.phases[key] ?? 0}
              </span>
              {away ? (
                <span className="font-mono text-brand-cyan text-2xs font-bold tabular-nums">
                  {away.phases[key] ?? 0}
                </span>
              ) : null}
              <span className="font-mono text-dim mt-1 text-4xs font-bold tracking-eyebrow">{label}</span>
            </div>
          ))}
        </div>
        <p className="text-muted mt-2.5 text-3xs leading-relaxed">
          Runs by phase comes from the ball log, so it works whether or not shot direction was captured.
        </p>
      </CardShell>
    );
  }

  return (
    <CardShell title="Run Comparison">
      <div className="mt-2">
        <Legend innings={innings} match={match} />
      </div>
      <div className="mt-3 flex flex-col gap-2.5">
        {PHASES.map(([key, label]) => (
          <div key={key}>
            <p className="font-mono text-dim text-4xs font-bold tracking-eyebrow uppercase">{label}</p>
            <div className="mt-1 flex flex-col gap-1">
              <HBar value={home.phases[key]} max={max} tone="brand" />
              {away ? <HBar value={away.phases[key]} max={max} tone="cyan" /> : null}
            </div>
          </div>
        ))}
      </div>
    </CardShell>
  );
}

export function StatsPanel({ innings, match, loading, error, onRetry }: StatsPanelProps) {
  const { data: enums } = useGetEnumsQuery();
  const zoneOrder = useMemo(() => enumOptions(enums, 'shot_position').map((z) => z.value), [enums]);

  const sides = useMemo(
    () =>
      [...innings].reverse().map((inn) => ({
        key: String(inn.face.id),
        short:
          inn.face.sideShort ||
          (inn.face.battingSide === 'home'
            ? match?.homeShort
            : inn.face.battingSide === 'away'
              ? match?.awayShort
              : null) ||
          inn.face.sideName?.split(' ')[0] ||
          `INN ${inn.face.inningsNumber}`,
        inn,
      })),
    [innings, match]
  );

  const [sideKey, setSideKey] = useState<string | null>(null);
  const [batterId, setBatterId] = useState<number | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const activeSide = sides.find((s) => s.key === (sideKey ?? sides[0]?.key)) ?? sides[0] ?? null;
  const batters = activeSide?.inn.wagonWheel ?? [];
  const withShot = batters.filter((b) => b.hasShotData);
  const active = withShot.find((b) => b.id === batterId) ?? withShot[0] ?? null;

  if (loading) {
    return (
      <div className="flex flex-col gap-3 py-3">
        <Skeleton className="h-8 w-full rounded-icon" />
        <Skeleton className="h-40 w-full rounded-card" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8">
        <ErrorState title="Couldn't Load Stats" onRetry={onRetry} />
      </div>
    );
  }

  if (!innings.length) {
    return <EmptyState title="Nothing to Show Yet" description="Stats fill in as balls are scored." />;
  }

  return (
    <div className="flex flex-col gap-3 py-3">
      <div className="flex items-center gap-2">
        {sides.map((s) => {
          const on = s.key === (activeSide?.key ?? sideKey);
          return (
            <button
              key={s.key}
              type="button"
              aria-pressed={on}
              onClick={() => {
                setSideKey(s.key);
                setBatterId(null);
                setPickerOpen(false);
              }}
              className={cn(
                'focus-visible:outline-brand flex min-h-8 shrink-0 items-center rounded-icon px-3 text-3xs font-bold focus-visible:outline-2 focus-visible:outline-offset-2',
                on ? 'bg-brand text-white' : 'border-border-subtle bg-surface text-muted hover:text-ink border'
              )}
            >
              {s.short}
            </button>
          );
        })}

        <div className="relative ml-auto min-w-0">
          <button
            type="button"
            disabled={!withShot.length}
            onClick={() => setPickerOpen((o) => !o)}
            aria-expanded={pickerOpen}
            aria-haspopup="listbox"
            className={cn(
              'border-border-subtle bg-surface focus-visible:outline-brand flex min-h-8 max-w-37 items-center gap-1 rounded-icon border px-2.5 py-1.5 text-3xs font-bold focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-40',
              withShot.length ? 'text-ink' : 'text-dim'
            )}
          >
            <span className="truncate">{active?.name ?? 'No batter'}</span>
            {withShot.length ? (
              <span className="text-dim" aria-hidden>
                ›
              </span>
            ) : null}
          </button>
          {pickerOpen && withShot.length > 1 ? (
            <ul
              role="listbox"
              aria-label="Batter"
              className="border-border-subtle bg-surface shadow-card absolute top-full right-0 z-20 mt-1 min-w-40 overflow-hidden rounded-field border py-1"
            >
              {withShot.map((b) => (
                <li key={b.id} role="option" aria-selected={b.id === active?.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setBatterId(b.id);
                      setPickerOpen(false);
                    }}
                    className={cn(
                      'hover:bg-page-deep focus-visible:outline-brand flex w-full px-3 py-2 text-left text-2xs font-bold focus-visible:outline-2 focus-visible:-outline-offset-2',
                      b.id === active?.id ? 'text-brand-text' : 'text-ink'
                    )}
                  >
                    {b.name}
                    <span className="font-mono text-dim ml-auto pl-3 font-medium tabular-nums">
                      {b.runs}
                      {b.balls != null ? ` (${b.balls})` : ''}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      {active ? (
        <>
          <WagonWheelCard batter={active} zoneOrder={zoneOrder} />
          <OffLegCard batter={active} />
        </>
      ) : (
        <NoShotDataCard sideName={activeSide?.inn.face.sideName ?? null} />
      )}

      <OverComparisonCard innings={innings} match={match} />
      <PhaseComparisonCard innings={innings} match={match} emptyMode={!active} />
    </div>
  );
}
