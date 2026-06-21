/**
 * Fall-of-wickets lower-third strip — team header plus wicket columns.
 */
import { cn } from '@/lib/utils';

import { ltBar } from '../../config';
import { AnimatedNumber, Crest, DISPLAY_FONT, GlowPanel, ScaledBarSurface, UI_FONT } from '../../primitives';
import { textGlowClass } from '../../visualEffects';

const DESIGN_WIDTH = ltBar.designWidth;

const headerLabelClass = cn('text-[22px] font-semibold tracking-[0.14em] text-[var(--text-secondary)] uppercase', UI_FONT);

const teamCodeClass = cn('text-[30px] font-bold tracking-[0.1em] text-[var(--text)]', UI_FONT);

const oversClass = cn('text-[26px] font-bold leading-none tracking-[0.04em] text-[var(--text)]', DISPLAY_FONT);

const wicketNumberClass = cn('text-[18px] font-semibold leading-none text-[var(--text-secondary)]', UI_FONT);

const wicketScoreClass = cn('text-[28px] font-extrabold leading-none text-white', DISPLAY_FONT);

function resolveBattingTeam(data, teams) {
  const code = data?.battingTeamCode ?? data?.teamCode ?? data?.battingTeam?.teamCode;
  const team = code ? teams[code] : null;
  return { code, team };
}

function resolveWickets(data, mode) {
  const wickets = Array.isArray(data?.wickets) ? data.wickets : [];
  if (mode === 'last') {
    return wickets.length > 0 ? [wickets[wickets.length - 1]] : [];
  }
  return wickets;
}

/**
 * @param {{
 *   data: object,
 *   teams: Record<string, object>,
 *   edgeToEdge?: boolean,
 *   mode?: 'all' | 'last',
 * }} props
 */
export function FallOfWicketsLTBar({ data, teams, edgeToEdge = true, mode = 'all' }) {
  const { team } = resolveBattingTeam(data, teams);
  const wickets = resolveWickets(data, mode);
  if (!team || wickets.length === 0) return null;

  const teamLabel = data?.teamLabel ?? team.code ?? team.name;
  const oversText = data?.oversText ?? data?.battingTeam?.overs ?? '';
  const total = data?.total ?? data?.battingTeam?.total ?? 0;
  const wkts = data?.wkts ?? data?.battingTeam?.wkts ?? wickets.length;
  const scoreSep = data?.scoreSep ?? '-';

  return (
    <ScaledBarSurface designWidth={DESIGN_WIDTH} edgeToEdge={edgeToEdge}>
      {({ radius }) => (
        <GlowPanel hideRing radius={radius} className="flex w-full items-stretch">
          <div className="flex items-center gap-[18px] py-5 pr-[22px]" style={{ paddingLeft: ltBar.edgePaddingX }}>
            <Crest team={team} size={ltBar.crestSize} accent={team.color} borderPulseOrder={1} />
            <div className="flex flex-col gap-1 pr-4">
              <span className={teamCodeClass}>{teamLabel}</span>
              {oversText ? <span className={oversClass}>{oversText}</span> : null}
            </div>
            <div className="flex items-baseline gap-[5px]">
              <AnimatedNumber
                value={total}
                className={cn(
                  '[font-family:var(--font-display)] text-[50px] leading-[0.92] font-extrabold text-[var(--score-color)]',
                  textGlowClass('score'),
                )}
              />
              <span className="[font-family:var(--font-display)] text-[32px] leading-[0.92] font-extrabold text-[var(--text-secondary)]">
                {scoreSep}
              </span>
              <AnimatedNumber
                value={wkts}
                className="[font-family:var(--font-display)] text-[38px] leading-[0.92] font-extrabold text-white"
              />
            </div>
          </div>

          <div className="mx-2.5 flex min-w-0 flex-1 items-center self-stretch">
            <div className="flex min-w-0 flex-1 items-center justify-end gap-0 overflow-hidden pr-4">
              {wickets.map((item, index) => (
                <div key={`${item.number ?? index}-${item.score ?? ''}`} className="flex items-center">
                  {index > 0 ? (
                    <div
                      className="mx-3 w-px self-stretch bg-[linear-gradient(180deg,transparent,rgba(150,170,255,0.45),transparent)]"
                      aria-hidden="true"
                    />
                  ) : null}
                  <div className="flex min-w-[72px] flex-col items-center justify-center px-2 text-center">
                    <span className={wicketNumberClass}>{item.number ?? index + 1}</span>
                    <span className={cn('mt-2', wicketScoreClass)}>{item.score ?? '—'}</span>
                    {item.batter ? (
                      <span className={cn('mt-1 text-[15px] font-medium text-[var(--text-secondary)]', UI_FONT)}>
                        {item.batter}
                      </span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {mode === 'last' ? (
            <div className="flex items-center" style={{ paddingRight: ltBar.edgePaddingX }}>
              <span className={headerLabelClass}>LAST WICKET</span>
            </div>
          ) : (
            <div className="flex items-center" style={{ paddingRight: ltBar.edgePaddingX }}>
              <span className={headerLabelClass}>FALL OF WICKETS</span>
            </div>
          )}
        </GlowPanel>
      )}
    </ScaledBarSurface>
  );
}
