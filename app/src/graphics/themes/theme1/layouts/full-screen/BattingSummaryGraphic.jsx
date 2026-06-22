/**
 * Ported from theme-controller — render-only graphic.
 */
import { cn } from '@/lib/utils';

import { batterScore, fsSummaryPanel } from '../../config';
import {
  accentGlowShadow,
  accentMix,
  BatterScoreInline,
  DISPLAY_FONT,
  FSStage,
  isNotOutBatter,
  NotOutStar,
  ROW_ANIMATE_IN,
  TeamLogoOrCrest,
} from '../../primitives';
import { accentHaloShadow } from '../../visualEffects';
import {
  FS_DISMISSAL,
  FS_PANEL_SUB,
  FS_PANEL_TITLE,
  FS_ROW_NAME,
  FS_SCORE_STRIP_HERO,
  FS_SCORE_STRIP_LABEL,
  FS_SCORE_STRIP_VALUE,
  fsFont,
} from '../shared/fsTypographyStyles';

const PANEL_LEFT = 70;
const PANEL_WIDTH = 1020;
const HERO_CREST_WIDTH = 700;
const HERO_CREST_SIZE = 460;
const PANEL_HEAD_CREST_SIZE = 92;
const BATTED_ROW_HEIGHT = 66;
const YET_TO_BAT_ROW_HEIGHT = 48;
const ROW_PADDING_X = 22;
const BATTED_ROW_GAP = 4;
const BATTED_ROW_STAGGER_MS = 80;
const YET_TO_BAT_ROW_STAGGER_MS = 60;

const yetToBatNameClass = cn('flex-1 font-bold leading-none text-[var(--text-secondary)] uppercase', DISPLAY_FONT);

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
        <h2 className={FS_PANEL_TITLE} style={fsFont(fsSummaryPanel.panelTitle)}>
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

function ScoreStripMeta({ label, value }) {
  return (
    <div className="flex shrink-0 items-center gap-3 px-7">
      <span className={FS_SCORE_STRIP_LABEL} style={fsFont(fsSummaryPanel.scoreStripLabel)}>
        {label}
      </span>
      <span className={FS_SCORE_STRIP_VALUE} style={fsFont(fsSummaryPanel.scoreStripValue)}>
        {value}
      </span>
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
        <span className={FS_SCORE_STRIP_HERO} style={fsFont(fsSummaryPanel.scoreStripHero)}>
          {total}
        </span>
      </div>
    </div>
  );
}

function BattedRow({ name, dismissal, runs, balls, notOut, accent, index }) {
  return (
    <div
      className={cn(ROW_ANIMATE_IN, 'flex items-center rounded-xl')}
      style={{
        height: BATTED_ROW_HEIGHT,
        marginBottom: BATTED_ROW_GAP,
        paddingInline: ROW_PADDING_X,
        animationDelay: `${getBattedRowDelay(index)}ms`,
        background: `linear-gradient(100deg, color-mix(in srgb, ${accent} 20%, transparent), rgba(18, 24, 40, 0.7) 70%)`,
        border: `1px solid color-mix(in srgb, ${accent} 33%, transparent)`,
        boxShadow: accentHaloShadow(accent, '16px'),
      }}
    >
      <span className={cn(FS_ROW_NAME, 'flex items-start')} style={fsFont(fsSummaryPanel.rowName)}>
        <span>{name}</span>
        <NotOutStar notOut={notOut} />
      </span>
      <span className={FS_DISMISSAL} style={fsFont(fsSummaryPanel.dismissal)}>
        {dismissal}
      </span>
      <span className="flex w-[120px] shrink-0 justify-end">
        <BatterScoreInline
          runs={runs}
          balls={balls}
          runsSize={fsSummaryPanel.rowRuns}
          ballsSize={fsSummaryPanel.rowBalls}
          gap={batterScore.gap}
          animateRuns={false}
        />
      </span>
    </div>
  );
}

function YetToBatRow({ name, outCount, index }) {
  return (
    <div
      className={cn(ROW_ANIMATE_IN, 'flex items-center border-b border-white/10')}
      style={{
        height: YET_TO_BAT_ROW_HEIGHT,
        paddingInline: ROW_PADDING_X,
        animationDelay: `${getYetToBatRowDelay(outCount, index)}ms`,
      }}
    >
      <span className={yetToBatNameClass} style={fsFont(fsSummaryPanel.rowNameSm)}>
        {name}
      </span>
    </div>
  );
}

function BattingSummaryHeroCrest({ crestLogoUrl, title, team, accent }) {
  return (
    <div className={ROW_ANIMATE_IN}>
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
