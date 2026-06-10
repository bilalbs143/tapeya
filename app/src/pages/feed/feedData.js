/**
 * Activity feed sample data.
 * Shape is API-ready: replace with API call (e.g. GET /feed) when backend is available.
 *
 * Images use reliable CDNs (Lorem Picsum for post images, Pravatar for avatars).
 * Swap with API URLs when integrating backend.
 */

export const ACTIVITY_FEED_SECTION_TITLE = 'WHATS HAPPENING';

/**
 * @typedef {Object} LatestComment
 * @property {string} commenterName
 * @property {string} commenterAvatarUrl
 * @property {string} text
 */

/**
 * @typedef {Object} FeedComment
 * @property {string} id
 * @property {string} commenterName
 * @property {string} commenterAvatarUrl
 * @property {string} text
 * @property {number} likesCount
 * @property {number} dislikesCount
 */

/**
 * @typedef {Object} ActivityPost
 * @property {string} id
 * @property {string} imageUrl
 * @property {string} publishedAt - ISO date string for date/time overlay
 * @property {string} authorName
 * @property {string} authorAvatarUrl
 * @property {string} title
 * @property {string} description
 * @property {number} likesCount
 * @property {number} commentsCount
 * @property {number} sharesCount
 * @property {LatestComment|null} latestComment
 */

/** @type {ActivityPost[]} */
export const ACTIVITY_FEED_POSTS = [
  {
    id: 'post-1',
    imageUrl: 'https://picsum.photos/seed/cricket1/800/600',
    publishedAt: '2026-02-11T00:15:00',
    authorName: 'Oneeb Arif',
    authorAvatarUrl: 'https://i.pravatar.cc/128?img=33',
    title: "One of Cricket's purest feelings!",
    description:
      "You're new at the crease. Still settling in. Mind racing. And the second ball is a half-volley begging to be hit....",
    likesCount: 5000,
    commentsCount: 10,
    sharesCount: 68,
    latestComment: {
      commenterName: 'Bilal Tendulkar',
      commenterAvatarUrl: 'https://i.pravatar.cc/128?img=68',
      text: 'Oneeb performed well in the first innings, good luck to the team 🏏🔥',
    },
  },
  {
    id: 'post-2',
    imageUrl: 'https://picsum.photos/seed/cricket2/800/600',
    publishedAt: '2026-02-10T14:30:00',
    authorName: 'Sohaib Amjad',
    authorAvatarUrl: 'https://i.pravatar.cc/128?img=12',
    title: 'Night match energy is something else',
    description: 'Under the lights, every ball matters. The crowd, the pressure, the thrill of the chase....',
    likesCount: 1240,
    commentsCount: 24,
    sharesCount: 31,
    latestComment: {
      commenterName: 'Cricket Addict',
      commenterAvatarUrl: 'https://i.pravatar.cc/128?img=45',
      text: 'Best match of the season so far! 🏏',
    },
  },
  {
    id: 'post-3',
    imageUrl: 'https://picsum.photos/seed/cricket3/800/600',
    publishedAt: '2026-02-09T18:45:00',
    authorName: 'Cricket Nation',
    authorAvatarUrl: 'https://i.pravatar.cc/128?img=52',
    title: 'That cover drive feeling',
    description: 'Timing, balance, and the sound off the bat. Nothing quite like it when everything clicks....',
    likesCount: 892,
    commentsCount: 15,
    sharesCount: 22,
    latestComment: {
      commenterName: 'Fan of the Game',
      commenterAvatarUrl: 'https://i.pravatar.cc/128?img=23',
      text: 'Pure class! More of these please 👍',
    },
  },
];

/**
 * Full comment lists per post for detail view.
 * API-ready: replace with GET /feed/:postId/comments when backend is available.
 * @type {Record<string, FeedComment[]>}
 */
export const COMMENT_LISTS_BY_POST_ID = {
  'post-1': [
    {
      id: 'comment-1-1',
      commenterName: 'Bilal Tendulkar',
      commenterAvatarUrl: 'https://i.pravatar.cc/128?img=68',
      text: 'Oneeb performed well in the first innings, good luck to the team 🔥🔥',
      likesCount: 56,
      dislikesCount: 10,
    },
    {
      id: 'comment-1-2',
      commenterName: 'Ted Monster',
      commenterAvatarUrl: 'https://i.pravatar.cc/128?img=44',
      text: 'That half-volley moment is everything. Great post!',
      likesCount: 12,
      dislikesCount: 0,
    },
  ],
  'post-2': [
    {
      id: 'comment-2-1',
      commenterName: 'Cricket Addict',
      commenterAvatarUrl: 'https://i.pravatar.cc/128?img=45',
      text: 'Best match of the season so far! 🏏',
      likesCount: 8,
      dislikesCount: 1,
    },
  ],
  'post-3': [
    {
      id: 'comment-3-1',
      commenterName: 'Fan of the Game',
      commenterAvatarUrl: 'https://i.pravatar.cc/128?img=23',
      text: 'Pure class! More of these please 👍',
      likesCount: 5,
      dislikesCount: 0,
    },
  ],
};

/**
 * Returns post and its comments for the detail page, or null if not found.
 * @param {string} postId
 * @returns {{ post: ActivityPost, comments: FeedComment[] } | null}
 */
export function getPostDetail(postId) {
  const post = ACTIVITY_FEED_POSTS.find((p) => p.id === postId) ?? null;
  if (!post) return null;
  const comments = COMMENT_LISTS_BY_POST_ID[postId] ?? [];
  return { post, comments };
}
