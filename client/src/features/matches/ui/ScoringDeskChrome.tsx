import type { ReactNode } from 'react';

import type { ScoringChaseView } from '../lib/scoringDeskDerived';
import { ConnectionBanner, type ConnectionState } from './ConnectionBanner';
import { type ScorerHeaderSide, ScorerMatchHeader } from './ScorerMatchHeader';

type ScoringDeskChromeProps = {
  home: ScorerHeaderSide | null;
  away: ScorerHeaderSide | null;
  batting: ScorerHeaderSide | null;
  inningsNumber: number;
  runs: number;
  wickets: number;
  oversDisplay: string | null;
  oversPerSide: number | null;
  venue: string | null;
  currentRunRate: string | null;
  overTokens: string[];
  chase: ScoringChaseView | null;
  connection: ConnectionState;
  lastSent: string | null;
  queued: number;
  crowdScore: string | null;
  serverOvers: string | null;
  localOvers: string | null;
  conflictSince: string | null;
  onBack: () => void;
  onDiscard?: (() => void) | undefined;
  onReview?: (() => void) | undefined;
  action: ReactNode;
};

/** Sticky match header + connection strip — presentational only. */
export function ScoringDeskChrome({
  home,
  away,
  batting,
  inningsNumber,
  runs,
  wickets,
  oversDisplay,
  oversPerSide,
  venue,
  currentRunRate,
  overTokens,
  chase,
  connection,
  lastSent,
  queued,
  crowdScore,
  serverOvers,
  localOvers,
  conflictSince,
  onBack,
  onDiscard,
  onReview,
  action,
}: ScoringDeskChromeProps) {
  return (
    <div className="sticky top-0 z-30 shrink-0">
      <ScorerMatchHeader
        home={home}
        away={away}
        batting={batting}
        inningsNumber={inningsNumber}
        runs={runs}
        wickets={wickets}
        oversDisplay={oversDisplay}
        oversPerSide={oversPerSide}
        venue={venue}
        currentRunRate={currentRunRate}
        overTokens={overTokens}
        chase={chase}
        connection={connection}
        lastSent={lastSent}
        onBack={onBack}
        action={action}
      />
      <ConnectionBanner
        state={connection}
        queued={queued}
        lastSent={lastSent}
        crowdScore={crowdScore}
        serverOvers={serverOvers}
        localOvers={localOvers}
        conflictSince={conflictSince}
        onDiscard={onDiscard}
        onReview={onReview}
      />
    </div>
  );
}
