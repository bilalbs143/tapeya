import { Link } from 'react-router-dom';

import { NAVBAR_OFFSET_CSS, STICKY_TABS_Z } from '@/lib/constants/layout';
import { ListEmpty } from '@/ui/ListState';
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

function TournamentLinks({ tournaments = [] }) {
  if (tournaments.length === 0) return null;

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {tournaments.map((tournament) => (
        <Link key={tournament.id} to={`/scorecard/${tournament.id}`} className={scorecardLinkClass}>
          {tournament.tournament_name || tournament.name || `Tournament ${tournament.id}`}
        </Link>
      ))}
    </div>
  );
}

function TabListRow({ className = '' }) {
  return (
    <TabsList className={`${scorecardListClass} lg:gap-2 ${className}`.trim()}>
      <TabsTrigger value="all" className={`${scorecardTriggerClass} lg:min-w-[96px] lg:px-4`}>
        All
      </TabsTrigger>
    </TabsList>
  );
}

export function ScorecardTabs({ matches, tournaments = [], fixedVisible = false, fixedTop = NAVBAR_OFFSET_CSS }) {
  return (
    <Tabs defaultValue="all" className="w-full">
      {fixedVisible && (
        <div className="fixed right-0 left-0 bg-black pt-1 pb-2 lg:left-[280px]" style={{ top: fixedTop, zIndex: STICKY_TABS_Z }}>
          {/* Match main column width on desktop (sidebar 280px); avoid max-w-2xl clipping tabs */}
          <div className="mx-auto w-full max-w-2xl min-w-0 px-4 lg:mx-0 lg:max-w-none">
            <TabListRow />
            <TournamentLinks tournaments={tournaments} />
          </div>
        </div>
      )}
      <TabListRow />
      <TournamentLinks tournaments={tournaments} />
      <TabsContent value="all" className="mt-4 focus:outline-none">
        {matches.length === 0 ? (
          <ListEmpty title="No Matches In This Category." />
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
