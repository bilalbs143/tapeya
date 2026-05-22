import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';

const liveImg1 = `${CLOUDFRONT_APP_BASE}/images/standard/live-img-1.png`;
const liveImg2 = `${CLOUDFRONT_APP_BASE}/images/standard/live-img-2.png`;
const liveImg3 = `${CLOUDFRONT_APP_BASE}/images/standard/live-img-3.png`;

/** Live stream / broadcast events (mock until API is available). */
export const LIVE_EVENTS = [
  {
    id: 'live-1',
    image: liveImg1,
    title: '7th Match Rawalpindi Royal vs Karachi Kids',
    tournament: 'KTPS 2026',
    venue: 'Fortress Stadium',
  },
  {
    id: 'live-2',
    image: liveImg2,
    title: 'Semi Final Lahore Lions vs Islamabad XI',
    tournament: 'Tapeya Premier League',
    venue: 'National Stadium',
  },
  {
    id: 'live-3',
    image: liveImg3,
    title: 'Group Stage Multan Masters vs Peshawar Panthers',
    tournament: 'KTPS 2026',
    venue: 'Gaddafi Stadium',
  },
];

/** Scheduled broadcasts (mock until API is available). */
export const UPCOMING_EVENTS = [
  {
    id: 'upcoming-1',
    image: liveImg2,
    title: '7th Match Rawalpindi Royal vs Karachi Kids',
    tournament: 'KTPS 2026',
    scheduledAt: '26th March 2026',
  },
  {
    id: 'upcoming-2',
    image: liveImg1,
    title: '8th Match Faisalabad Falcons vs Quetta Gladiators',
    tournament: 'KTPS 2026',
    scheduledAt: '28th March 2026',
  },
  {
    id: 'upcoming-3',
    image: liveImg3,
    title: 'Final Karachi Kings vs Rawalpindi Royals',
    tournament: 'Tapeya Premier League',
    scheduledAt: '2nd April 2026',
  },
  {
    id: 'upcoming-4',
    image: liveImg1,
    title: 'Opening Ceremony & Toss',
    tournament: 'Summer Cup 2026',
    scheduledAt: '5th April 2026',
  },
  {
    id: 'upcoming-5',
    image: liveImg2,
    title: 'Qualifier 2 Hyderabad Hawks vs Sukkur Stars',
    tournament: 'KTPS 2026',
    scheduledAt: '8th April 2026',
  },
];
