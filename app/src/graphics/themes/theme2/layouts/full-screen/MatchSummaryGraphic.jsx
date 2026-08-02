/**
 * Match Summary FS — theme3 MatchSummaryFsCore look.
 * Left: title + dual innings blocks + result band. Right: square logos + circular VS.
 */
import { cn } from '@/lib/utils';

import { colors, fsMatchSummary, fsSummaryPanel } from '../../config';
import {
  accentMix,
  BatterScoreInline,
  DISPLAY_FONT,
  FSStage,
  normalizeAccentColor,
  ROW_ANIMATE_IN,
  TeamLogoOrCrest,
  UI_FONT,
} from '../../primitives';
import { FsPageHeader } from '../shared/FsPageHeader';
import { fsFont } from '../shared/fsTypographyStyles';
import { BREAK_TILE_SIZE, BreakCenterBadge } from './vsBreak';

/** Match breaks + chart right-column crest scale. */
const LOGO_SIZE = BREAK_TILE_SIZE;
const MAX_INNINGS_ROWS = 6;
/** Same stage gutters as Batting / Bowling Summary FS. */
const PANEL_LEFT = 70;
const PANEL_WIDTH = 1020;
const HERO_CREST_WIDTH = 700;
/** Same vertical rhythm as ChartRightCrests. */
const CREST_STACK_GAP = 26;

const teamNameClass = cn('min-w-0 truncate font-bold tracking-[0.03em] text-white uppercase', DISPLAY_FONT);
const oversClass = cn('justify-self-center font-semibold tracking-[0.04em] text-white uppercase', UI_FONT);
const scoreClass = cn('font-black tabular-nums text-white', DISPLAY_FONT);
const playerClass = cn('min-w-0 truncate font-bold tracking-[0.02em] text-white uppercase', DISPLAY_FONT);
const runsClass = cn('font-black tabular-nums text-white', DISPLAY_FONT);
const ballsClass = cn('font-semibold tabular-nums text-white/90', UI_FONT);

/** @param {number} index */
function panelFillForIndex(index) {
  return index === 1 ? colors.panelBowler : colors.panelPlayer;
}

function resolveSub(data) {
  return data.sub ?? '';
}

function resolveInningsShortName(innings, teams) {
  if (innings.shortName) return innings.shortName;
  const team = innings.teamCode ? (teams?.[innings.teamCode] ?? null) : null;
  return team?.displayName ?? team?.fullName ?? team?.name ?? team?.code ?? '';
}

function formatScore(total, wickets) {
  if (total == null && wickets == null) return '0-0';
  return `${total ?? 0}-${wickets ?? 0}`;
}

function resolveInningsAccent(innings, teams, index) {
  const direct = String(innings?.accent ?? '').trim();
  if (direct) return direct;
  const team = innings?.teamCode ? (teams?.[innings.teamCode] ?? null) : null;
  if (team?.color) return normalizeAccentColor(team.color);
  return panelFillForIndex(index);
}

function resolveCrestSide(crest, teams, index) {
  const team = crest?.teamCode ? (teams?.[crest.teamCode] ?? null) : null;
  return {
    logoUrl: crest?.crestLogoUrl ?? crest?.logoUrl ?? team?.logoUrl ?? null,
    name: crest?.name ?? team?.displayName ?? team?.fullName ?? team?.name ?? '',
    code: team?.code ?? crest?.shortName ?? crest?.teamCode ?? '?',
    team,
    accent: crest?.accent ?? team?.color ?? panelFillForIndex(index),
  };
}

function MatchSummaryHeader({ title = 'MATCH SUMMARY', sub, logoUrl }) {
  return (
    <FsPageHeader
      title={title}
      sub={sub}
      size="match"
      logoUrl={logoUrl}
      logoAlt={title}
      logoVariant="tournament"
      absolute={false}
      className="shrink-0"
    />
  );
}

function InningsHeaderBar({ shortName, overs, total, wickets, accent, index }) {
  const barAccent = normalizeAccentColor(accent, panelFillForIndex(index));

  return (
    <div
      className={cn('grid w-full items-center rounded-[10px] px-[22px] py-3', ROW_ANIMATE_IN)}
      style={{
        gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1fr) auto',
        columnGap: 16,
        minHeight: 64,
        background: `linear-gradient(100deg, ${barAccent} 0%, ${accentMix(barAccent, 50)} 45%, transparent 100%)`,
        animationDelay: `${index * 220}ms`,
      }}
    >
      <span className={teamNameClass} style={fsFont(fsMatchSummary.inningsShortName)}>
        {shortName}
      </span>
      <span className={oversClass} style={fsFont(fsMatchSummary.inningsOvers)}>
        {overs != null && overs !== '' ? `${overs} OVERS` : ''}
      </span>
      <span className={scoreClass} style={fsFont(fsMatchSummary.inningsTotal)}>
        {formatScore(total, wickets)}
      </span>
    </div>
  );
}

function BatterCell({ batter, delay }) {
  if (!batter) return null;

  return (
    <div
      className={cn('grid w-full min-w-0 content-center items-baseline border-b border-white/28 py-2.5', ROW_ANIMATE_IN)}
      style={{
        gridTemplateColumns: 'minmax(0, 1fr) auto',
        columnGap: 14,
        minHeight: 44,
        animationDelay: `${delay}ms`,
      }}
    >
      <span className={playerClass} style={fsFont(fsSummaryPanel.rowNameMd)}>
        {batter.name ?? ''}
        {batter.notOut ? <span className="ml-0.5 text-[#e8c84a]">*</span> : null}
      </span>
      <BatterScoreInline
        runs={batter.runs ?? 0}
        balls={batter.balls ?? 0}
        runsSize={fsSummaryPanel.rowRuns}
        ballsSize={fsSummaryPanel.rowBalls}
        animateRuns={false}
      />
    </div>
  );
}

function BowlerCell({ bowler, delay }) {
  if (!bowler) return null;

  return (
    <div
      className={cn('grid w-full min-w-0 content-center items-baseline border-b border-white/28 py-2.5', ROW_ANIMATE_IN)}
      style={{
        gridTemplateColumns: 'minmax(0, 1fr) auto auto',
        columnGap: 14,
        minHeight: 44,
        animationDelay: `${delay}ms`,
      }}
    >
      <span className={playerClass} style={fsFont(fsSummaryPanel.rowNameMd)}>
        {bowler.name ?? ''}
      </span>
      <span className={runsClass} style={fsFont(fsMatchSummary.bowlerFigures)}>
        {bowler.wickets ?? 0}-{bowler.runs ?? 0}
      </span>
      <span className={ballsClass} style={fsFont(fsMatchSummary.inningsOvers)}>
        {bowler.overs ?? '0.0'}
      </span>
    </div>
  );
}

function InningsBlock({ shortName, total, wickets, overs, batsmen, bowlers, accent, index }) {
  const bats = (batsmen ?? []).slice(0, MAX_INNINGS_ROWS);
  const bowl = (bowlers ?? []).slice(0, MAX_INNINGS_ROWS);
  const baseDelay = index * 220;

  return (
    <section className="flex w-full flex-col gap-3.5">
      <InningsHeaderBar shortName={shortName} overs={overs} total={total} wickets={wickets} accent={accent} index={index} />

      <div className="flex w-full px-1.5" style={{ columnGap: 48 }}>
        <div className="min-w-0 flex-[1.35]">
          {bats.map((batter, rowIndex) => (
            <BatterCell key={`bat-${batter.name ?? rowIndex}`} batter={batter} delay={baseDelay + 80 + rowIndex * 90} />
          ))}
        </div>

        <div className="min-w-0 flex-1">
          {bowl.map((bowler, rowIndex) => (
            <BowlerCell key={`bowl-${bowler.name ?? rowIndex}`} bowler={bowler} delay={baseDelay + 120 + rowIndex * 90} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ResultBand({ label }) {
  if (!label) return null;

  return (
    <div
      className="mt-auto flex w-full shrink-0 items-center self-start rounded-lg px-[22px] py-3"
      style={{
        minHeight: 52,
        background: 'linear-gradient(180deg, #f0d44a 0%, #e0c05a 50%, #c9a227 100%)',
      }}
    >
      <span
        className={cn('font-black tracking-[0.04em] text-black uppercase', DISPLAY_FONT)}
        style={fsFont(fsSummaryPanel.goldBand)}
      >
        {label}
      </span>
    </div>
  );
}

function LogoFrame({ side, borderPulseOrder }) {
  return (
    <TeamLogoOrCrest
      logoUrl={side.logoUrl}
      team={side.team}
      name={side.name}
      shortName={side.code}
      accent={side.accent}
      size={LOGO_SIZE}
      borderPulseOrder={borderPulseOrder}
    />
  );
}

function MatchSummaryCrests({ top, bottom }) {
  return (
    <aside
      className="absolute top-0 bottom-0 z-[1] flex flex-col items-center justify-center"
      style={{ right: PANEL_LEFT, width: HERO_CREST_WIDTH, gap: CREST_STACK_GAP }}
      aria-label="Teams"
    >
      <LogoFrame side={top} borderPulseOrder={1} />
      <BreakCenterBadge />
      <LogoFrame side={bottom} borderPulseOrder={2} />
    </aside>
  );
}

/**
 * @param {{
 *   data: {
 *     sub?: string,
 *     title?: string,
 *     needTargetLabel?: string,
 *     result?: string,
 *     crests?: { top: object, bottom: object },
 *     innings: Array<object>,
 *   },
 *   teams: Record<string, object>,
 * }} props
 */
export function MatchSummaryGraphic({ data, teams }) {
  const inningsBlocks = data.innings ?? [];
  if (!inningsBlocks.length) return null;

  const resultLabel = data.result || data.needTargetLabel || '';
  const crests = data.crests
    ? {
        top: resolveCrestSide(data.crests.top, teams, 0),
        bottom: resolveCrestSide(data.crests.bottom, teams, 1),
      }
    : null;

  return (
    <FSStage>
      <div className="absolute top-14 bottom-14 z-[1] flex flex-col gap-[18px]" style={{ left: PANEL_LEFT, width: PANEL_WIDTH }}>
        <MatchSummaryHeader title={data.title} sub={resolveSub(data)} logoUrl={data.logoUrl} />

        <div className="flex min-h-0 w-full flex-1 flex-col justify-start gap-7">
          {inningsBlocks.map((innings, index) => (
            <InningsBlock
              key={`${innings.teamCode ?? innings.shortName}-${index}`}
              shortName={resolveInningsShortName(innings, teams)}
              total={innings.total}
              wickets={innings.wickets}
              overs={innings.overs}
              batsmen={innings.batsmen}
              bowlers={innings.bowlers}
              accent={resolveInningsAccent(innings, teams, index)}
              index={index}
            />
          ))}
        </div>

        <ResultBand label={resultLabel} />
      </div>

      {crests ? <MatchSummaryCrests top={crests.top} bottom={crests.bottom} /> : null}
    </FSStage>
  );
}
