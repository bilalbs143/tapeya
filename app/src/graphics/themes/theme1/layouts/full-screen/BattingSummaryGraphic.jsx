/**
 * Ported from theme-controller — render-only graphic.
 */
import { cn } from '@/lib/utils';

import {
  accentGlowShadow,
  accentMix,
  DISPLAY_FONT,
  FSStage,
  isNotOutBatter,
  MONO_FONT,
  NotOutStar,
  TeamLogoOrCrest,
  UI_FONT,
} from '../../primitives';

const PANEL_LEFT = 70;
const PANEL_WIDTH = 1020;
const HERO_CREST_WIDTH = 700;
const HERO_CREST_SIZE = 460;
const PANEL_HEAD_CREST_SIZE = 92;

const BATTED_ROW_STAGGER_MS = 80;
const YET_TO_BAT_ROW_STAGGER_MS = 60;

const panelTitleClass = cn('m-0 text-[46px] font-extrabold leading-[0.98] tracking-[0.01em] text-white uppercase', DISPLAY_FONT);

const panelSubClass = cn('mt-1.5 mb-0 text-[24px] font-semibold tracking-[0.06em] text-[var(--muted)] uppercase', UI_FONT);

const battedNameClass = cn('flex-1 text-[40px] font-extrabold text-white uppercase', DISPLAY_FONT);

const dismissalClass = cn('flex-1 text-[26px] font-semibold tracking-[0.08em] text-[var(--muted)]', UI_FONT);

const battedRunsClass = cn('w-[110px] text-right text-[44px] font-extrabold text-white', DISPLAY_FONT);

const battedBallsClass = cn('w-[90px] text-right text-[28px] font-medium text-[var(--faint)]', MONO_FONT);

const yetToBatNameClass = cn('flex-1 text-[34px] font-bold text-[var(--muted)] uppercase', DISPLAY_FONT);

const scoreStripLabelClass = cn('text-[22px] font-semibold tracking-[0.14em] text-[var(--faint)] whitespace-nowrap', UI_FONT);

const scoreStripValueClass = cn('text-[38px] font-extrabold text-[var(--text)] whitespace-nowrap', DISPLAY_FONT);

const scoreStripTotalClass = cn(
  'text-[58px] font-extrabold leading-none text-white whitespace-nowrap',
  DISPLAY_FONT,
  '[text-shadow:0_0_calc(18px*var(--glow))_rgba(120,140,255,0.6)]',
);

/** @param {number} index */
function getBattedRowDelay(index) {
  return index * BATTED_ROW_STAGGER_MS;
}

/** @param {number} outCount @param {number} index */
function getYetToBatRowDelay(outCount, index) {
  return outCount * BATTED_ROW_STAGGER_MS + index * YET_TO_BAT_ROW_STAGGER_MS;
}

function resolveSub(data) {
  return data.sub ?? '';
}

function BattingSummaryPanelHead({ title, sub, accent, crestLogoUrl, team }) {
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

function ScoreStripMeta({ label, value }) {
  return (
    <div className="flex shrink-0 items-center gap-3 px-7">
      <span className={scoreStripLabelClass}>{label}</span>
      <span className={scoreStripValueClass}>{value}</span>
    </div>
  );
}

function BattingSummaryScoreStrip({ extras, overs, total, accent }) {
  return (
    <div
      className="mt-[18px] flex h-[92px] w-full items-stretch overflow-hidden rounded-[14px] border border-[rgba(120,140,255,0.28)] bg-[linear-gradient(180deg,rgba(22,28,42,0.92),rgba(11,15,24,0.95))]"
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

function BattedRow({ name, dismissal, runs, balls, notOut, accent, index }) {
  return (
    <div
      className="bc-animate-row-in mb-2 flex h-[78px] items-center rounded-xl px-[26px]"
      style={{
        animationDelay: `${getBattedRowDelay(index)}ms`,
        background: `linear-gradient(100deg, color-mix(in srgb, ${accent} 20%, transparent), rgba(18, 24, 40, 0.7) 70%)`,
        border: `1px solid color-mix(in srgb, ${accent} 33%, transparent)`,
        boxShadow: `0 0 calc(16px * var(--glow)) color-mix(in srgb, ${accent} 13%, transparent)`,
      }}
    >
      <span className={cn(battedNameClass, 'flex items-start')}>
        <span>{name}</span>
        <NotOutStar notOut={notOut} />
      </span>
      <span className={dismissalClass}>{dismissal}</span>
      <span className={battedRunsClass}>{runs}</span>
      <span className={battedBallsClass}>{balls}</span>
    </div>
  );
}

function YetToBatRow({ name, outCount, index }) {
  return (
    <div
      className="bc-animate-row-in flex h-14 items-center border-b border-white/10 px-[26px]"
      style={{ animationDelay: `${getYetToBatRowDelay(outCount, index)}ms` }}
    >
      <span className={yetToBatNameClass}>{name}</span>
    </div>
  );
}

function BattingSummaryHeroCrest({ crestLogoUrl, title, team, accent }) {
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

export function BattingSummaryGraphic({ data, teams }) {
  const team = data.teamCode ? (teams?.[data.teamCode] ?? null) : null;
  const accent = data.accent ?? team?.color ?? '#5b7cff';
  const title = data.title ?? team?.fullName ?? team?.displayName ?? '';
  const batsmen = data.batsmen ?? [];
  const batted = batsmen.filter((b) => !b.yetToBat);
  const yetToBat = batsmen.filter((b) => b.yetToBat);

  if (!batsmen.length || !data.scoreStrip) return null;

  return (
    <FSStage>
      <div className="absolute top-14 bottom-16 flex flex-col" style={{ left: PANEL_LEFT, width: PANEL_WIDTH }}>
        <BattingSummaryPanelHead
          title={title}
          sub={resolveSub(data)}
          accent={accent}
          crestLogoUrl={data.crestLogoUrl}
          team={team}
        />

        <div className="flex min-h-0 flex-1 flex-col">
          {batted.map((batter, index) => (
            <BattedRow
              key={batter.id ?? `batter-${index}`}
              name={batter.name}
              dismissal={batter.dismissal ?? ''}
              runs={batter.runs ?? 0}
              balls={batter.balls ?? 0}
              notOut={Boolean(batter.notOut ?? isNotOutBatter(batter))}
              accent={accent}
              index={index}
            />
          ))}
          {yetToBat.map((batter, index) => (
            <YetToBatRow key={batter.id ?? `batter-${index}`} name={batter.name} outCount={batted.length} index={index} />
          ))}
        </div>

        <BattingSummaryScoreStrip
          extras={data.scoreStrip.extras}
          overs={data.scoreStrip.overs}
          total={data.scoreStrip.total}
          accent={accent}
        />
      </div>

      <div className="absolute top-0 bottom-0 grid place-items-center" style={{ right: PANEL_LEFT, width: HERO_CREST_WIDTH }}>
        <BattingSummaryHeroCrest crestLogoUrl={data.crestLogoUrl} title={title} team={team} accent={accent} />
      </div>
    </FSStage>
  );
}
