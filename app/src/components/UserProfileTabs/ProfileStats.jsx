import { useState } from 'react';

import { CONTENT_MAX_WIDTH } from './constants';

const SUMMARY_STATS = [
  { label: 'SCORE', value: '1265' },
  { label: 'CENTURIES', value: '6' },
  { label: 'SIXES', value: '19' },
];

const TEAMS_FULL = [
  'Team Abc',
  'team Xyz',
  'Team H1',
  'Team Delta',
  'Team Omega',
  'Team Phoenix',
];
const TEAMS_PREVIEW_COUNT = 3;

const CAREER_AVERAGES = [
  { label: 'SPAN', value: '2017-2025' },
  { label: 'MAT', value: '50' },
  { label: 'INNS', value: '92' },
  { label: 'RUNS', value: '3192' },
  { label: 'HS', value: '152' },
  { label: 'AVG', value: '35.46' },
  { label: 'SR', value: '59.03' },
  { label: '100S', value: '8' },
  { label: '50S', value: '13' },
  { label: 'OS', value: '7' },
  { label: '4S', value: '453' },
  { label: '6S', value: '16' },
];

const LABEL_CLASS =
  'text-[14px] font-bold uppercase tracking-wide text-[#A2A6AB]';
const VALUE_CLASS = 'text-sm font-normal text-white';

function StatItem({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className={LABEL_CLASS}>{label}:</span>
      <span className={VALUE_CLASS}>{value}</span>
    </div>
  );
}

function StatItemInline({ label, value }) {
  return (
    <span className="inline">
      <span className={LABEL_CLASS}>{label}: </span>
      <span className={VALUE_CLASS}>{value}</span>
    </span>
  );
}

export function ProfileStats() {
  const [teamsExpanded, setTeamsExpanded] = useState(false);

  const teamsToShow = teamsExpanded
    ? TEAMS_FULL
    : TEAMS_FULL.slice(0, TEAMS_PREVIEW_COUNT);
  const hasMoreTeams = TEAMS_FULL.length > TEAMS_PREVIEW_COUNT;
  const showMoreLink = hasMoreTeams && !teamsExpanded;
  const showLessLink = hasMoreTeams && teamsExpanded;

  return (
    <div className={`mx-auto w-full ${CONTENT_MAX_WIDTH} py-6`}>
      {/* Summary stats — inline */}
      <div className="flex flex-wrap items-baseline gap-x-8">
        {SUMMARY_STATS.map(({ label, value }) => (
          <StatItemInline key={label} label={label} value={value} />
        ))}
      </div>

      {/* Teams */}
      <div className="mt-4 flex flex-wrap items-baseline gap-x-1">
        <span className={LABEL_CLASS}>TEAMS:</span>
        <span className="text-sm font-normal text-white/70">
          {teamsToShow.join(', ')}
          {showMoreLink ? '...' : ''}
        </span>
        {showMoreLink && (
          <button
            type="button"
            className="text-sm font-normal text-[#d8a11e] underline underline-offset-2 transition-colors hover:text-[#e5b42a] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d8a11e] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f0f0f]"
            onClick={() => setTeamsExpanded(true)}
          >
            MORE
          </button>
        )}
        {showLessLink && (
          <button
            type="button"
            className="ml-1 text-sm font-normal text-[#d8a11e] underline underline-offset-2 transition-colors hover:text-[#e5b42a] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d8a11e] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f0f0f]"
            onClick={() => setTeamsExpanded(false)}
          >
            LESS
          </button>
        )}
      </div>

      <div className="mt-5 h-px w-full bg-[linear-gradient(to_right,#00000000,#FFFFFF33,#00000000)]" />

      {/* Career averages */}
      <h2 className="mt-6 text-[12px] font-bold tracking-wide text-white uppercase">
        CAREER AVERAGES
      </h2>
      <div className="mt-4 grid grid-cols-3 gap-x-8 gap-y-5">
        {CAREER_AVERAGES.map(({ label, value }) => (
          <StatItem key={label} label={label} value={value} />
        ))}
      </div>
    </div>
  );
}
