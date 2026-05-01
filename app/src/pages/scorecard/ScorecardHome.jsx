/**
 * ScorecardHome.jsx
 *
 * Entry point for the scorecard section.  Fetches all tournaments with their
 * matches, normalises the raw API data into a flat match list, and passes it
 * to <ScorecardTabs> for display.
 *
 * Also implements a sentinel-based sticky tab bar that becomes fixed once the
 * user scrolls past it.
 *
 * Route: /scorecard
 *
 * -----------------------------------------------------------------------------
 * CURSOR — File structure guide
 * -----------------------------------------------------------------------------
 *
 * Utils to move out of this file
 * ───────────────────────────────
 *   normaliseTournamentMatches(tournaments)
 *     → move to: src/lib/utils/scorecardUtils.js
 *             → export { normaliseTournamentMatches }
 *     reason: the `flatMap` + status-mapping + team-name-fallback block is
 *             large, pure, and independently testable.  Extracting it also
 *             makes ScorecardHome easier to scan.
 *
 *   normaliseMatchStatus(statusRaw)
 *     → move to: src/lib/utils/scorecardUtils.js → export { normaliseMatchStatus }
 *     reason: the 'in_progress'|'live' → 'live' and 'completed'|'finished' →
 *             'result' mapping should be centralised so it stays in sync with
 *             whatever status strings the API returns.  If the API adds a new
 *             status (e.g. 'abandoned') only one file needs updating.
 *
 *   NAVBAR_HEIGHT = 64
 *     → move to: src/lib/constants/layout.js → export { NAVBAR_HEIGHT }
 *     reason: **duplicated** in ScorecardDetails.jsx — one source of truth
 *             prevents the two from drifting if the nav height ever changes.
 *
 * Hooks to extract
 * ─────────────────
 *   Sentinel IntersectionObserver (tabsSentinelRef + setTabsFixedVisible effect)
 *     → move to: src/hooks/useFixedOnScroll.js → export { useFixedOnScroll }
 *     reason: **identical** pattern in ScorecardDetails.jsx.  One hook:
 *               const { sentinelRef, isFixed } = useFixedOnScroll(NAVBAR_HEIGHT);
 *             replaces the duplicated useRef + useEffect + IntersectionObserver
 *             blocks in both files.
 *
 * Coding guidelines: docs/Coding guidelines.md
 * -----------------------------------------------------------------------------
 */

import { useEffect, useRef, useState } from 'react';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { ScorecardTabs } from '@/components/scorecard/ScorecardTabs';
import { NAVBAR_HEIGHT } from '@/lib/constants/layout';
import { normaliseTournamentMatches } from '@/lib/utils/scorecardUtils';
import { useGetTournamentsQuery } from '@/store/api/tournamentApi';
import { Container } from '@/ui/Container';

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function ScorecardHome() {
  const [tabsFixedVisible, setTabsFixedVisible] = useState(false);
  const tabsSentinelRef = useRef(null);

  const { data: tournamentsResponse } = useGetTournamentsQuery({
    all: true,
    with_matches: true,
  });

  const tournaments = tournamentsResponse?.data ?? [];

  const matches = normaliseTournamentMatches(tournaments);

  useEffect(() => {
    const sentinel = tabsSentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setTabsFixedVisible(!entry.isIntersecting);
      },
      {
        root: null,
        rootMargin: `-${NAVBAR_HEIGHT}px 0px 0px 0px`,
        threshold: 0,
      },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-black">
      <Container className="!px-4 !py-0">
        <AppSubpageHeader
          title="SCORE CARD"
          bottomSpacing="relaxed"
          className="-mx-4 -mt-6 lg:mt-0"
        />

        <div className="flex flex-col pt-2">
          <div ref={tabsSentinelRef} className="h-px w-full" aria-hidden />
          <div className="-mx-4 bg-black px-4 pt-0.5 pb-2">
            <ScorecardTabs
              matches={matches}
              tournaments={tournaments}
              fixedVisible={tabsFixedVisible}
              fixedTop={NAVBAR_HEIGHT}
            />
          </div>
        </div>
      </Container>
    </div>
  );
}
