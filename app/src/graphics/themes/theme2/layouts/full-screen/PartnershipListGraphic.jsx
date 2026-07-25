/**
 * Partnership List FS — theme3 PartnershipListCore look.
 * Header uses theme1 placement + sectionTitle/headerSub + team logo; wine card chrome kept.
 * Contribution chips/bar use session team accent (left) + gold (right).
 */
import { cn } from '@/lib/utils';

import { colors, fsPartnership, fsSummaryPanel } from '../../config';
import { BatterScoreInline, DISPLAY_FONT, FSStage, normalizeAccentColor } from '../../primitives';
import { FsPageHeader } from '../shared/FsPageHeader';
import { fsFont } from '../shared/fsTypographyStyles';

const CARD_HEIGHT = 620;
const RIGHT_FALLBACK = colors.gold;
const RIGHT_TEXT = colors.panelPlayer;
const MIN_TIP = 6;

function resolveBarPercents(leftRuns, rightRuns) {
  const total = leftRuns + rightRuns;
  if (!total) return { leftPct: 50, rightPct: 50 };

  let leftPct = (leftRuns / total) * 100;
  let rightPct = 100 - leftPct;

  if (rightPct === 0) {
    leftPct = 100 - MIN_TIP;
    rightPct = MIN_TIP;
  } else if (leftPct === 0) {
    rightPct = 100 - MIN_TIP;
    leftPct = MIN_TIP;
  }

  return { leftPct, rightPct };
}

function ContributionBar({ leftRuns, rightRuns, partnershipBalls, leftColor, rightColor }) {
  const { leftPct, rightPct } = resolveBarPercents(leftRuns, rightRuns);
  const totalRuns = leftRuns + rightRuns;

  return (
    <div className="flex w-full items-center">
      <div
        className="relative flex w-full items-stretch overflow-hidden rounded-[10px]"
        style={{ height: 42, background: leftColor }}
      >
        <div
          className="relative flex min-w-0 items-center justify-start px-3"
          style={{ width: `${leftPct}%`, background: leftColor }}
        >
          <span
            className={cn('leading-none font-bold text-white tabular-nums', DISPLAY_FONT)}
            style={fsFont(fsPartnership.contributionValue)}
          >
            {leftRuns}
          </span>
        </div>
        <div
          className="relative flex min-w-0 items-center justify-end px-3"
          style={{ width: `${rightPct}%`, background: rightColor }}
        >
          <span
            className={cn('leading-none font-bold tabular-nums', DISPLAY_FONT)}
            style={{ color: RIGHT_TEXT, ...fsFont(fsPartnership.contributionValue) }}
          >
            {rightRuns}
          </span>
        </div>

        <span
          className="absolute top-1/2 z-[1] flex -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-0.5 rounded-md bg-black px-2"
          style={{ left: `${leftPct}%`, minWidth: 48, height: 28 }}
        >
          <span
            className={cn('leading-none font-black text-white tabular-nums', DISPLAY_FONT)}
            style={fsFont(fsPartnership.total)}
          >
            {totalRuns}
          </span>
          <span
            className={cn('relative top-[0.15em] self-start leading-none font-semibold text-white tabular-nums', DISPLAY_FONT)}
            style={fsFont(fsPartnership.totalBalls)}
          >
            {partnershipBalls}
          </span>
        </span>
      </div>
    </div>
  );
}

function PartnershipRow({ batters, balls, teamAccent }) {
  const [left, right] = batters;
  if (!left || !right) return null;

  const leftRuns = Number(left.runs) || 0;
  const rightRuns = Number(right.runs) || 0;
  const partnershipBalls = balls ?? (Number(left.balls) || 0) + (Number(right.balls) || 0);
  const leftColor = normalizeAccentColor(left.accent ?? teamAccent, colors.accentA);
  const rightColor = normalizeAccentColor(right.accent, RIGHT_FALLBACK);

  return (
    <div
      className="grid w-full items-center gap-4"
      style={{
        gridTemplateColumns: 'minmax(160px, 1fr) 110px minmax(280px, 1.4fr) 110px minmax(160px, 1fr)',
      }}
    >
      <div className="flex min-w-0 items-center justify-start gap-3">
        <span className="size-[18px] shrink-0 rounded-[3px]" style={{ background: leftColor }} aria-hidden="true" />
        <span
          className={cn('min-w-0 truncate font-bold tracking-[0.02em] text-white uppercase', DISPLAY_FONT)}
          style={fsFont(fsPartnership.batterName)}
        >
          {left.fullName}
        </span>
      </div>

      <div className="flex shrink-0 items-center justify-end">
        <BatterScoreInline
          runs={leftRuns}
          balls={left.balls ?? 0}
          runsSize={fsPartnership.batterRunsMd}
          ballsSize={fsPartnership.batterBalls}
          animateRuns={false}
        />
      </div>

      <ContributionBar
        leftRuns={leftRuns}
        rightRuns={rightRuns}
        partnershipBalls={partnershipBalls}
        leftColor={leftColor}
        rightColor={rightColor}
      />

      <div className="flex shrink-0 items-center justify-start">
        <BatterScoreInline
          runs={rightRuns}
          balls={right.balls ?? 0}
          runsSize={fsPartnership.batterRunsMd}
          ballsSize={fsPartnership.batterBalls}
          animateRuns={false}
        />
      </div>

      <div className="flex min-w-0 items-center justify-end gap-3">
        <span
          className={cn('min-w-0 truncate font-bold tracking-[0.02em] text-white uppercase', DISPLAY_FONT)}
          style={fsFont(fsPartnership.batterName)}
        >
          {right.fullName}
        </span>
        <span className="size-[18px] shrink-0 rounded-[3px]" style={{ background: rightColor }} aria-hidden="true" />
      </div>
    </div>
  );
}

function SummaryStrip({ extras, overs, total }) {
  if (extras == null && overs == null && (total == null || total === '')) return null;

  return (
    <div
      className="ml-auto flex shrink-0 items-center gap-[18px] rounded-[10px] px-[22px] py-3.5 shadow-[0_0_24px_rgba(0,0,0,0.3)]"
      style={{ background: colors.panelPlayer }}
      data-testid="partnership-list-summary"
    >
      {extras != null ? (
        <span
          className={cn('font-semibold tracking-[0.04em] text-white uppercase', DISPLAY_FONT)}
          style={fsFont(fsSummaryPanel.scoreStripValue)}
        >
          EXTRAS {extras}
        </span>
      ) : null}
      {overs != null && overs !== '' ? (
        <>
          <span className="w-px shrink-0 self-stretch bg-white/25" aria-hidden="true" />
          <span
            className={cn('font-semibold tracking-[0.04em] text-white uppercase', DISPLAY_FONT)}
            style={fsFont(fsSummaryPanel.scoreStripValue)}
          >
            OVERS {overs}
          </span>
        </>
      ) : null}
      {total != null && total !== '' ? (
        <>
          <span className="w-px shrink-0 self-stretch bg-white/25" aria-hidden="true" />
          <span className={cn('font-black text-white tabular-nums', DISPLAY_FONT)} style={fsFont(fsSummaryPanel.scoreStripHero)}>
            {total}
          </span>
        </>
      ) : null}
    </div>
  );
}

export function PartnershipListGraphic({ data, teams }) {
  const team = data.teamCode ? (teams?.[data.teamCode] ?? null) : null;
  const title = data.title ?? team?.fullName ?? team?.displayName ?? '';
  const accent = data.accent ?? team?.color ?? undefined;
  const partnerships = data.partnerships ?? [];

  if (!partnerships.length) return null;

  const strip = data.scoreStrip ?? null;

  return (
    <FSStage>
      <FsPageHeader
        title={title}
        sub={data.sub}
        size="section"
        logoUrl={data.crestLogoUrl ?? team?.logoUrl}
        logoCode={team?.code ?? team?.displayName?.slice(0, 3)}
        logoAlt={title}
        logoVariant="team"
        logoAccent={accent}
        logoTeam={team}
      />

      <div className="absolute top-[246px] right-24 bottom-16 left-24 z-[1] flex flex-col gap-7">
        <div
          className="relative my-auto flex w-full flex-col gap-7 rounded-xl px-10 py-9 shadow-[0_0_40px_rgba(0,0,0,0.35)]"
          style={{
            background: colors.panelPlayer,
            height: CARD_HEIGHT,
            minHeight: CARD_HEIGHT,
            maxHeight: CARD_HEIGHT,
          }}
          data-testid="partnership-list-panel"
        >
          <div className="flex w-full flex-col gap-7 overflow-hidden">
            {partnerships.map((partnership, index) => (
              <PartnershipRow
                key={`${partnership.batters?.[0]?.fullName}-${partnership.batters?.[1]?.fullName}-${index}`}
                batters={partnership.batters}
                balls={partnership.balls}
                teamAccent={accent}
              />
            ))}
          </div>

          <p
            className={cn('shrink-0 text-center font-semibold tracking-[0.12em] text-white/80 uppercase', DISPLAY_FONT)}
            style={fsFont(fsPartnership.contributionLabel)}
          >
            RUNS CONTRIBUTED
          </p>
        </div>

        {strip ? <SummaryStrip extras={strip.extras} overs={strip.overs} total={strip.total} /> : null}
      </div>
    </FSStage>
  );
}
