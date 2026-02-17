/**
 * Scorecard filter tabs - Matches (all), DMT, TSL, DPL, XRL, KTPL
 * Matches tab shows all; tournament tabs navigate to ScorecardDetails
 */
import { Link } from 'react-router-dom';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  scorecardListClass,
  scorecardLinkClass,
  scorecardTriggerClass,
} from '@/ui/Tabs';

import { MatchCard } from './MatchCard';

const TABS = [
  { value: 'all', label: 'Matches', isTournament: false },
  { value: 'DMT', label: 'DMT', isTournament: true },
  { value: 'TSL', label: 'TSL', isTournament: true },
  { value: 'DPL', label: 'DPL', isTournament: true },
  { value: 'XRL', label: 'XRL', isTournament: true },
  { value: 'KTPL', label: 'KTPL', isTournament: true },
];

export function ScorecardTabs({ matches }) {
  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList className={scorecardListClass}>
        {TABS.map(({ value, label, isTournament }) =>
          isTournament ? (
            <Link
              key={value}
              to={`/scorecard/${value}`}
              className={scorecardLinkClass}
            >
              {label}
            </Link>
          ) : (
            <TabsTrigger key={value} value={value} className={scorecardTriggerClass}>
              {label}
            </TabsTrigger>
          )
        )}
      </TabsList>
      <TabsContent value="all" className="mt-4 space-y-3 focus:outline-none">
        {matches.length === 0 ? (
          <p className="py-8 text-center text-[13px] text-[#A2A6AB]">
            No matches in this category
          </p>
        ) : (
          matches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))
        )}
      </TabsContent>
    </Tabs>
  );
}
