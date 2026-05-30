import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';

const highlight1 = `${CLOUDFRONT_APP_BASE}/images/standard/highlight-1.png`;
const highlight2 = `${CLOUDFRONT_APP_BASE}/images/standard/highlight-2.jpg`;
const fixtureBg = `${CLOUDFRONT_APP_BASE}/images/background/fixture-bg.png`;

const sampleVideoUrl = 'https://videos.pexels.com/video-files/15172075/15172075-uhd_1440_2560_60fps.mp4';

/** Static seed data until highlights API is available. */
export const HIGHLIGHTS = [
  {
    id: 1,
    title: '7th Match Rawalpindi Royal vs Karachi Kids KTPS 2026',
    detailTitle: '7th Match Rawalpindi Royal vs Karachi Kids - Season 2',
    publishedAt: '2026-10-18',
    viewsCount: 4820,
    durationMinutes: 20,
    likesCount: 5000,
    dislikesCount: 10,
    sharesCount: 68,
    description: 'Relive passion and excitement of Rawalpindi Royal vs Karachi Kids only on Tapeya',
    thumbnailUrl: highlight1,
    videoUrl: sampleVideoUrl,
  },
  {
    id: 2,
    title: '6th Match Lahore Lions vs Islamabad Invincibles KTPS 2026',
    detailTitle: '6th Match Lahore Lions vs Islamabad Invincibles - Season 2',
    publishedAt: '2026-10-16',
    viewsCount: 9150,
    durationMinutes: 18,
    likesCount: 3200,
    dislikesCount: 8,
    sharesCount: 42,
    description: 'Catch every boundary and wicket from Lahore Lions vs Islamabad Invincibles on Tapeya.',
    thumbnailUrl: highlight2,
    videoUrl: sampleVideoUrl,
  },
  {
    id: 3,
    title: '5th Match Multan Sultans vs Peshawar Zalmi KTPS 2026',
    detailTitle: '5th Match Multan Sultans vs Peshawar Zalmi - Season 2',
    publishedAt: '2026-10-14',
    viewsCount: 7340,
    durationMinutes: 22,
    likesCount: 4100,
    dislikesCount: 12,
    sharesCount: 55,
    description: 'Multan Sultans take on Peshawar Zalmi in a thrilling KTPS 2026 clash.',
    thumbnailUrl: fixtureBg,
    videoUrl: sampleVideoUrl,
  },
  {
    id: 4,
    title: '4th Match Quetta Gladiators vs Karachi Kings KTPS 2026',
    detailTitle: '4th Match Quetta Gladiators vs Karachi Kings - Season 2',
    publishedAt: '2026-10-12',
    viewsCount: 11200,
    durationMinutes: 19,
    likesCount: 6800,
    dislikesCount: 15,
    sharesCount: 91,
    description: 'Quetta Gladiators vs Karachi Kings — highlights from an unforgettable encounter.',
    thumbnailUrl: highlight1,
    videoUrl: sampleVideoUrl,
  },
  {
    id: 5,
    title: '3rd Match Faisalabad Falcons vs Sialkot Stallions KTPS 2026',
    detailTitle: '3rd Match Faisalabad Falcons vs Sialkot Stallions - Season 2',
    publishedAt: '2026-10-10',
    viewsCount: 5680,
    durationMinutes: 17,
    likesCount: 2900,
    dislikesCount: 6,
    sharesCount: 37,
    description: 'Faisalabad Falcons vs Sialkot Stallions — all the best moments in one place.',
    thumbnailUrl: highlight2,
    videoUrl: sampleVideoUrl,
  },
  {
    id: 6,
    title: '2nd Match Hyderabad Hawks vs Gwadar Giants KTPS 2026',
    detailTitle: '2nd Match Hyderabad Hawks vs Gwadar Giants - Season 2',
    publishedAt: '2026-10-08',
    viewsCount: 8900,
    durationMinutes: 21,
    likesCount: 4500,
    dislikesCount: 9,
    sharesCount: 60,
    description: 'Hyderabad Hawks vs Gwadar Giants — relive the drama on Tapeya.',
    thumbnailUrl: fixtureBg,
    videoUrl: sampleVideoUrl,
  },
];

export const HIGHLIGHTS_FALLBACK_IMAGE = fixtureBg;
