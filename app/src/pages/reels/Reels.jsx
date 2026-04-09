/**
 * Reels
 *
 * Reels feed: explore / my-videos tabs, vertical scroll, like.
 * Route: /reels
 *
 * Coding guidelines: docs/Coding guidelines.md (§2 selectors)
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import { useLocation, useNavigate } from 'react-router-dom';

import exploreOrangeIcon from '@/assets/images/icons/explore-orange.svg';
import exploreWhiteIcon from '@/assets/images/icons/explore-white.svg';
import myVideosOrangeIcon from '@/assets/images/icons/my-videos-orange.svg';
import myVideosWhiteIcon from '@/assets/images/icons/my-videos-white.svg';
import { useAppSelector } from '@/store/hooks';
import { selectPublishedReels } from '@/store/selectors';

import ReelItem from './ReelItem';
import { EXPLORE_REELS, MY_VIDEOS_REELS } from './reelsData';

const TAB_EXPLORE = 'explore';
const TAB_MY_VIDEOS = 'my-videos';

function ChevronLeftIcon() {
  return (
    <svg width="8" height="14" viewBox="0 0 8 14" fill="none" aria-hidden>
      <path
        d="M7 1L1 7l6 6"
        stroke="#000"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Reels() {
  const navigate = useNavigate();
  const location = useLocation();
  const publishedReels = useAppSelector(selectPublishedReels);
  const [activeTab, setActiveTab] = useState(
    location.state?.tab === TAB_MY_VIDEOS ? TAB_MY_VIDEOS : TAB_EXPLORE,
  );
  const [likedIds, setLikedIds] = useState(new Set());
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef(null);

  const reels =
    activeTab === TAB_EXPLORE
      ? EXPLORE_REELS
      : [...publishedReels, ...MY_VIDEOS_REELS];

  // Reset to first reel when switching tabs
  useEffect(() => {
    setActiveIndex(0);
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [activeTab]);

  // Derive active index from scroll position
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const { scrollTop, clientHeight } = containerRef.current;
    const index = Math.round(scrollTop / clientHeight);
    setActiveIndex(index);
  }, []);

  const toggleLike = useCallback((id) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  return (
    /*
     * Fixed overlay sits above the <main> flow but below the Navbar (z-50)
     * and BottomNav (z-40), so both remain visible on top.
     */
    <div className="fixed inset-0 z-30 bg-black lg:left-[280px]">
      <div className="relative h-full w-full lg:mx-auto lg:max-w-[430px] lg:border-x lg:border-[#1A1A1A]">
        {/* Tab bar — back left, Explore & My Videos centered */}
        <div className="absolute top-[64px] right-0 left-0 z-10 flex items-center justify-between px-4 py-2">
          {/* Back — left */}
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-[27px] w-[27px] shrink-0 items-center justify-center rounded-full bg-white shadow"
            aria-label="Go back"
          >
            <ChevronLeftIcon />
          </button>

          {/* Explore & My Videos — center, text stays inline */}
          <div className="absolute left-1/2 flex -translate-x-1/2 flex-nowrap items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveTab(TAB_EXPLORE)}
              className={`flex shrink-0 items-center gap-1.5 text-[13px] font-bold tracking-wide whitespace-nowrap uppercase transition-colors ${
                activeTab === TAB_EXPLORE ? 'text-[#DA9811]' : 'text-white'
              }`}
            >
              <img
                src={
                  activeTab === TAB_EXPLORE
                    ? exploreOrangeIcon
                    : exploreWhiteIcon
                }
                alt=""
                className="h-[18px] w-[18px] shrink-0"
                aria-hidden
              />
              Explore
            </button>
            <button
              type="button"
              onClick={() => setActiveTab(TAB_MY_VIDEOS)}
              className={`flex shrink-0 items-center gap-1.5 text-[13px] font-bold tracking-wide whitespace-nowrap uppercase transition-colors ${
                activeTab === TAB_MY_VIDEOS ? 'text-[#DA9811]' : 'text-white'
              }`}
            >
              <img
                src={
                  activeTab === TAB_MY_VIDEOS
                    ? myVideosOrangeIcon
                    : myVideosWhiteIcon
                }
                alt=""
                className="h-[18px] w-[18px] shrink-0"
                aria-hidden
              />
              My Videos
            </button>
          </div>

          {/* Spacer — same width as back button so center is true */}
          <div className="w-[27px] shrink-0" aria-hidden />
        </div>

        {/* Vertical snap scroll container */}
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="h-full w-full [scroll-snap-type:y_mandatory] overflow-y-scroll [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {reels.map((reel, index) => (
            <ReelItem
              key={reel.id}
              reel={reel}
              isActive={index === activeIndex}
              isLiked={likedIds.has(reel.id)}
              onLike={toggleLike}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
