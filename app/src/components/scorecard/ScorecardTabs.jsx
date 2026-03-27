import { Link } from 'react-router-dom';

import {
  scorecardLinkClass,
  scorecardListClass,
  scorecardTriggerClass,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/ui/Tabs';

import { MatchCard } from './MatchCard';

function TabListRow({ className = '', tournaments = [] }) {
  return (
    <TabsList className={`${scorecardListClass} ${className}`.trim()}>
      <TabsTrigger value="all" className={scorecardTriggerClass}>
        All
      </TabsTrigger>
      {tournaments.map((tournament) => (
        <Link
          key={tournament.id}
          to={`/scorecard/${tournament.id}`}
          className={scorecardLinkClass}
        >
          {tournament.tournament_name ||
            tournament.name ||
            `Tournament ${tournament.id}`}
        </Link>
      ))}
    </TabsList>
  );
}

export function ScorecardTabs({
  matches,
  tournaments = [],
  fixedVisible = false,
  fixedTop = 64,
}) {
  return (
    <Tabs defaultValue="all" className="w-full">
      {fixedVisible && (
        <div
          className="fixed right-0 left-0 z-40 bg-black pt-1 pb-2 lg:left-[280px]"
          style={{ top: fixedTop }}
        >
          {/* Match main column width on desktop (sidebar 280px); avoid max-w-2xl clipping tabs */}
          <div className="mx-auto w-full min-w-0 max-w-2xl px-4 lg:mx-0 lg:max-w-none">
            <TabListRow tournaments={tournaments} />
          </div>
        </div>
      )}
      <TabListRow tournaments={tournaments} />
      <TabsContent value="all" className="mt-4 focus:outline-none">
        {matches.length === 0 ? (
          <p className="py-8 text-center text-[13px] text-[#A2A6AB]">
            No matches in this category
          </p>
        ) : (
          <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
            {matches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
