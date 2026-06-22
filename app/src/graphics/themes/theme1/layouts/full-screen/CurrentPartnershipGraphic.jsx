/**
 * Ported from theme-controller — render-only graphic.
 */
import { cn } from '@/lib/utils';

import { resolveBroadcastNameParts } from '../../../../core/domain/playerNameResolver';
import { colors, fsPartnership, fsSummaryPanel } from '../../config';
import { BatterScoreInline, DISPLAY_FONT, FSStage, GlowPanel, NotOutStar, PlayerAvatarImage, UI_FONT } from '../../primitives';
import { textGlowClass } from '../../visualEffects';
import { FS_HEADER_SUB_CENTERED, FS_SECTION_TITLE, fsFont } from '../shared/fsTypographyStyles';

const PARTNERSHIP_AVATAR_W = 360;
const PARTNERSHIP_AVATAR_MAX_H = 520;
/** Reserve space above the batter strap so partnership meta stays visible. */
const PARTNERSHIP_BOTTOM_INSET = 96;

const partnershipLabelClass = cn(
  'text-center font-extrabold leading-[1.02] tracking-[0.05em] text-[var(--text-secondary)] uppercase',
  DISPLAY_FONT,
);

const partnershipRunsClass = cn('font-extrabold leading-[0.92] text-white', DISPLAY_FONT, textGlowClass('heroLg'));

const partnershipMetaClass = cn('font-bold tracking-[0.06em] uppercase whitespace-nowrap', DISPLAY_FONT);

const batterFirstNameClass = cn('font-semibold tracking-[0.1em] text-[var(--text-secondary)] uppercase', UI_FONT);

const batterLastNameClass = cn('font-extrabold tracking-[0.03em] text-white uppercase whitespace-nowrap', DISPLAY_FONT);

function CurrentPartnershipHeader({ title, sub }) {
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

function PartnershipAvatarSlot({ src, alt = 'Player avatar' }) {
  return (
    <div
      className="relative flex h-full w-full items-end justify-center overflow-hidden"
      style={{ maxHeight: PARTNERSHIP_AVATAR_MAX_H }}
    >
      <PlayerAvatarImage src={src} alt={alt} fit="contain-bottom" rounded />
    </div>
  );
}

/**
 * @param {{ src?: string|null, alt?: string, side: 'left' | 'right' }} props
 */
function PartnershipAvatarColumn({ src, alt, side }) {
  return (
    <div
      className={cn('pointer-events-none absolute top-0 bottom-0 z-[1] overflow-hidden', side === 'left' ? 'left-0' : 'right-0')}
      style={{ width: PARTNERSHIP_AVATAR_W }}
      data-testid={`partnership-avatar-${side}`}
    >
      <PartnershipAvatarSlot src={src} alt={alt} />
    </div>
  );
}

function PartnershipCenterStat({ runs, balls }) {
  return (
    <>
      <span className={partnershipLabelClass} style={fsFont(fsPartnership.label)}>
        Current
        <br />
        Partnership
      </span>
      <span className={partnershipRunsClass} style={fsFont(fsPartnership.runs)}>
        {runs}
      </span>
      <div className={partnershipMetaClass} style={fsFont(fsPartnership.meta)}>
        <span className="text-[var(--text-secondary)]">Runs</span>
        <span className="mx-[18px] text-[var(--text-secondary)]">•</span>
        <span className="text-white">{balls}&nbsp;</span>
        <span className="text-[var(--text-secondary)]">Balls</span>
      </div>
    </>
  );
}

function PartnershipHeroPanel({ partnership, batters }) {
  const [left, right] = batters;

  return (
    <GlowPanel
      radius={28}
      accent={colors.accentB}
      className="relative h-full w-full overflow-hidden px-9 pt-[120px]"
      data-testid="partnership-hero-panel"
    >
      {/*
        Three-layer hero layout inside padded panel bounds:
        1. Left / right avatar columns (fixed 360px, bottom-aligned)
        2. Center stat column between avatars, vertically centered
        3. Bottom inset reserves space for the batter strap overlap
      */}
      <div className="relative h-full min-h-0" style={{ paddingBottom: PARTNERSHIP_BOTTOM_INSET }}>
        <PartnershipAvatarColumn src={left?.avatarUrl} alt={left?.fullName ?? 'Batter'} side="left" />
        <PartnershipAvatarColumn src={right?.avatarUrl} alt={right?.fullName ?? 'Batter'} side="right" />

        <div
          className="pointer-events-none absolute top-0 bottom-0 z-[2] flex flex-col items-center justify-center gap-1.5"
          style={{ left: PARTNERSHIP_AVATAR_W, right: PARTNERSHIP_AVATAR_W }}
          data-testid="partnership-center-stat"
        >
          <PartnershipCenterStat runs={partnership.runs} balls={partnership.balls} />
        </div>
      </div>
    </GlowPanel>
  );
}

function BatterCell({ batter, accent, align = 'start' }) {
  const isEnd = align === 'end';
  const notOut = Boolean(batter.notOut);
  const { firstName, lastName } = resolveBroadcastNameParts(batter.fullName);

  return (
    <div className={cn('flex flex-1 items-center justify-between gap-6 px-10 py-5', isEnd ? 'flex-row-reverse' : 'flex-row')}>
      <div className={cn('flex min-w-0 flex-col', isEnd ? 'items-end' : 'items-start')}>
        <span className={batterFirstNameClass} style={fsFont(fsPartnership.batterFirstName)}>
          {firstName}
        </span>
        <span className={cn(batterLastNameClass, 'flex items-start')} style={fsFont(fsPartnership.batterLastName)}>
          <span>{lastName}</span>
          <NotOutStar notOut={notOut} />
        </span>
      </div>

      <BatterScoreInline
        runs={batter.runs}
        balls={batter.balls}
        runsSize={fsPartnership.batterRuns}
        ballsSize={fsPartnership.batterBalls}
        accentColor={accent}
        animateRuns={false}
      />
    </div>
  );
}

function BatterStrap({ batters, accent }) {
  const [left, right] = batters;

  if (!left || !right) return null;

  return (
    <div
      className={cn(
        'absolute right-[8%] bottom-[-24px] left-[8%] z-[3] flex overflow-hidden rounded-2xl',
        'border border-[rgba(120,140,255,0.32)]',
        'bg-[linear-gradient(180deg,rgba(28,34,54,0.96),rgba(14,19,32,0.97))]',
        '[box-shadow:0_18px_50px_rgba(0,0,0,0.5),0_0_calc(22px*var(--glow))_rgba(91,124,255,0.25)]',
      )}
      data-testid="partnership-batter-strap"
    >
      <BatterCell batter={left} accent={accent} align={left.align ?? 'start'} />
      <div className="w-px shrink-0 bg-white/[0.14]" />
      <BatterCell batter={right} accent={accent} align={right.align ?? 'end'} />
    </div>
  );
}

export function CurrentPartnershipGraphic({ data, teams }) {
  const team = data.teamCode ? (teams?.[data.teamCode] ?? null) : null;
  const accent = data.accent ?? team?.color ?? '#5b7cff';
  const title = data.title ?? team?.fullName ?? team?.displayName ?? '';
  const batters = (data.batters ?? []).map((batter) => ({
    ...batter,
    avatarUrl: batter.avatarUrl ?? data.defaultAvatarUrl,
  }));

  if (!data.partnership || batters.length < 2) return null;

  return (
    <FSStage>
      <CurrentPartnershipHeader title={title} sub={data.sub} />

      <div className="absolute top-[250px] right-24 bottom-[70px] left-24">
        <PartnershipHeroPanel partnership={data.partnership} batters={batters} />
        <BatterStrap batters={batters} accent={accent} />
      </div>
    </FSStage>
  );
}
