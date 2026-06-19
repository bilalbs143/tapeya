/**
 * Ported from theme-controller — render-only graphic.
 */
import { cn } from '@/lib/utils';

import { accentGlowShadow, accentMix, DISPLAY_FONT, FSStage, TeamLogoOrCrest, UI_FONT } from '../../primitives';

const PANEL_LEFT = 70;
const PANEL_WIDTH = 1020;
const HERO_CREST_WIDTH = 700;
const HERO_CREST_SIZE = 460;
const PANEL_HEAD_CREST_SIZE = 92;
const STAT_COL_WIDTH = 150;
const BOWLER_ROW_STAGGER_MS = 80;
const COLUMN_LABELS = ['OVERS', 'DOTS', 'RUNS', 'WICKETS', 'ECO'];

const panelTitleClass = cn('m-0 text-[46px] font-extrabold leading-[0.98] tracking-[0.01em] text-white uppercase', DISPLAY_FONT);

const panelSubClass = cn('mt-1.5 mb-0 text-[24px] font-semibold tracking-[0.06em] text-[var(--muted)] uppercase', UI_FONT);

const columnLabelClass = cn('text-center text-[24px] font-semibold tracking-[0.1em] text-[var(--faint)] uppercase', UI_FONT);

const bowlerNameClass = cn('flex-1 text-[38px] font-extrabold text-white uppercase', DISPLAY_FONT);

const statCellClass = cn('text-center text-[34px] font-bold text-[var(--text)]', DISPLAY_FONT);

const fowBandTextClass = cn(
  'text-[30px] font-extrabold tracking-[0.04em] text-[#0a0e17] uppercase',
  'whitespace-nowrap',
  DISPLAY_FONT,
);

const scoreStripLabelClass = cn('text-[22px] font-semibold tracking-[0.14em] text-[var(--faint)] whitespace-nowrap', UI_FONT);

const scoreStripValueClass = cn('text-[38px] font-extrabold text-[var(--text)] whitespace-nowrap', DISPLAY_FONT);

const scoreStripTotalClass = cn(
  'text-[58px] font-extrabold leading-none text-white whitespace-nowrap',
  DISPLAY_FONT,
  '[text-shadow:0_0_calc(18px*var(--glow))_rgba(120,140,255,0.6)]',
);

/** @param {number} index */
function getBowlerRowDelay(index) {
  return index * BOWLER_ROW_STAGGER_MS;
}

function resolveSub(data) {
  return data.sub ?? '';
}

function BowlingSummaryPanelHead({ title, sub, accent, crestLogoUrl, team }) {
  return (
    <div className="mb-[26px] flex items-center gap-6">
      <TeamLogoOrCrest logoUrl={crestLogoUrl} team={team} name={title} accent={accent} size={PANEL_HEAD_CREST_SIZE} plain />

      <div className="min-w-0">
        <h2 className={panelTitleClass}>{title}</h2>
        {sub ? <p className={panelSubClass}>{sub}</p> : null}
      </div>
    </div>
  );
}

function BowlingColumnHeader() {
  return (
    <div className="flex items-center px-[26px] pb-3.5">
      <span className="flex-1" />
      {COLUMN_LABELS.map((label) => (
        <span key={label} className={columnLabelClass} style={{ width: STAT_COL_WIDTH }}>
          {label}
        </span>
      ))}
    </div>
  );
}

function StatCell({ value }) {
  return (
    <span className={statCellClass} style={{ width: STAT_COL_WIDTH }}>
      {value}
    </span>
  );
}

function BowlerRow({ name, overs, dots, runs, wickets, eco, index }) {
  return (
    <div
      className="bc-animate-row-in flex h-[70px] items-center border-b border-white/10 px-[26px]"
      style={{ animationDelay: `${getBowlerRowDelay(index)}ms` }}
    >
      <span className={bowlerNameClass}>{name}</span>
      <StatCell value={overs} />
      <StatCell value={dots} />
      <StatCell value={runs} />
      <StatCell value={wickets} />
      <StatCell value={eco} />
    </div>
  );
}

function FallOfWicketsBand({ label = 'FALL OF WICKETS', accent, accentSecondary }) {
  const gradientEnd = accentSecondary ?? accent;

  return (
    <div
      className="mt-3.5 flex h-[60px] shrink-0 items-center rounded-xl px-7"
      style={{
        background: `linear-gradient(100deg, ${accent}, ${gradientEnd})`,
        boxShadow: accentGlowShadow(accent, 20, '18px'),
      }}
    >
      <span className={fowBandTextClass}>{label}</span>
    </div>
  );
}

function ScoreStripMeta({ label, value }) {
  return (
    <div className="flex shrink-0 items-center gap-3 px-7">
      <span className={scoreStripLabelClass}>{label}</span>
      <span className={scoreStripValueClass}>{value}</span>
    </div>
  );
}

function BowlingSummaryScoreStrip({ extras, overs, total, accent }) {
  return (
    <div
      className="mt-3.5 flex h-[92px] w-full items-stretch overflow-hidden rounded-[14px] border border-[rgba(120,140,255,0.28)] bg-[linear-gradient(180deg,rgba(22,28,42,0.92),rgba(11,15,24,0.95))]"
      style={{ boxShadow: accentGlowShadow(accent, 13, '20px') }}
    >
      <ScoreStripMeta label="EXTRAS" value={extras} />
      <div className="w-px shrink-0 bg-white/[0.12]" />
      <ScoreStripMeta label="OVERS" value={overs} />
      <div className="min-w-6 flex-1" />
      <div
        className="flex shrink-0 items-center px-9 pl-7"
        style={{ background: `linear-gradient(100deg, transparent, ${accentMix(accent, 20)})` }}
      >
        <span className={scoreStripTotalClass}>{total}</span>
      </div>
    </div>
  );
}

function BowlingSummaryHeroCrest({ crestLogoUrl, title, team, accent }) {
  return (
    <div className="bc-animate-row-in">
      <TeamLogoOrCrest
        logoUrl={crestLogoUrl}
        team={team}
        name={title}
        accent={accent}
        size={HERO_CREST_SIZE}
        borderPulseOrder={1}
      />
    </div>
  );
}

export function BowlingSummaryGraphic({ data, teams }) {
  const team = data.teamCode ? (teams?.[data.teamCode] ?? null) : null;
  const accent = data.accent ?? team?.color ?? '#5b7cff';
  const title = data.title ?? team?.fullName ?? team?.displayName ?? '';
  const bowlers = data.bowlers ?? [];

  if (!bowlers.length || !data.scoreStrip) return null;

  return (
    <FSStage>
      <div className="absolute top-14 bottom-16 flex flex-col" style={{ left: PANEL_LEFT, width: PANEL_WIDTH }}>
        <BowlingSummaryPanelHead
          title={title}
          sub={resolveSub(data)}
          accent={accent}
          crestLogoUrl={data.crestLogoUrl}
          team={team}
        />

        <BowlingColumnHeader />

        <div className="flex min-h-0 flex-1 flex-col">
          {bowlers.map((bowler, index) => (
            <BowlerRow
              key={bowler.name ? `bowler-${bowler.name}` : `bowler-${index}`}
              name={bowler.name}
              overs={bowler.overs}
              dots={bowler.dots}
              runs={bowler.runs}
              wickets={bowler.wickets}
              eco={bowler.eco}
              index={index}
            />
          ))}
          <div className="min-h-10 flex-1 border-b border-white/[0.07]" />
        </div>

        <FallOfWicketsBand label={data.fallOfWicketsLabel} accent={accent} accentSecondary={data.accentSecondary} />

        <BowlingSummaryScoreStrip
          extras={data.scoreStrip.extras}
          overs={data.scoreStrip.overs}
          total={data.scoreStrip.total}
          accent={accent}
        />
      </div>

      <div className="absolute top-0 bottom-0 grid place-items-center" style={{ right: PANEL_LEFT, width: HERO_CREST_WIDTH }}>
        <BowlingSummaryHeroCrest crestLogoUrl={data.crestLogoUrl} title={title} team={team} accent={accent} />
      </div>
    </FSStage>
  );
}
