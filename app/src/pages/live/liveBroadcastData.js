import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';

import { LIVE_EVENTS } from './liveData';

export const defaultAvatar = `${CLOUDFRONT_APP_BASE}/images/standard/default-avatar.png`;

const BROADCAST_VIDEOS = [
  'https://videos.pexels.com/video-files/15172075/15172075-uhd_1440_2560_60fps.mp4',
  'https://videos.pexels.com/video-files/6800642/6800642-hd_1080_1920_30fps.mp4',
  'https://videos.pexels.com/video-files/4446327/4446327-hd_1920_1080_30fps.mp4',
];

/** Shared live-chat comments (mock until API is available). */
export const MOCK_BROADCAST_COMMENTS = [
  { id: 'c1', username: 'Sohaib Amjad', avatar: defaultAvatar, text: 'MashAllah Well played bro' },
  { id: 'c2', username: 'Sohaib Amjad', avatar: defaultAvatar, text: '😍😍😍😍😍' },
  { id: 'c3', username: 'Oneeb Arif', avatar: defaultAvatar, text: 'MashAllah 🔥' },
  { id: 'c4', username: 'Bilal Tendulkar', avatar: defaultAvatar, text: 'Great bowling by Shakib' },
];

/** Live streams for the broadcast feed (mock until API is available). */
export function getLiveBroadcasts() {
  return LIVE_EVENTS.map((event, index) => ({
    ...event,
    videoUrl: BROADCAST_VIDEOS[index % BROADCAST_VIDEOS.length],
    viewerCount: 315 - index * 12,
    comments: MOCK_BROADCAST_COMMENTS,
  }));
}

export function getBroadcastById(broadcastId) {
  if (!broadcastId) return null;
  return getLiveBroadcasts().find((b) => b.id === broadcastId) ?? null;
}
