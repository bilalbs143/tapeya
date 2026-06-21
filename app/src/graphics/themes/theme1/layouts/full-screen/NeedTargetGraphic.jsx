/**
 * Ported from theme-controller — render-only graphic.
 */
import { cn } from '@/lib/utils';

import { colors, fsSummaryPanel } from '../../config';
import { AnimatedNumber, FSStage, GlowPanel } from '../../primitives';
import { accentHaloShadow, colorHaloShadow, textGlowClass } from '../../visualEffects';
import { FS_CARD_TITLE, FS_GOLD_BAND, FS_HEADER_SUB_CENTERED, FS_SECTION_TITLE, fsFont } from '../shared/fsTypographyStyles';

const NEED_TARGET_GOLD = colors.gold;

const CARD_WIDTH = 920;

const labelBoxClass = cn(
  'inline-flex min-w-[132px] items-center justify-center rounded-lg border px-6 py-2.5',
  'bg-[linear-gradient(180deg,rgba(30,38,62,0.9),rgba(14,19,32,0.92))]',
  'font-extrabold tracking-[0.14em] text-white uppercase',
  '[font-family:var(--font-display)]',
);

const statValueClass = cn(
  'font-extrabold leading-[0.9] text-white',
  '[font-family:var(--font-display)]',
  textGlowClass('heroLg'),
);

function resolveHeaderTitle(data) {
  return data.headerTitle ?? '';
}

function resolveHeaderSub(data) {
  return data.sub ?? '';
}

function NeedTargetLabelBox({ children, accent }) {
  return (
    <span
      className={labelBoxClass}
      style={{
        ...fsFont(fsSummaryPanel.statLabelBox),
        borderColor: accent
          ? `color-mix(in srgb, ${accent} 40%, transparent)`
          : 'color-mix(in srgb, var(--accentA) 40%, transparent)',
        boxShadow: accent ? accentHaloShadow(accent) : undefined,
      }}
    >
      {children}
    </span>
  );
}

function NeedTargetStatColumn({ topLabel, bottomLabel, value, accent, padValue = false }) {
  const displayValue = padValue ? String(value).padStart(2, '0') : value;

  return (
    <div className="flex flex-col items-center gap-5">
      <NeedTargetLabelBox accent={accent}>{topLabel}</NeedTargetLabelBox>
      <AnimatedNumber value={displayValue} className={statValueClass} style={fsFont(fsSummaryPanel.heroMetricLg)} />
      <NeedTargetLabelBox accent={accent}>{bottomLabel}</NeedTargetLabelBox>
    </div>
  );
}

function WicketsFooterBand({ wickets }) {
  return (
    <div
      className="absolute bottom-0 left-1/2 grid h-[68px] min-w-[360px] -translate-x-1/2 translate-y-1/2 place-items-center rounded-xl px-10"
      style={{
        background: `linear-gradient(100deg, ${NEED_TARGET_GOLD}, #d9a93a)`,
        boxShadow: colorHaloShadow(NEED_TARGET_GOLD),
      }}
    >
      <span className={FS_GOLD_BAND} style={fsFont(fsSummaryPanel.goldBand)}>
        WITH {wickets} WICKETS
      </span>
    </div>
  );
}

function NeedTargetCard({ title, runsNeeded, ballsRemaining, wicketsRemaining, accent }) {
  const ringAccent = accent ?? colors.accentB;

  return (
    <div className="relative" style={{ width: CARD_WIDTH }}>
      <GlowPanel radius={28} accent={ringAccent} className="overflow-hidden px-16 pt-14 pb-20">
        <h2 className={FS_CARD_TITLE} style={fsFont(fsSummaryPanel.sectionTitle)}>
          {title}
        </h2>

        <div className="mt-10 grid grid-cols-2 gap-12">
          <NeedTargetStatColumn topLabel="NEED" bottomLabel="RUNS" value={runsNeeded} accent={ringAccent} />
          <NeedTargetStatColumn topLabel="FROM" bottomLabel="BALLS" value={ballsRemaining} accent={ringAccent} padValue />
        </div>
      </GlowPanel>

      <WicketsFooterBand wickets={wicketsRemaining} />
    </div>
  );
}

function NeedTargetHeader({ title, sub }) {
  return (
    <div className="absolute top-14 right-16 left-16 z-[3] flex items-start gap-7">
      <div className="min-w-0 flex-1">
        <h2 className={FS_SECTION_TITLE} style={fsFont(fsSummaryPanel.sectionTitle)}>
          {title}
        </h2>
        {sub ? (
          <p className={FS_HEADER_SUB_CENTERED} style={fsFont(fsSummaryPanel.headerSub)}>
            {sub}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function NeedTargetGraphic({ data, teams }) {
  const team = data.teamCode ? (teams?.[data.teamCode] ?? null) : null;
  const accent = data.accent ?? team?.color ?? undefined;
  const teamLabel = team?.code ?? team?.name ?? '';
  const cardTitle = data.title ?? `${teamLabel} TO WIN`;

  return (
    <FSStage>
      <NeedTargetHeader title={resolveHeaderTitle(data)} sub={resolveHeaderSub(data)} />

      <div className="absolute top-[250px] right-0 left-0 flex justify-center">
        <NeedTargetCard
          title={cardTitle}
          runsNeeded={data.runsNeeded}
          ballsRemaining={data.ballsRemaining}
          wicketsRemaining={data.wicketsRemaining}
          accent={accent}
        />
      </div>
    </FSStage>
  );
}
