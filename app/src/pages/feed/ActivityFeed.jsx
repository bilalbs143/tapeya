import { useCallback, useState } from 'react';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { Container } from '@/ui/Container';

import { ACTIVITY_FEED_POSTS, ACTIVITY_FEED_SECTION_TITLE } from './feedData';
import PostCard from './PostCard';

/**
 * Activity Feed page. Renders a list of posts with like support.
 * Data is currently from feedData; replace with API call when backend is ready.
 */
export default function ActivityFeed() {
  const [likedPostIds, setLikedPostIds] = useState(new Set());

  const toggleLike = useCallback((postId) => {
    setLikedPostIds((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return next;
    });
  }, []);

  return (
    <div className="bg-black text-white">
      <AppSubpageHeader title="ACTIVITY FEED" />
      <Container>
        <div className="flex flex-col gap-3 pb-8">
          <h2 className="text-[13px] font-bold tracking-wide text-[#A2A6AB] uppercase">
            {ACTIVITY_FEED_SECTION_TITLE}
          </h2>

          <div className="flex flex-col gap-6">
            {ACTIVITY_FEED_POSTS.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                isLiked={likedPostIds.has(post.id)}
                likesCountOverride={
                  likedPostIds.has(post.id) ? post.likesCount + 1 : undefined
                }
                onLike={toggleLike}
              />
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
