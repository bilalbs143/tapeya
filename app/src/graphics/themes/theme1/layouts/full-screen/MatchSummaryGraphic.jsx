/**
 * Ported from theme-controller — render-only graphic.
 */
import { cn } from '@/lib/utils';

import {
  DISPLAY_FONT,
  FSStage,
  MONO_FONT,
  normalizeAccentColor,
  NotOutStar,
  TeamLogoOrCrest,
  UI_FONT,
  VSBadge,
} from '../../primitives';

/** Gold accent for the need-target footer band — matches PSL reference. */
const MATCH_SUMMARY_GOLD = '#f5c85a';

const PANEL_LEFT = 70;
const PANEL_WIDTH = 1140;
const CREST_COLUMN_W = 560;
const CREST_SIZE = 300;
const CREST_VS_SIZE = 120;
const MAX_INNINGS_ROWS = 4;
const INNINGS_BLOCK_GAP = 22;

const pageTitleClass = cn('m-0 text-[80px] font-extrabold leading-[0.95] text-white uppercase', DISPLAY_FONT);

const pageSubClass = cn('mt-1.5 mb-0 text-[24px] font-semibold tracking-[0.06em] text-[var(--muted)] uppercase', UI_FONT);

const inningsShortNameClass = cn('text-[40px] font-extrabold text-white uppercase', DISPLAY_FONT);

const inningsOversClass = cn('ml-[22px] text-[24px] font-semibold tracking-[0.06em] text-white/[0.78]', UI_FONT);

const inningsTotalClass = cn('text-[46px] font-extrabold text-white whitespace-nowrap', DISPLAY_FONT);

const batterNameClass = cn('flex-1 text-[32px] font-bold text-white uppercase', DISPLAY_FONT);

const batterRunsClass = cn('w-20 text-right text-[34px] font-extrabold text-white', DISPLAY_FONT);

const batterBallsClass = cn('w-[70px] text-right text-[24px] text-[var(--faint)]', MONO_FONT);

const bowlerNameClass = cn('flex-1 text-[32px] font-bold text-white uppercase', DISPLAY_FONT);

const bowlerFiguresClass = cn('w-[120px] text-right text-[32px] font-extrabold text-white', DISPLAY_FONT);

const bowlerOversClass = cn('w-20 text-right text-[24px] text-[var(--faint)]', MONO_FONT);

const needTargetBandClass = cn(
  'text-[30px] font-extrabold tracking-[0.02em] text-[#0a0e17] uppercase',
  'whitespace-nowrap',
  DISPLAY_FONT,
);

function resolveSub(data) {
  return data.sub ?? '';
}

function resolveInningsShortName(innings, teams) {
  if (innings.shortName) return innings.shortName;
  const team = innings.teamCode ? (teams?.[innings.teamCode] ?? null) : null;
  return team?.displayName ?? team?.code ?? '';
}

function resolveInningsAccent(innings, teams) {
  const direct = String(innings.accent ?? '').trim();
  if (direct) return direct;
  const team = innings.teamCode ? (teams?.[innings.teamCode] ?? null) : null;
  return normalizeAccentColor(team?.color);
}

function resolveCrestTeam(crest, teams) {
  const team = crest.teamCode ? (teams?.[crest.teamCode] ?? null) : null;
  return {
    logoUrl: crest.crestLogoUrl,
    accent: normalizeAccentColor(crest.accent ?? team?.color),
    name: crest.name ?? team?.displayName ?? team?.fullName,
    shortName: team?.code ?? team?.name,
  };
}

function MatchSummaryHeader({ sub }) {
  return (
    <div className="mb-6">
      <h1 className={pageTitleClass}>Match Summary</h1>
      {sub ? <p className={pageSubClass}>{sub}</p> : null}
    </div>
  );
}

function InningsHeaderBar({ shortName, overs, total, wickets, accent }) {
  const barAccent = normalizeAccentColor(accent);

  return (
    <div
      className="mb-2.5 flex h-16 w-full items-baseline rounded-[10px] px-6"
      style={{
        background: `linear-gradient(100deg, ${barAccent} 0%, transparent 85%)`,
      }}
    >
      <span className="min-w-0 flex-1 whitespace-nowrap">
        <span className={inningsShortNameClass}>{shortName}</span>
        <span className={inningsOversClass}>{overs} OVERS</span>
      </span>
      <span className={inningsTotalClass}>
        {total}-{wickets}
      </span>
    </div>
  );
}

function BattingMiniRow({ name, runs, balls, notOut = false }) {
  return (
    <>
      <span className={cn(batterNameClass, 'flex items-start')}>
        <span>{name}</span>
        <NotOutStar notOut={notOut} />
      </span>
      <span className={batterRunsClass}>{runs}</span>
      <span className={batterBallsClass}>{balls}</span>
    </>
  );
}

function BowlingMiniRow({ name, wickets, runs, overs }) {
  return (
    <>
      <span className={bowlerNameClass}>{name}</span>
      <span className={bowlerFiguresClass}>
        {wickets}-{runs}
      </span>
      <span className={bowlerOversClass}>{overs}</span>
    </>
  );
}

function InningsBlock({ shortName, total, wickets, overs, accent, batsmen, bowlers }) {
  const bats = batsmen.slice(0, MAX_INNINGS_ROWS);
  const bowl = bowlers.slice(0, MAX_INNINGS_ROWS);
  const rows = Math.max(bats.length, bowl.length);

  return (
    <div>
      <InningsHeaderBar shortName={shortName} overs={overs} total={total} wickets={wickets} accent={accent} />

      <div className="flex gap-10">
        <div className="min-w-0 flex-1">
          {Array.from({ length: rows }).map((_, index) => {
            const batter = bats[index];
            return (
              <div key={`bat-${index}`} className="flex h-[50px] items-center border-b border-white/10">
                {batter ? (
                  <BattingMiniRow
                    name={batter.name ?? ''}
                    runs={batter.runs}
                    balls={batter.balls}
                    notOut={Boolean(batter.notOut)}
                  />
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="min-w-0 flex-1">
          {Array.from({ length: rows }).map((_, index) => {
            const bowler = bowl[index];
            return (
              <div key={`bowl-${index}`} className="flex h-[50px] items-center border-b border-white/10">
                {bowler ? (
                  <BowlingMiniRow name={bowler.name ?? ''} wickets={bowler.wickets} runs={bowler.runs} overs={bowler.overs} />
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function NeedTargetBand({ label }) {
  return (
    <div
      className="flex h-[70px] shrink-0 items-center rounded-xl px-[30px]"
      style={{
        background: `linear-gradient(100deg, ${MATCH_SUMMARY_GOLD}, #d9a93a)`,
        boxShadow: `0 0 calc(18px * var(--glow)) ${MATCH_SUMMARY_GOLD}33`,
      }}
    >
      <span className={needTargetBandClass}>{label}</span>
    </div>
  );
}

function MatchSummaryCrests({ top, bottom }) {
  return (
    <div
      className="absolute top-0 bottom-0 flex flex-col items-center justify-center gap-[26px]"
      style={{ right: PANEL_LEFT, width: CREST_COLUMN_W }}
    >
      <TeamLogoOrCrest
        logoUrl={top.logoUrl}
        name={top.name}
        shortName={top.shortName}
        size={CREST_SIZE}
        accent={top.accent}
        borderPulseOrder={1}
      />
      <VSBadge size={CREST_VS_SIZE} />
      <TeamLogoOrCrest
        logoUrl={bottom.logoUrl}
        name={bottom.name}
        shortName={bottom.shortName}
        size={CREST_SIZE}
        accent={bottom.accent}
        borderPulseOrder={2}
      />
    </div>
  );
}

export function MatchSummaryGraphic({ data, teams }) {
  const inningsBlocks = data.innings ?? [];

  if (!inningsBlocks.length) return null;

  const crests = data.crests
    ? {
        top: resolveCrestTeam(data.crests.top, teams),
        bottom: resolveCrestTeam(data.crests.bottom, teams),
      }
    : null;

  return (
    <FSStage>
      <div className="absolute top-14 bottom-14 flex flex-col" style={{ left: PANEL_LEFT, width: PANEL_WIDTH }}>
        <MatchSummaryHeader sub={resolveSub(data)} />

        {inningsBlocks.map((innings, index) => (
          <div key={`${innings.teamCode ?? innings.shortName}-${index}`}>
            {index > 0 ? <div style={{ height: INNINGS_BLOCK_GAP }} /> : null}
            <InningsBlock
              shortName={resolveInningsShortName(innings, teams)}
              total={innings.total}
              wickets={innings.wickets}
              overs={innings.overs}
              accent={resolveInningsAccent(innings, teams)}
              batsmen={innings.batsmen}
              bowlers={innings.bowlers}
            />
          </div>
        ))}

        <div className="flex-1" />

        {data.needTargetLabel ? <NeedTargetBand label={data.needTargetLabel} /> : null}
      </div>

      {crests ? <MatchSummaryCrests top={crests.top} bottom={crests.bottom} /> : null}
    </FSStage>
  );
}
