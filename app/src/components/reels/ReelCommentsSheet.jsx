/**
 * Reel comments bottom sheet — same thread UI as feed detail, sheet chrome for reels.
 */

import PostCommentsThread from '@/components/feed/PostCommentsThread';
import { BottomSheet } from '@/ui/BottomSheet';

function ChevronDownIcon({ className = '' }) {
  return (
    <svg
      className={className}
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export default function ReelCommentsSheet({ reelId, open, onOpenChange }) {
  return (
    <PostCommentsThread
      postId={reelId}
      enabled={open && Boolean(reelId)}
      showHeader={false}
      render={({ list, composer, total, resetLocal }) => (
        <BottomSheet
          open={open}
          onOpenChange={(next) => {
            if (!next) resetLocal();
            onOpenChange(next);
          }}
          title={`Comments (${total})`}
          toolbar={
            <div className="flex items-center gap-1 text-[12px] font-semibold text-white">
              Top Comments
              <ChevronDownIcon className="text-muted" />
            </div>
          }
          footer={composer}
        >
          {list}
        </BottomSheet>
      )}
    />
  );
}
