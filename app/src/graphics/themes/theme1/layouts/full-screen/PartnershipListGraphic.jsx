/**
 * Ported from theme-controller — render-only graphic.
 */
import { cn } from '@/lib/utils';

import { colors, fsPartnership, fsSummaryPanel } from '../../config';
import {
  accentGlowShadow,
  accentMix,
  BatterScoreInline,
  Crest,
  DISPLAY_FONT,
  FSStage,
  GlowPanel,
  UI_FONT,
} from '../../primitives';
import {
  FS_HEADER_SUB_CENTERED,
  FS_SCORE_STRIP_HERO,
  FS_SCORE_STRIP_LABEL,
  FS_SCORE_STRIP_VALUE,
  FS_SECTION_TITLE,
  fsFont,
} from '../shared/fsTypographyStyles';

const PARTNERSHIP_LIST_GOLD = colors.gold;

const HEADER_CREST_SIZE = 104;
const SCORE_STRIP_WIDTH = 640;

const batterNameClass = cn('font-extrabold text-white uppercase whitespace-nowrap', DISPLAY_FONT);

const batterNameCompactClass = cn('font-extrabold text-white uppercase whitespace-nowrap', DISPLAY_FONT);

const contributionLabelClass = cn(
  'mt-4 text-center font-semibold tracking-[0.14em] text-[var(--text-secondary)] uppercase',
  UI_FONT,
);

const contributionValueClass = cn('font-extrabold', DISPLAY_FONT);

function resolvePartnerships(partnerships, accent) {
  return partnerships.map((entry) => ({
    batters: entry.batters.map((batter, index) => ({
      ...batter,
      accent: batter.accent ?? (index === 0 ? accent : PARTNERSHIP_LIST_GOLD),
    })),
  }));
}

function PartnershipListHeader({ title, sub, accent, crestLogoUrl, team }) {
  return (
    <div className="absolute top-14 right-16 left-16 z-[3] flex items-start gap-7">
      {crestLogoUrl ? (
        <div className="relative shrink-0" style={{ width: HEADER_CREST_SIZE, height: HEADER_CREST_SIZE }}>
          <img src={crestLogoUrl} alt={title} draggable={false} className="block size-full object-contain" />
        </div>
      ) : (
        <Crest team={team} size={HEADER_CREST_SIZE} accent={accent} />
      )}

      <div className="min-w-0 flex-1 pt-1">
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

function PartnershipBatterName({ name, runs, balls, accent, align = 'left', compact = false }) {
  const isRight = align === 'right';
  const accentDot = (
    <span
      className="size-3 shrink-0 rounded-[3px]"
      style={{
        background: accent,
        boxShadow: accentGlowShadow(accent, 100, '8px'),
      }}
    />
  );
  const score = (
    <BatterScoreInline
      runs={runs}
      balls={balls}
      runsSize={compact ? fsPartnership.batterRunsCompact : fsPartnership.batterRunsMd}
      ballsSize={compact ? fsPartnership.batterBallsCompact : fsPartnership.batterBalls}
      accentColor={accent}
      animateRuns={false}
    />
  );

  if (compact) {
    return (
      <div
        className={cn('inline-flex max-w-full items-center gap-2 whitespace-nowrap', isRight ? 'justify-end' : 'justify-start')}
      >
        {accentDot}
        <span className={batterNameCompactClass} style={fsFont(fsPartnership.batterNameCompact)}>
          {name}
        </span>
        <span className="inline-flex shrink-0 items-baseline gap-1.5">{score}</span>
      </div>
    );
  }

  return (
    <div className={cn('flex shrink-0 flex-col gap-1', isRight ? 'items-end' : 'items-start')}>
      <div className={cn('flex max-w-full items-center gap-2', isRight ? 'flex-row-reverse' : 'flex-row')}>
        {accentDot}
        <span className={batterNameClass} style={fsFont(fsPartnership.batterName)}>
          {name}
        </span>
      </div>

      <span className={cn('flex items-baseline gap-2', isRight ? 'justify-end' : 'justify-start')}>{score}</span>
    </div>
  );
}

function ContributionBar({ left, right, className, compact = false }) {
  const leftRuns = Number(left.runs) || 0;
  const rightRuns = Number(right.runs) || 0;
  const leftBalls = Number(left.balls) || 0;
  const rightBalls = Number(right.balls) || 0;
  const total = leftRuns + rightRuns;
  const totalBalls = leftBalls + rightBalls;
  const leftPct = total ? (leftRuns / total) * 100 : 50;
  const rightPct = total ? 100 - leftPct : 50;
  const rightAccent = right.accent ?? PARTNERSHIP_LIST_GOLD;

  return (
    <div className={cn('relative min-w-0', className)}>
      <div
        className={cn(
          'flex min-w-0 overflow-hidden rounded-[10px] border border-white/[0.12] bg-white/[0.05]',
          compact ? 'h-10' : 'h-11',
        )}
      >
        <div
          className="flex items-center pl-4"
          style={{
            width: `${leftPct}%`,
            background: `linear-gradient(90deg, ${accentMix(left.accent, 80)}, ${left.accent})`,
            boxShadow: accentGlowShadow(left.accent, 40),
          }}
        >
          <span className={`${contributionValueClass} text-white`} style={fsFont(fsPartnership.contributionValue)}>
            {left.runs}
          </span>
        </div>
        <div
          className="flex items-center justify-end pr-4"
          style={{
            width: `${rightPct}%`,
            background: `linear-gradient(90deg, ${rightAccent}, #d9a93a)`,
          }}
        >
          <span className={`${contributionValueClass} text-[#0a0e17]`} style={fsFont(fsPartnership.contributionValue)}>
            {right.runs}
          </span>
        </div>
      </div>

      <span
        className={cn(
          'pointer-events-none absolute top-1/2 z-10 inline-flex -translate-x-1/2 -translate-y-1/2 items-baseline gap-1.5',
          'rounded-[6px] border border-white/20 bg-[#0a0e17]/92 px-2.5 py-0.5 whitespace-nowrap',
        )}
        style={{ left: `${leftPct}%` }}
      >
        <BatterScoreInline
          runs={total}
          balls={totalBalls}
          runsSize={fsPartnership.total}
          ballsSize={fsPartnership.totalBalls}
          animateRuns={false}
        />
      </span>
    </div>
  );
}

function PartnershipItem({ batters }) {
  const [left, right] = batters;

  if (!left || !right) return null;

  const rightAccent = right.accent ?? PARTNERSHIP_LIST_GOLD;

  return (
    <div className="grid grid-cols-[1fr_minmax(200px,1.4fr)_1fr] items-center gap-4">
      <div className="justify-self-start">
        <PartnershipBatterName name={left.fullName} runs={left.runs} balls={left.balls} accent={left.accent} compact />
      </div>

      <ContributionBar
        className="w-full min-w-0"
        compact
        left={{ runs: left.runs, balls: left.balls, accent: left.accent }}
        right={{ runs: right.runs, balls: right.balls, accent: rightAccent }}
      />

      <div className="justify-self-end">
        <PartnershipBatterName
          name={right.fullName}
          runs={right.runs}
          balls={right.balls}
          accent={rightAccent}
          align="right"
          compact
        />
      </div>
    </div>
  );
}

function PartnershipBreakdownPanel({ partnerships }) {
  if (!partnerships.length) return null;

  return (
    <GlowPanel
      radius={28}
      accent={colors.accentB}
      pad={0}
      className="relative flex h-full w-full flex-col justify-start gap-5 overflow-hidden px-16 pt-10 pb-14"
    >
      {partnerships.map((partnership, index) => (
        <PartnershipItem key={`${partnership.batters[0]?.fullName}-${index}`} batters={partnership.batters} />
      ))}

      <div className={`${contributionLabelClass} mt-1`} style={fsFont(fsPartnership.contributionLabel)}>
        Runs Contributed
      </div>
    </GlowPanel>
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

function ScoreStrip({ extras, overs, total, accent }) {
  return (
    <div
      className="absolute right-0 bottom-[-22px] flex h-[92px] items-stretch overflow-hidden rounded-[14px] border border-[rgba(120,140,255,0.28)] bg-[linear-gradient(180deg,rgba(22,28,42,0.92),rgba(11,15,24,0.95))]"
      style={{
        width: SCORE_STRIP_WIDTH,
        boxShadow: accentGlowShadow(accent, 13, '20px'),
      }}
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

export function PartnershipListGraphic({ data, teams }) {
  const team = data.teamCode ? (teams?.[data.teamCode] ?? null) : null;
  const accent = data.accent ?? team?.color ?? '#5b7cff';
  const title = data.title ?? team?.fullName ?? team?.displayName ?? '';
  const partnerships = resolvePartnerships(data.partnerships ?? [], accent);

  if (!partnerships.length || !data.scoreStrip) return null;

  return (
    <FSStage>
      <PartnershipListHeader title={title} sub={data.sub} accent={accent} crestLogoUrl={data.crestLogoUrl} team={team} />

      <div className="absolute top-[246px] right-24 bottom-16 left-24">
        <PartnershipBreakdownPanel partnerships={partnerships} />
        <ScoreStrip extras={data.scoreStrip.extras} overs={data.scoreStrip.overs} total={data.scoreStrip.total} accent={accent} />
      </div>
    </FSStage>
  );
}
