import { useEffect, useState } from 'react';

import { useNavigate, useParams } from 'react-router-dom';

import karachiFlag from '@/assets/images/icons/karachi-flag.png';
import rawalpindiFlag from '@/assets/images/icons/rawalpindi-flag.png';
import winProbabilityIcon from '@/assets/images/icons/win-probabilty.svg';
import { CommentaryText } from '@/components/scorecard/CommentaryText';
import { Container } from '@/ui/Container';
import {
  scorecardListClass,
  scorecardTriggerClass,
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/ui/Tabs';

import { MOCK_MATCH_DETAILS } from './mockMatchDetails';
import { MOCK_MATCHES } from './mockMatches';
import {
  StatusDetailsLiveTab,
  StatusDetailsOversTab,
  StatusDetailsPlaceholderTab,
  StatusDetailsPlayingXITab,
  StatusDetailsScorecardTab,
} from './statusDetailsTabs';
import { ScheduleTab, StatsTab, TableTab } from './tabs';

// ─── Constants ───────────────────────────────────────────────────────────────

const FLAGS = { karachi: karachiFlag, rawalpindi: rawalpindiFlag };

const STATUS_TABS = {
  live: [
    { value: 'live', label: 'Live' },
    { value: 'scorecard', label: 'Scorecard' },
    { value: 'overs', label: 'Overs' },
    { value: 'table', label: 'Table' },
    { value: 'playing-xi', label: 'Playing XI' },
  ],
  result: [
    { value: 'scorecard', label: 'Scorecard' },
    { value: 'overs', label: 'Overs' },
    { value: 'table', label: 'Table' },
    { value: 'playing-xi', label: 'Playing XI' },
  ],
  upcoming: [
    { value: 'table', label: 'Table' },
    { value: 'playing-xi', label: 'Playing XI' },
    { value: 'fixture', label: 'Fixture' },
    { value: 'stats', label: 'Stats' },
  ],
};

const STATUS_DEFAULT_TAB = {
  live: 'live',
  result: 'scorecard',
  upcoming: 'table',
};

const TAB_VIEWS = {
  live: StatusDetailsLiveTab,
  scorecard: StatusDetailsScorecardTab,
  overs: StatusDetailsOversTab,
  'playing-xi': StatusDetailsPlayingXITab,
  table: TableTab,
  stats: StatsTab,
  fixture: ScheduleTab,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Parse "27/1 (4.4/50 OV, T:235)" → { current: "27/1", overs: "(4.4/50 OV, T:235)" } */
function parseLiveScore(score) {
  if (!score || typeof score !== 'string')
    return { current: score, overs: null };
  const idx = score.indexOf(' (');
  if (idx === -1) return { current: score, overs: null };
  return { current: score.slice(0, idx), overs: score.slice(idx) };
}

/** Highlight a specific word/phrase in gold within a result text */
function ResultTextHighlighted({ text, highlight }) {
  if (!highlight || !text.includes(highlight)) {
    return <span className="text-white">{text}</span>;
  }
  const [before, after] = text.split(highlight);
  return (
    <span className="text-[14px] font-normal text-white">
      {before}
      <span className="font-semibold text-[#DA9811]">{highlight}</span>
      {after}
    </span>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function TeamFlag({ team }) {
  const src = team.flag ? FLAGS[team.flag] : null;
  if (src) {
    return (
      <img
        src={src}
        alt=""
        className="h-5 w-5 shrink-0 rounded-sm object-cover"
        aria-hidden
      />
    );
  }
  return (
    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-sm bg-emerald-600 text-[10px] font-bold text-white">
      {team.initial}
    </div>
  );
}

/** Win Probability card shown only for LIVE status */
function WinProbabilityCard({ match, winProb }) {
  const p1 = winProb.team1;
  const p2 = winProb.team2;
  const higherIsTeam2 = p2 >= p1;

  return (
    <div className="border-t border-[#1A1A1A] px-4 py-4">
      <div className="mt-2 mb-6 flex items-center justify-center gap-2">
        <img
          src={winProbabilityIcon}
          alt=""
          className="h-5 w-5 shrink-0"
          aria-hidden
        />
        <span className="text-[14px] font-bold text-[#A2A6AB]">
          Win Probability
        </span>
      </div>
      <div className="flex items-stretch">
        <div className="flex flex-1 flex-col items-center justify-center">
          <span className="mb-1 text-[14px] text-[#A2A6AB]">
            {match.team1.name}
          </span>
          <span
            className={`text-[14px] font-bold ${higherIsTeam2 ? 'text-white' : 'text-[#DA9811]'}`}
          >
            {p1}%
          </span>
        </div>
        <div
          className="w-px shrink-0 self-stretch bg-gradient-to-b from-transparent via-white/40 to-transparent"
          aria-hidden
        />
        <div className="flex flex-1 flex-col items-center justify-center">
          <span className="mb-1 text-[12px] text-[#A2A6AB]">
            {match.team2.name}
          </span>
          <span
            className={`text-[18px] font-bold ${higherIsTeam2 ? 'text-[#DA9811]' : 'text-white'}`}
          >
            {p2}%
          </span>
        </div>
      </div>
    </div>
  );
}

/** Match header info section - renders differently per status */
function MatchHeader({ match, details }) {
  const { status, matchId, team1, team2, score1, score2, meta } = match;
  const isUpcoming = status === 'upcoming';
  const isLive = status === 'live';
  const isResult = status === 'result';
  const liveScore2 = !isUpcoming ? parseLiveScore(score2) : null;

  return (
    <div className="px-4 pb-4">
      {isUpcoming ? (
        <>
          <p className="mb-1 text-[13px] font-bold text-white uppercase">
            {status}
          </p>
          <p className="mb-3 text-[12px] text-[#A2A6AB]">{matchId}</p>
        </>
      ) : (
        <div className="mb-4">
          <span className="shrink-0 text-[13px] font-bold text-white uppercase">
            {isLive ? 'LIVE' : 'RESULT'}
          </span>
          <p className="mt-2 text-[12px] text-[#A2A6AB]">{matchId}</p>
        </div>
      )}

      <div className="mb-3 flex flex-col gap-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <TeamFlag team={team1} />
            <span className="truncate text-[14px] font-semibold text-white">
              {team1.name}
            </span>
          </div>
          {isUpcoming ? (
            <span className="shrink-0 text-[14px] text-[#A2A6AB]">
              {meta?.time}
            </span>
          ) : (
            score1 && (
              <span className="shrink-0 text-[14px] font-medium text-[#A2A6AB]">
                {score1}
              </span>
            )
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <TeamFlag team={team2} />
            <span className="truncate text-[14px] font-semibold text-white">
              {team2.name}
            </span>
          </div>
          {isUpcoming ? (
            <span className="shrink-0 text-[16px] font-bold text-white">
              {meta?.startsIn}
            </span>
          ) : (
            score2 && (
              <span className="shrink-0 text-right">
                {liveScore2?.overs && (
                  <span className="text-[14px] text-[#A2A6AB]">
                    {liveScore2.overs}{' '}
                  </span>
                )}
                <span className="text-[14px] font-bold text-[#DA9811]">
                  {liveScore2?.current ?? score2}
                </span>
              </span>
            )
          )}
        </div>
      </div>

      {isLive && meta?.commentary && (
        <p className="mb-3">
          <CommentaryText
            text={meta.commentary}
            className="text-[14px] text-white"
          />
        </p>
      )}

      {isLive && details?.crr && (
        <div className="mb-1 flex gap-2">
          <span className="rounded-full bg-[#141412] px-3 py-3 text-[12px] font-medium text-[#A2A6AB]">
            CRR: {details.crr}
          </span>
          <span className="rounded-full bg-[#141412] px-3 py-3 text-[12px] font-medium text-[#A2A6AB]">
            RRR: {details.rrr}
          </span>
        </div>
      )}

      {isResult && details?.resultText && (
        <ResultTextHighlighted
          text={details.resultText}
          highlight={details.resultHighlight}
        />
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ScorecardStatusDetails() {
  const navigate = useNavigate();
  const { tournamentId, matchId } = useParams();

  const match = MOCK_MATCHES.find((m) => m.id === Number(matchId));
  const details = MOCK_MATCH_DETAILS[Number(matchId)] ?? null;
  const matches = MOCK_MATCHES.filter((m) => m.league === tournamentId);

  const status = match?.status ?? 'upcoming';
  const tabs = STATUS_TABS[status] ?? [];
  const defaultTab = STATUS_DEFAULT_TAB[status] ?? tabs[0]?.value;

  const [activeTab, setActiveTab] = useState(defaultTab);

  useEffect(() => {
    const nextDefault =
      STATUS_DEFAULT_TAB[status] ?? STATUS_TABS[status]?.[0]?.value;
    setActiveTab(nextDefault);
  }, [status, matchId]);

  if (!match) {
    return (
      <div className="flex items-center justify-center bg-black">
        <p className="text-[13px] text-[#A2A6AB]">Match not found</p>
      </div>
    );
  }

  const ActiveView = TAB_VIEWS[activeTab] ?? StatusDetailsPlaceholderTab;

  const tabProps = {
    live: { details },
    scorecard: { details },
    overs: { match, details },
    'playing-xi': { match, details },
    table: { tournamentId },
    stats: { tournamentId },
    fixture: { matches, tournamentId },
  };

  return (
    <div className="bg-black">
      <header className="flex items-center gap-3 bg-black px-4 pt-6 pb-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-[27px] w-[27px] shrink-0 items-center justify-center rounded-full bg-white text-[#4a4a4a] transition-opacity active:opacity-80"
          aria-label="Back"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="min-w-0 flex-1 pr-[27px] text-center text-[16px] font-bold tracking-wide text-white uppercase">
          SCORE CARD
        </h1>
      </header>

      <MatchHeader match={match} details={details} />

      {status === 'live' && details?.winProb && (
        <WinProbabilityCard match={match} winProb={details.winProb} />
      )}

      <Container className="!px-4 !py-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="-mx-4 bg-black px-4 pt-3 pb-2">
            <TabsList className={scorecardListClass}>
              {tabs.map(({ value, label }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className={scorecardTriggerClass}
                >
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="mt-4">
            <ActiveView {...(tabProps[activeTab] ?? {})} />
          </div>
        </Tabs>
      </Container>
    </div>
  );
}
