/**
 * Ported from theme-controller — render-only graphic.
 */
import { cn } from '@/lib/utils';

import { colors, fsSummaryPanel } from '../../config';
import { AnimatedNumber, DISPLAY_FONT, FSStage, GlowPanel } from '../../primitives';
import { colorHaloShadow, textGlowClass } from '../../visualEffects';
import { FS_GOLD_BAND, FS_PANEL_SUB, FS_PANEL_TITLE, FS_TITLE_SHADOW, fsFont } from '../shared/fsTypographyStyles';

const INNING_FIGURES_GOLD = colors.gold;

const CARD_WIDTH = 920;

const labelBoxClass = cn(
  'inline-flex min-w-[132px] items-center justify-center rounded-lg border px-6 py-2.5',
  'bg-[linear-gradient(180deg,rgba(30,38,62,0.9),rgba(14,19,32,0.92))]',
  'font-extrabold tracking-[0.14em] text-white uppercase',
  DISPLAY_FONT,
);

const statValueClass = cn('font-extrabold leading-[0.9] text-white', DISPLAY_FONT, textGlowClass('heroLg'));

function resolveTitle(data) {
  return data.title ?? data.matchLine ?? data.matchHeader ?? '';
}

function resolveSub(data) {
  return data.sub ?? data.tournamentLine ?? '';
}

function StatLabelBox({ children }) {
  return (
    <span
      className={labelBoxClass}
      style={{
        ...fsFont(fsSummaryPanel.statLabelBox),
        borderColor: 'rgba(120,140,255,0.28)',
      }}
    >
      {children}
    </span>
  );
}

function StatCell({ label, value }) {
  return (
    <div className="flex flex-col items-center gap-5">
      <StatLabelBox>{label}</StatLabelBox>
      <AnimatedNumber value={value} className={statValueClass} style={fsFont(fsSummaryPanel.heroMetricMd)} />
    </div>
  );
}

function RequiredRunRateBand({ value }) {
  return (
    <div
      className="absolute bottom-0 left-1/2 grid h-[68px] min-w-[480px] -translate-x-1/2 translate-y-1/2 place-items-center rounded-xl px-10"
      style={{
        background: `linear-gradient(100deg, ${INNING_FIGURES_GOLD}, ${colors.goldDark})`,
        boxShadow: colorHaloShadow(INNING_FIGURES_GOLD),
      }}
    >
      <span className={FS_GOLD_BAND} style={fsFont(fsSummaryPanel.goldBand)}>
        REQUIRED RUN RATE : {value}
      </span>
    </div>
  );
}

function InningFiguresCard({ score, innings, wickets, overs, requiredRR, accent }) {
  const ringAccent = accent ?? colors.accentB;

  return (
    <div className="relative" style={{ width: CARD_WIDTH }}>
      <GlowPanel radius={28} accent={ringAccent} className="px-16 pt-14 pb-20">
        <div className="grid grid-cols-2 gap-x-12 gap-y-10">
          <StatCell label="SCORE" value={score} />
          <StatCell label="INNINGS" value={innings} />
          <StatCell label="WICKETS" value={wickets} />
          <StatCell label="OVERS" value={overs} />
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
        <h2 className={cn(FS_PANEL_TITLE, FS_TITLE_SHADOW)} style={fsFont(fsSummaryPanel.panelTitle)}>
          {title}
        </h2>
        {sub ? (
          <p className={FS_PANEL_SUB} style={fsFont(fsSummaryPanel.panelSub)}>
            {sub}
          </p>
        ) : null}
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
