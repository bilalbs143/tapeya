/**
 * Ported from theme-controller — render-only graphic.
 */
import { cn } from '@/lib/utils';

import { colors } from '../../config';
import { DISPLAY_FONT, FSStage, GlowPanel, MONO_FONT, NotOutStar, PlayerAvatarImage, UI_FONT } from '../../primitives';

const PARTNERSHIP_AVATAR_W = 360;
const PARTNERSHIP_AVATAR_H = 520;

const headerTitleClass = cn(
  'm-0 text-[44px] font-extrabold leading-[0.96] tracking-[0.01em] text-white uppercase',
  DISPLAY_FONT,
  '[text-shadow:0_2px_18px_rgba(0,0,0,0.5)]',
);

const headerSubClass = cn('mt-2 mb-0 text-[26px] font-semibold tracking-[0.06em] text-[var(--muted)] uppercase', UI_FONT);

const partnershipLabelClass = cn(
  'text-center text-[60px] font-extrabold leading-[1.02] tracking-[0.05em] text-[var(--muted)] uppercase',
  DISPLAY_FONT,
);

const partnershipRunsClass = cn(
  'text-[220px] font-extrabold leading-[0.92] text-white',
  DISPLAY_FONT,
  '[text-shadow:0_0_calc(40px*var(--glow))_rgba(120,140,255,0.65)]',
);

const partnershipMetaClass = cn('text-[40px] font-bold tracking-[0.06em] uppercase whitespace-nowrap', DISPLAY_FONT);

const batterFirstNameClass = cn('text-[24px] font-semibold tracking-[0.1em] text-[var(--muted)]', UI_FONT);

const batterLastNameClass = cn(
  'text-[46px] font-extrabold tracking-[0.03em] text-white uppercase whitespace-nowrap',
  DISPLAY_FONT,
);

const batterRunsClass = cn('text-[56px] font-extrabold leading-none', DISPLAY_FONT);

const batterBallsClass = cn('text-[24px] font-medium text-[var(--faint)]', MONO_FONT);

/** @param {string} fullName */
function splitFirstName(fullName) {
  return fullName.split(' ')[0] ?? fullName;
}

/** @param {string} fullName */
function splitLastName(fullName) {
  const parts = fullName.split(' ');
  return parts.slice(1).join(' ') || fullName;
}

function CurrentPartnershipHeader({ title, sub }) {
  return (
    <div className="absolute top-14 right-16 left-16 z-[3] flex items-start gap-7">
      <div className="min-w-0 flex-1">
        <h2 className={headerTitleClass}>{title}</h2>
        {sub ? <p className={headerSubClass}>{sub}</p> : null}
      </div>
    </div>
  );
}

function PartnershipAvatarSlot({ src, alt = 'Player avatar', width = PARTNERSHIP_AVATAR_W, height = PARTNERSHIP_AVATAR_H }) {
  return (
    <div className="relative flex items-end justify-center overflow-hidden" style={{ width, height }}>
      <PlayerAvatarImage src={src} alt={alt} fit="contain-bottom" rounded />
    </div>
  );
}

function PartnershipCenterStat({ runs, balls }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
      <span className={partnershipLabelClass}>
        Current
        <br />
        Partnership
      </span>
      <span className={partnershipRunsClass}>{runs}</span>
      <div className={partnershipMetaClass}>
        <span className="text-[var(--accentA)]">Runs</span>
        <span className="mx-[18px] text-[var(--faint)]">•</span>
        <span className="text-white">{balls}&nbsp;</span>
        <span className="text-[var(--muted)]">Balls</span>
      </div>
    </div>
  );
}

function PartnershipHeroPanel({ partnership, batters }) {
  const [left, right] = batters;

  return (
    <GlowPanel radius={28} accent={colors.accentB} className="relative h-full w-full overflow-hidden">
      <div className="absolute top-[120px] bottom-0 left-9">
        <PartnershipAvatarSlot src={left?.avatarUrl} alt={left?.fullName ?? 'Batter'} />
      </div>
      <div className="absolute top-[120px] right-9 bottom-0">
        <PartnershipAvatarSlot src={right?.avatarUrl} alt={right?.fullName ?? 'Batter'} />
      </div>

      <PartnershipCenterStat runs={partnership.runs} balls={partnership.balls} />
    </GlowPanel>
  );
}

function BatterCell({ batter, accent, align = 'start' }) {
  const isEnd = align === 'end';
  const notOut = Boolean(batter.notOut);
  const lastName = splitLastName(batter.fullName);

  return (
    <div className={cn('flex flex-1 items-center justify-between gap-6 px-10 py-5', isEnd ? 'flex-row-reverse' : 'flex-row')}>
      <div className={cn('flex min-w-0 flex-col', isEnd ? 'items-end' : 'items-start')}>
        <span className={batterFirstNameClass}>{splitFirstName(batter.fullName)}</span>
        <span className={cn(batterLastNameClass, 'flex items-start')}>
          <span>{lastName}</span>
          <NotOutStar notOut={notOut} />
        </span>
      </div>

      <span className="flex shrink-0 items-baseline gap-2">
        <span className={batterRunsClass} style={{ color: accent }}>
          {batter.runs}
        </span>
        <span className={batterBallsClass}>{batter.balls}</span>
      </span>
    </div>
  );
}

function BatterStrap({ batters, accent }) {
  const [left, right] = batters;

  if (!left || !right) return null;

  return (
    <div
      className={cn(
        'absolute right-[8%] bottom-[-24px] left-[8%] flex overflow-hidden rounded-2xl',
        'border border-[rgba(120,140,255,0.32)]',
        'bg-[linear-gradient(180deg,rgba(28,34,54,0.96),rgba(14,19,32,0.97))]',
        '[box-shadow:0_18px_50px_rgba(0,0,0,0.5),0_0_calc(22px*var(--glow))_rgba(91,124,255,0.25)]',
      )}
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
