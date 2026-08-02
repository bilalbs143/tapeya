/**
 * Batting Summary FS — theme3 BattingSummaryCore look.
 * Shared TeamLogoOrCrest (session team color plate) for header + hero.
 */
import { cn } from '@/lib/utils';

import { colors, fsSummaryPanel } from '../../config';
import { BatterScoreInline, DISPLAY_FONT, FSStage, isNotOutBatter, ROW_ANIMATE_IN, TeamLogoOrCrest } from '../../primitives';
import { FsPageHeader } from '../shared/FsPageHeader';
import { fsFont } from '../shared/fsTypographyStyles';

const CREST_SIZE = 340;
const PANEL_LEFT = 70;
const PANEL_WIDTH = 1020;
const HERO_CREST_WIDTH = 700;

function resolveSub(data) {
  return data.sub ?? '';
}

function BatterRow({ name, dismissal, runs, balls, notOut, onStrike, index, yetToBat }) {
  const showStar = onStrike != null ? Boolean(onStrike) : Boolean(notOut);
  const nameSize = yetToBat ? fsSummaryPanel.rowNameSm : fsSummaryPanel.rowName;

  return (
    <div
      className={cn(ROW_ANIMATE_IN, 'grid w-full shrink-0 items-center gap-3 rounded-lg border border-white/12 px-[18px] py-2')}
      style={{
        gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 1fr) auto',
        minHeight: 48,
        background: colors.panelPlayer,
        animationDelay: `${index * 60}ms`,
      }}
    >
      <span
        className={cn('min-w-0 truncate font-bold tracking-[0.03em] text-white uppercase', DISPLAY_FONT)}
        style={fsFont(nameSize)}
      >
        {name}
        {showStar ? <span className="ml-0.5 text-[#e8c84a]">*</span> : null}
      </span>
      <span
        className={cn('text-center font-medium tracking-[0.03em] text-white uppercase', DISPLAY_FONT)}
        style={fsFont(fsSummaryPanel.dismissal)}
      >
        {dismissal}
      </span>
      <span className="flex min-w-[72px] items-baseline justify-end">
        <BatterScoreInline
          runs={runs}
          balls={balls}
          runsSize={fsSummaryPanel.rowRuns}
          ballsSize={fsSummaryPanel.rowBalls}
          animateRuns={false}
        />
      </span>
    </div>
  );
}

function SummaryFooter({ extras, overs, total }) {
  return (
    <div
      className="flex w-full shrink-0 items-center justify-between rounded-[10px] border border-white/14 px-6 py-3"
      style={{ minHeight: 72, background: colors.panelPlayer }}
      data-testid="batting-summary-footer"
    >
      <div className="flex items-center gap-[18px]">
        <div className="flex items-baseline gap-2.5">
          <span
            className={cn('font-medium tracking-[0.04em] text-white uppercase', DISPLAY_FONT)}
            style={fsFont(fsSummaryPanel.scoreStripLabel)}
          >
            EXTRAS
          </span>
          <span
            className={cn('leading-none font-black text-white tabular-nums', DISPLAY_FONT)}
            style={fsFont(fsSummaryPanel.scoreStripValue)}
          >
            {extras ?? 0}
          </span>
        </div>
        <span className="h-7 w-px shrink-0 self-center bg-white/25" aria-hidden="true" />
        <div className="flex items-baseline gap-2.5">
          <span
            className={cn('font-medium tracking-[0.04em] text-white uppercase', DISPLAY_FONT)}
            style={fsFont(fsSummaryPanel.scoreStripLabel)}
          >
            OVERS
          </span>
          <span
            className={cn('leading-none font-black text-white tabular-nums', DISPLAY_FONT)}
            style={fsFont(fsSummaryPanel.scoreStripValue)}
          >
            {overs ?? '0.0'}
          </span>
        </div>
      </div>
      <span
        className={cn('font-black tracking-[0.02em] text-white tabular-nums', DISPLAY_FONT)}
        style={fsFont(fsSummaryPanel.scoreStripHero)}
      >
        {total ?? '0-0'}
      </span>
    </div>
  );
}

function HeroCrest({ logoUrl, title, team, accent }) {
  return (
    <TeamLogoOrCrest
      logoUrl={logoUrl}
      team={team}
      name={title}
      shortName={team?.code ?? title?.slice(0, 3)}
      accent={accent}
      size={CREST_SIZE}
      data-testid="batting-summary-crest"
    />
  );
}

function normalizeBatter(batter) {
  if (batter.yetToBat) {
    return {
      name: batter.name,
      dismissal: 'DNB',
      runs: 0,
      balls: 0,
      notOut: false,
      onStrike: false,
      yetToBat: true,
    };
  }
  return {
    name: batter.name,
    dismissal: batter.dismissal ?? '',
    runs: batter.runs ?? 0,
    balls: batter.balls ?? 0,
    notOut: Boolean(batter.notOut ?? isNotOutBatter(batter)),
    onStrike: batter.onStrike,
    yetToBat: false,
  };
}

export function BattingSummaryGraphic({ data, teams }) {
  const team = data.teamCode ? (teams?.[data.teamCode] ?? null) : null;
  const title = data.title ?? team?.fullName ?? team?.displayName ?? '';
  const accent = data.accent ?? team?.color ?? undefined;
  const batsmen = (data.batsmen ?? []).map(normalizeBatter);

  if (!batsmen.length || !data.scoreStrip) return null;

  return (
    <FSStage>
      <FsPageHeader
        title={title}
        sub={resolveSub(data)}
        size="panel"
        logoUrl={data.crestLogoUrl ?? team?.logoUrl}
        logoCode={team?.code ?? title?.slice(0, 3)}
        logoAlt={title}
        logoVariant="team"
        logoAccent={accent}
        logoTeam={team}
      />

      <div className="absolute top-[248px] bottom-16 z-[1] flex flex-col" style={{ left: PANEL_LEFT, width: PANEL_WIDTH }}>
        <div className="flex min-h-0 w-full flex-1 flex-col gap-2">
          {batsmen.map((batter, index) => (
            <BatterRow
              key={`${batter.name}-${index}`}
              name={batter.name}
              dismissal={batter.dismissal}
              runs={batter.runs}
              balls={batter.balls}
              notOut={batter.notOut}
              onStrike={batter.onStrike}
              yetToBat={batter.yetToBat}
              index={index}
            />
          ))}
        </div>

        <SummaryFooter extras={data.scoreStrip.extras} overs={data.scoreStrip.overs} total={data.scoreStrip.total} />
      </div>

      <div
        className="absolute top-0 bottom-0 z-[1] grid place-items-center"
        style={{ right: PANEL_LEFT, width: HERO_CREST_WIDTH }}
      >
        <HeroCrest logoUrl={data.crestLogoUrl} title={title} team={team} accent={accent} />
      </div>
    </FSStage>
  );
}
