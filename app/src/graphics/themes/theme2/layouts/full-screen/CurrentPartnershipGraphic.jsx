/**
 * Current Partnership FS — theme3 CurrentPartnershipFsCore look.
 * Header uses theme1 placement + sectionTitle/headerSub + team logo; wine card chrome kept.
 */
import { cn } from '@/lib/utils';

import { resolveFsNameParts } from '../../adapters/_shared';
import { colors, fsPartnership } from '../../config';
import { BatterScoreInline, DISPLAY_FONT, FSStage, PlayerAvatarImage } from '../../primitives';
import { FsPageHeader } from '../shared/FsPageHeader';
import { fsFont } from '../shared/fsTypographyStyles';

const STRIKE_SIZE = 28;

const BAR_LINE = 'rgba(255, 255, 255, 0.28)';

function Portrait({ batter, side, index }) {
  if (!batter) {
    return <div className="flex items-end justify-center overflow-hidden px-[18px]" data-testid={`partnership-avatar-${side}`} />;
  }

  const name = batter.fullName ?? 'Batter';

  return (
    <div
      className="flex items-end justify-center overflow-hidden px-[18px]"
      style={{ animationDelay: `${index * 120}ms` }}
      data-testid={`partnership-avatar-${side}`}
    >
      <div className="relative h-full w-full overflow-hidden rounded-md drop-shadow-[0_8px_18px_rgba(0,0,0,0.45)]">
        <PlayerAvatarImage src={batter.avatarUrl} alt={name} fit="contain-bottom" />
      </div>
    </div>
  );
}

function CenterStat({ runs, balls }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2.5 px-3 text-center" data-testid="partnership-center-stat">
      <span className={cn('font-bold tracking-[0.06em] text-white uppercase', DISPLAY_FONT)} style={fsFont(fsPartnership.label)}>
        CURRENT PARTNERSHIP
      </span>
      <span
        className={cn('leading-[0.9] font-black tracking-[-0.02em] text-white tabular-nums', DISPLAY_FONT)}
        style={fsFont(fsPartnership.runs)}
      >
        {runs}
      </span>
      <span
        className={cn('font-semibold tracking-[0.06em] text-white uppercase', DISPLAY_FONT)}
        style={fsFont(fsPartnership.meta)}
      >
        RUNS <span className="mx-1.5 inline-block">•</span> {balls} BALLS
      </span>
    </div>
  );
}

function Nameplate({ batter, side = 'left' }) {
  if (!batter) return <div className="min-w-0" />;

  const { firstName, lastName } =
    batter.firstName || batter.lastName
      ? { firstName: batter.firstName ?? '', lastName: batter.lastName ?? '' }
      : resolveFsNameParts(batter.fullName ?? batter);

  const isRight = side === 'right';
  // Theme3: amber * for on-strike. Fall back to not-out * when onStrike is absent.
  const showStar = batter.onStrike != null ? Boolean(batter.onStrike) : Boolean(batter.notOut);

  return (
    <div
      className={cn('flex min-w-0 flex-col justify-center gap-0.5', isRight ? 'items-end text-right' : 'items-start text-left')}
    >
      {firstName ? (
        <span
          className={cn('font-semibold tracking-[0.04em] text-white uppercase', DISPLAY_FONT)}
          style={fsFont(fsPartnership.batterFirstName)}
        >
          {firstName}
        </span>
      ) : null}
      <span className="inline-flex items-start gap-0.5">
        <span
          className={cn('font-black tracking-[0.02em] text-white uppercase', DISPLAY_FONT)}
          style={fsFont(fsPartnership.batterLastName)}
        >
          {lastName}
        </span>
        {showStar ? (
          <span
            className={cn('leading-none font-bold text-amber-300', DISPLAY_FONT)}
            style={{ ...fsFont(STRIKE_SIZE), marginTop: 2 }}
            aria-hidden="true"
          >
            *
          </span>
        ) : null}
      </span>
    </div>
  );
}

function ScoreBlock({ batter }) {
  return (
    <BatterScoreInline
      runs={batter?.runs ?? 0}
      balls={batter?.balls ?? 0}
      runsSize={fsPartnership.batterRuns}
      ballsSize={fsPartnership.batterBalls}
      animateRuns={false}
      className="shrink-0"
    />
  );
}

function BatterBar({ left, right }) {
  return (
    <div
      className="relative z-[1] mx-auto mb-6 w-[calc(100%-48px)] shrink-0 rounded-[10px] p-px"
      style={{ marginTop: 16, background: BAR_LINE }}
      data-testid="partnership-batter-strap"
    >
      <div
        className="flex w-full items-stretch overflow-hidden rounded-[9px]"
        style={{ minHeight: 104, background: colors.panelPlayer }}
      >
        <div className="flex min-w-0 flex-1 items-center justify-between gap-5 py-4 pr-5 pl-7">
          <Nameplate batter={left} side="left" />
          <ScoreBlock batter={left} />
        </div>

        <span className="w-px shrink-0 self-center" style={{ height: 56, background: BAR_LINE }} aria-hidden="true" />

        <div className="flex min-w-0 flex-1 items-center justify-between gap-5 py-4 pr-7 pl-5">
          <ScoreBlock batter={right} />
          <Nameplate batter={right} side="right" />
        </div>
      </div>
    </div>
  );
}

export function CurrentPartnershipGraphic({ data, teams }) {
  const team = data.teamCode ? (teams?.[data.teamCode] ?? null) : null;
  const title = data.title ?? team?.fullName ?? team?.displayName ?? '';
  const accent = data.accent ?? team?.color ?? undefined;
  const logoUrl = data.logoUrl ?? team?.logoUrl ?? null;
  const logoCode = team?.code ?? team?.displayName?.slice(0, 3) ?? null;
  const batters = (data.batters ?? []).map((batter) => ({
    ...batter,
    avatarUrl: batter.avatarUrl ?? data.defaultAvatarUrl,
  }));

  if (!data.partnership || batters.length < 2) return null;

  const [left, right] = batters;

  return (
    <FSStage>
      <FsPageHeader
        title={title}
        sub={data.sub}
        size="section"
        logoUrl={logoUrl}
        logoCode={logoCode}
        logoAlt={title}
        logoVariant="team"
        logoAccent={accent}
        logoTeam={team}
      />

      <div className="absolute top-[250px] right-24 bottom-[70px] left-24 z-[1] flex flex-col">
        <div
          className="relative my-auto flex w-full flex-col overflow-hidden rounded-[10px] shadow-[0_0_40px_rgba(0,0,0,0.35)]"
          style={{ background: colors.panelPlayer }}
          data-testid="partnership-hero-panel"
        >
          <div
            className="grid items-stretch overflow-hidden pt-5"
            style={{
              gridTemplateColumns: 'minmax(0, 1.05fr) minmax(0, 1.2fr) minmax(0, 1.05fr)',
              minHeight: 420,
            }}
          >
            <Portrait batter={left} side="left" index={0} />
            <CenterStat runs={data.partnership.runs} balls={data.partnership.balls} />
            <Portrait batter={right} side="right" index={1} />
          </div>

          <BatterBar left={left} right={right} />
        </div>
      </div>
    </FSStage>
  );
}
