/**
 * Ported from theme-controller — render-only graphic.
 */
import { cn } from '@/lib/utils';

import { colors } from '../../config';
import { AnimatedNumber, DISPLAY_FONT, FSStage, GlowPanel, UI_FONT } from '../../primitives';

const INNING_FIGURES_GOLD = colors.gold;

const CARD_WIDTH = 920;

const headerTitleClass = cn(
  'm-0 text-[46px] font-extrabold leading-[0.98] tracking-[0.01em] text-white uppercase',
  DISPLAY_FONT,
  '[text-shadow:0_2px_18px_rgba(0,0,0,0.5)]',
);

const headerSubClass = cn('mt-1.5 mb-0 text-[24px] font-semibold tracking-[0.06em] text-[var(--muted)] uppercase', UI_FONT);

const labelBoxClass = cn(
  'inline-flex min-w-[132px] items-center justify-center rounded-lg border px-6 py-2.5',
  'bg-[linear-gradient(180deg,rgba(30,38,62,0.9),rgba(14,19,32,0.92))]',
  'text-[22px] font-extrabold tracking-[0.14em] text-white uppercase',
  DISPLAY_FONT,
);

const statValueClass = cn(
  'text-[120px] font-extrabold leading-[0.9] text-white',
  DISPLAY_FONT,
  '[text-shadow:0_0_calc(40px*var(--glow))_rgba(120,140,255,0.65)]',
);

const rrrBandTextClass = cn(
  'text-[30px] font-extrabold tracking-[0.06em] text-[#0a0e17] uppercase',
  'whitespace-nowrap',
  DISPLAY_FONT,
);

function resolveTitle(data) {
  return data.title ?? data.matchLine ?? data.matchHeader ?? '';
}

function resolveSub(data) {
  return data.sub ?? data.tournamentLine ?? '';
}

function StatLabelBox({ children, accent }) {
  return (
    <span
      className={labelBoxClass}
      style={{
        borderColor: accent
          ? `color-mix(in srgb, ${accent} 40%, transparent)`
          : 'color-mix(in srgb, var(--accentA) 40%, transparent)',
        boxShadow: accent ? `0 0 calc(18px * var(--glow)) color-mix(in srgb, ${accent} 20%, transparent)` : undefined,
      }}
    >
      {children}
    </span>
  );
}

function StatCell({ label, value, accent }) {
  return (
    <div className="flex flex-col items-center gap-5">
      <StatLabelBox accent={accent}>{label}</StatLabelBox>
      <AnimatedNumber value={value} className={statValueClass} />
    </div>
  );
}

function RequiredRunRateBand({ value }) {
  return (
    <div
      className="absolute bottom-0 left-1/2 grid h-[68px] min-w-[480px] -translate-x-1/2 translate-y-1/2 place-items-center rounded-xl px-10"
      style={{
        background: `linear-gradient(100deg, ${INNING_FIGURES_GOLD}, #d9a93a)`,
        boxShadow: `0 0 calc(20px * var(--glow)) ${INNING_FIGURES_GOLD}33`,
      }}
    >
      <span className={rrrBandTextClass}>REQUIRED RUN RATE : {value}</span>
    </div>
  );
}

function InningFiguresCard({ score, innings, wickets, overs, requiredRR, accent }) {
  const ringAccent = accent ?? colors.accentB;

  return (
    <div className="relative" style={{ width: CARD_WIDTH }}>
      <GlowPanel radius={28} accent={ringAccent} className="px-16 pt-14 pb-20">
        <div className="grid grid-cols-2 gap-x-12 gap-y-10">
          <StatCell label="SCORE" value={score} accent={ringAccent} />
          <StatCell label="INNINGS" value={innings} accent={ringAccent} />
          <StatCell label="WICKETS" value={wickets} accent={ringAccent} />
          <StatCell label="OVERS" value={overs} accent={ringAccent} />
        </div>
      </GlowPanel>

      {requiredRR ? <RequiredRunRateBand value={requiredRR} /> : null}
    </div>
  );
}

function InningFiguresHeader({ title, sub }) {
  return (
    <div className="absolute top-14 right-16 left-16 z-[3] flex items-start gap-7">
      <div className="min-w-0 flex-1">
        <h2 className={headerTitleClass}>{title}</h2>
        {sub ? <p className={headerSubClass}>{sub}</p> : null}
      </div>
    </div>
  );
}

export function InningFiguresGraphic({ data, teams }) {
  const team = data.teamCode ? (teams?.[data.teamCode] ?? null) : null;
  const accent = data.accent ?? team?.color ?? undefined;

  return (
    <FSStage>
      <InningFiguresHeader title={resolveTitle(data)} sub={resolveSub(data)} />

      <div className="absolute top-[250px] right-0 left-0 flex justify-center">
        <InningFiguresCard
          score={data.score}
          innings={data.innings}
          wickets={data.wickets}
          overs={data.overs}
          requiredRR={data.requiredRR}
          accent={accent}
        />
      </div>
    </FSStage>
  );
}
