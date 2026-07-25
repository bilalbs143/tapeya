/**
 * Shared matchup LT chrome (controller-3 Match Summary / Toss / Intro shell):
 * optional black caption pill above a split maroon|crimson bar with crest bookends.
 */
import { cn } from '@/lib/utils';

import { colors, geometry, infoBarPanelClass, infoBarShellStyle, ltFixtureBar } from '../../config';
import { InsetLTBarPanel, InsetLTBarSurface, InsetLTCrest, UI_FONT } from '../../primitives';

const BAR_RADIUS = geometry.barRadius;
const DIVIDER = 'rgba(205, 205, 205, 0.33)';

/**
 * Black pill caption above the matchup bar.
 * @param {{ children: import('react').ReactNode, className?: string }} props
 */
export function MatchupCaption({ children, className }) {
  if (children == null || children === '') return null;

  return (
    <div
      className={cn('flex max-w-full shrink-0 items-center justify-center bg-black', className)}
      style={{
        minHeight: ltFixtureBar.captionMinHeight,
        paddingTop: ltFixtureBar.captionPaddingY,
        paddingBottom: ltFixtureBar.captionPaddingY,
        paddingLeft: ltFixtureBar.captionPaddingX,
        paddingRight: ltFixtureBar.captionPaddingX,
        borderRadius: 999,
      }}
    >
      <span
        className={cn('text-center font-bold text-white uppercase', UI_FONT)}
        style={{
          fontSize: ltFixtureBar.captionFontSize,
          letterSpacing: ltFixtureBar.captionLetterSpacing,
          lineHeight: 1.1,
        }}
      >
        {children}
      </span>
    </div>
  );
}

/**
 * Crest slot with optional hairline divider (controller-3 SummaryLogoSlot).
 * @param {{
 *   team: object,
 *   separator?: 'left' | 'right',
 *   measuring?: boolean,
 * }} props
 */
export function MatchupCrestSlot({ team, separator, measuring = false }) {
  return (
    <div className="relative z-[1] flex h-full shrink-0 items-stretch">
      {separator === 'left' ? <div className="w-px shrink-0 self-stretch" style={{ background: DIVIDER }} aria-hidden /> : null}
      <div
        className="flex shrink-0 items-center justify-center bg-transparent"
        style={{
          width: ltFixtureBar.crestSlotWidth,
          padding: ltFixtureBar.crestSlotPadding,
        }}
      >
        <InsetLTCrest
          measuring={measuring}
          team={team}
          size={ltFixtureBar.crestSize}
          accent={team.color}
          borderPulseOrder={separator === 'left' ? 2 : 1}
        />
      </div>
      {separator === 'right' ? <div className="w-px shrink-0 self-stretch" style={{ background: DIVIDER }} aria-hidden /> : null}
    </div>
  );
}

/**
 * Full-height black VS column.
 * @param {{ label?: string }} props
 */
export function MatchupVsBox({ label = 'VS' }) {
  return (
    <span
      className="z-[1] flex h-full shrink-0 items-center justify-center self-stretch bg-black"
      style={{ width: ltFixtureBar.vsBoxWidth }}
    >
      <span
        className={cn('font-semibold text-white uppercase', UI_FONT)}
        style={{ fontSize: ltFixtureBar.vsFontSize, lineHeight: 1 }}
      >
        {label}
      </span>
    </span>
  );
}

/**
 * Split-shell bar: left/right halves from session team colors + crest bookends.
 * @param {{
 *   teamA: object,
 *   teamB: object,
 *   measuring?: boolean,
 *   radius?: number,
 *   children: import('react').ReactNode,
 *   className?: string,
 *   style?: import('react').CSSProperties,
 * }} props
 */
export function MatchupSplitBar({ teamA, teamB, measuring = false, radius = BAR_RADIUS, children, className, style }) {
  const leftBg = teamA?.color || colors.panelPlayer;
  const rightBg = teamB?.color || colors.panelBowler;

  return (
    <InsetLTBarPanel
      measuring={measuring}
      hideRing
      radius={radius}
      className={cn(infoBarPanelClass(measuring), 'relative flex w-full items-stretch overflow-hidden', className)}
      style={{
        ...infoBarShellStyle,
        background: 'transparent',
        ...style,
      }}
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-0 w-1/2" style={{ background: leftBg }} aria-hidden />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-0 w-1/2" style={{ background: rightBg }} aria-hidden />

      <MatchupCrestSlot team={teamA} separator="right" measuring={measuring} />
      <div className="relative z-[1] flex min-h-0 min-w-0 flex-1 items-stretch">{children}</div>
      <MatchupCrestSlot team={teamB} separator="left" measuring={measuring} />
    </InsetLTBarPanel>
  );
}

/**
 * Inset surface + optional caption stack (keeps bar measure/height architecture).
 * @param {{
 *   caption?: import('react').ReactNode,
 *   edgeToEdge?: boolean,
 *   children: (ctx: { radius: number, atMaxWidth: boolean, measuring?: boolean }) => import('react').ReactNode,
 * }} props
 */
export function MatchupLTSurface({ caption, edgeToEdge = true, children }) {
  return (
    <div className="flex w-full flex-col items-center" style={{ gap: ltFixtureBar.captionGap }}>
      <MatchupCaption>{caption}</MatchupCaption>
      <InsetLTBarSurface edgeToEdge={edgeToEdge} barRadius={BAR_RADIUS} className="w-full">
        {children}
      </InsetLTBarSurface>
    </div>
  );
}
