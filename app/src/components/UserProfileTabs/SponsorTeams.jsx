import { useState } from 'react';

import { CONTENT_MAX_WIDTH } from './constants';

const LABEL_CLASS =
  'text-[14px] font-bold uppercase tracking-wide text-[#A2A6AB]';
const VALUE_CLASS = 'text-sm font-normal text-white';

const TEAMS_FULL = [
  'Team Alpha',
  'Team Beta',
  'Youth League A',
  'Regional Champions',
  'Community XI',
];
const TEAMS_PREVIEW_COUNT = 3;

const SUMMARY = [
  { label: 'TEAMS SPONSORED', value: '5' },
  { label: 'PARTNERSHIPS', value: '3' },
  { label: 'REACH', value: '12K' },
];

function StatItemInline({ label, value }) {
  return (
    <span className="inline">
      <span className={LABEL_CLASS}>{label}: </span>
      <span className={VALUE_CLASS}>{value}</span>
    </span>
  );
}

export function SponsorTeams() {
  const [expanded, setExpanded] = useState(false);

  const teamsToShow = expanded
    ? TEAMS_FULL
    : TEAMS_FULL.slice(0, TEAMS_PREVIEW_COUNT);
  const hasMore = TEAMS_FULL.length > TEAMS_PREVIEW_COUNT;
  const showMore = hasMore && !expanded;
  const showLess = hasMore && expanded;

  return (
    <div className={`mx-auto w-full ${CONTENT_MAX_WIDTH} py-6`}>
      <div className="flex flex-wrap items-baseline gap-x-8">
        {SUMMARY.map(({ label, value }) => (
          <StatItemInline key={label} label={label} value={value} />
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-baseline gap-x-1">
        <span className={LABEL_CLASS}>SPONSORED TEAMS:</span>
        <span className="text-sm font-normal text-white/70">
          {teamsToShow.join(', ')}
          {showMore ? '...' : ''}
        </span>
        {showMore && (
          <button
            type="button"
            className="text-sm font-normal text-[#d8a11e] underline underline-offset-2 transition-colors hover:text-[#e5b42a] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d8a11e] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f0f0f]"
            onClick={() => setExpanded(true)}
          >
            MORE
          </button>
        )}
        {showLess && (
          <button
            type="button"
            className="ml-1 text-sm font-normal text-[#d8a11e] underline underline-offset-2 transition-colors hover:text-[#e5b42a] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d8a11e] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f0f0f]"
            onClick={() => setExpanded(false)}
          >
            LESS
          </button>
        )}
      </div>

      <div className="mt-5 h-px w-full bg-[linear-gradient(to_right,#00000000,#FFFFFF33,#00000000)]" />

      <h2 className="mt-6 text-[12px] font-bold tracking-wide text-white uppercase">
        BRANDING & PARTNERSHIPS
      </h2>
      <p className="mt-4 text-sm text-white/70">
        Manage sponsored teams, logos, and partnership details here.
      </p>
    </div>
  );
}
