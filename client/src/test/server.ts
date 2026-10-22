import { setupServer } from 'msw/node';

import { authHandlers } from '@/features/auth/test/handlers';
import { entertainmentHandlers } from '@/features/entertainment/test/handlers';
import { exploreHandlers } from '@/features/explore/test/handlers';
import { feedHandlers } from '@/features/feed/test/handlers';
import { highlightsHandlers } from '@/features/highlights/test/handlers';
import { interestHandlers } from '@/features/interest/test/handlers';
import { liveHandlers } from '@/features/live/test/handlers';
import { matchesHandlers } from '@/features/matches/test/handlers';
import { notificationsHandlers } from '@/features/notifications/test/handlers';
import { profileHandlers } from '@/features/profile/test/handlers';
import { rankingHandlers } from '@/features/ranking/test/handlers';
import { reelsHandlers } from '@/features/reels/test/handlers';
import { shopHandlers } from '@/features/shop/test/handlers';
import { statsHandlers } from '@/features/stats/test/handlers';
import { supportHandlers } from '@/features/support/test/handlers';
import { tournamentsHandlers } from '@/features/tournaments/test/handlers';

import { enumsHandlers } from '@/shared/api/enumsHandlers';
import { locationHandlers } from '@/shared/api/locationHandlers';

/** Root MSW server — composes every feature's handlers. Architecture doc §10. */
export const server = setupServer(
  ...enumsHandlers,
  ...locationHandlers,
  ...authHandlers,
  ...exploreHandlers,
  ...profileHandlers,
  ...reelsHandlers,
  ...feedHandlers,
  ...matchesHandlers,
  ...liveHandlers,
  ...notificationsHandlers,
  ...interestHandlers,
  ...highlightsHandlers,
  ...shopHandlers,
  ...entertainmentHandlers,
  ...tournamentsHandlers,
  ...statsHandlers,
  ...rankingHandlers,
  ...supportHandlers
);
