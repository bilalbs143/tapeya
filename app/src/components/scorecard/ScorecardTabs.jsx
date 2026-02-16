/**
 * Scorecard filter tabs - Matches (all), DMT, TSL, DPL, XRL, KTPL
 */
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/ui/Tabs';

import { MatchCard } from './MatchCard';

const TABS = [
  { value: 'all', label: 'Matches' },
  { value: 'DMT', label: 'DMT' },
  { value: 'TSL', label: 'TSL' },
  { value: 'DPL', label: 'DPL' },
  { value: 'XRL', label: 'XRL' },
  { value: 'KTPL', label: 'KTPL' },
];

const listClass =
  'flex w-full gap-1 overflow-x-auto p-1 text-white [scrollbar-width:none] [&::-webkit-scrollbar]:hidden';
const triggerClass =
  'shrink-0 rounded-[17px] px-3 py-2 text-[13px] font-bold uppercase transition-colors data-[state=inactive]:bg-transparent data-[state=inactive]:text-white data-[state=active]:bg-[#DA9811] data-[state=active]:text-black focus:outline-none';

function filterMatches(matches, league) {
  if (league === 'all') return matches;
  return matches.filter((m) => m.league === league);
}

export function ScorecardTabs({ matches }) {
  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList className={listClass}>
        {TABS.map(({ value, label }) => (
          <TabsTrigger key={value} value={value} className={triggerClass}>
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
      {TABS.map(({ value }) => {
        const filtered = filterMatches(matches, value);
        return (
          <TabsContent
            key={value}
            value={value}
            className="mt-4 space-y-3 focus:outline-none"
          >
            {filtered.length === 0 ? (
              <p className="py-8 text-center text-[13px] text-[#A2A6AB]">
                No matches in this category
              </p>
            ) : (
              filtered.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))
            )}
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
