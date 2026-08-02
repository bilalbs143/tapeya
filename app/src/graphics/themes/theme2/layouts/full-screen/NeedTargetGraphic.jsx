/**
 * Need Target FS — theme3 NeedTargetFsCore look.
 * Header uses theme1 placement + type tokens; card keeps theme3 chrome.
 */
import { cn } from '@/lib/utils';

import { colors, fsSummaryPanel } from '../../config';
import { AnimatedNumber, DISPLAY_FONT, FSStage } from '../../primitives';
import { FsPageHeader } from '../shared/FsPageHeader';
import { fsFont } from '../shared/fsTypographyStyles';

const CARD_WIDTH = 920;
const CARD_MIN_H = 520;

function NeedChip({ children }) {
  return (
    <span
      className="flex items-center justify-center rounded-md border border-white/18 bg-black/35 px-4 py-2"
      style={{ minWidth: 88 }}
    >
      <span
        className={cn('font-bold tracking-[0.1em] text-white uppercase', DISPLAY_FONT)}
        style={fsFont(fsSummaryPanel.statLabelBox)}
      >
        {children}
      </span>
    </span>
  );
}

function NeedStatColumn({ topLabel, bottomLabel, value, padValue = false }) {
  const displayValue = padValue ? String(value ?? 0).padStart(2, '0') : (value ?? 0);

  return (
    <div className="flex min-w-[180px] flex-col items-center gap-[18px]">
      <NeedChip>{topLabel}</NeedChip>
      <AnimatedNumber
        value={displayValue}
        className={cn('leading-none font-black text-white tabular-nums', DISPLAY_FONT)}
        style={fsFont(fsSummaryPanel.heroMetricLg)}
      />
      <NeedChip>{bottomLabel}</NeedChip>
    </div>
  );
}

function WicketsPill({ wickets }) {
  if (wickets == null || wickets === '') return null;
  const n = Number(wickets);
  const label = `WITH ${wickets} WICKET${n === 1 ? '' : 'S'}`;

  return (
    <div
      className="absolute bottom-0 left-1/2 z-[2] flex -translate-x-1/2 items-center justify-center rounded-[10px] px-7 py-3.5"
      style={{
        minWidth: 280,
        background: 'linear-gradient(180deg, #f0d878 0%, #e0c05a 45%, #c9a227 100%)',
        boxShadow: '0 6px 16px rgba(0,0,0,0.35)',
      }}
    >
      <span
        className={cn('font-black tracking-[0.06em] uppercase', DISPLAY_FONT)}
        style={{ color: colors.badgeText, ...fsFont(fsSummaryPanel.goldBand) }}
      >
        {label}
      </span>
    </div>
  );
}

/**
 * @param {{
 *   data: {
 *     headerTitle?: string,
 *     sub?: string,
 *     title?: string,
 *     logoUrl?: string|null,
 *     teamCode?: string,
 *     runsNeeded?: number|string,
 *     ballsRemaining?: number|string,
 *     wicketsRemaining?: number|string,
 *     accent?: string,
 *   },
 *   teams?: Record<string, object>,
 * }} props
 */
export function NeedTargetGraphic({ data, teams }) {
  const team = data.teamCode ? (teams?.[data.teamCode] ?? null) : null;
  const teamLabel = team?.code ?? team?.name ?? '';
  const matchup = data.headerTitle || (teamLabel ? `${teamLabel} TO WIN` : '');
  const tournament = data.sub ?? '';
  const cardTitle = data.title ?? (teamLabel ? `${teamLabel} TO WIN` : 'NEED TARGET');

  return (
    <FSStage>
      <FsPageHeader
        title={matchup}
        sub={tournament}
        size="section"
        logoUrl={data.logoUrl}
        logoAlt={matchup || 'Tournament'}
        logoVariant="tournament"
      />

      <div className="absolute top-[250px] right-0 left-0 z-[1] flex justify-center">
        <div className="relative flex w-full max-w-[920px] flex-col items-center pb-7">
          <div
            className="relative flex w-full flex-col items-center justify-center overflow-hidden rounded-[14px]"
            style={{
              width: CARD_WIDTH,
              minHeight: CARD_MIN_H,
              gap: 48,
              padding: '56px 56px 72px',
              background: colors.panelPlayer,
              boxShadow: '0 0 40px rgba(0,0,0,0.35)',
            }}
          >
            {cardTitle ? (
              <h2
                className={cn('relative z-[1] text-center font-bold tracking-[0.06em] text-white uppercase', DISPLAY_FONT)}
                style={fsFont(fsSummaryPanel.sectionTitle)}
              >
                {cardTitle}
              </h2>
            ) : null}

            <div className="relative z-[1] flex w-full items-start justify-center gap-[72px]">
              <NeedStatColumn topLabel="NEED" bottomLabel="RUNS" value={data.runsNeeded} />
              <NeedStatColumn topLabel="FROM" bottomLabel="BALLS" value={data.ballsRemaining} padValue />
            </div>
          </div>

          <WicketsPill wickets={data.wicketsRemaining} />
        </div>
      </div>
    </FSStage>
  );
}
