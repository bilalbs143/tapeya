import { useParams } from 'react-router-dom';

import { ScreenBar } from '@/shared/layout';
import { Spinner } from '@/shared/ui/Spinner';

import { isValidPostId } from '../lib/postDetail';
import { PostDetailBody } from '../ui/PostDetailBody';
import { usePostDetail } from '../ui/usePostDetail';

export default function PostDetailPage() {
  const { id } = useParams();
  const postId = Number(id);
  const valid = isValidPostId(postId);

  const flow = usePostDetail(postId, valid);
  const { isVideo, goHome } = flow;

  if (isVideo) {
    return (
      <div className="bg-surface flex min-h-full flex-col">
        <ScreenBar title="Activity Feed" subtitle="Post and Comments" onBack={goHome} />
        <div className="flex flex-1 items-center justify-center px-4 py-16">
          <div className="border-border-subtle bg-surface flex w-full max-w-[360px] items-center gap-2.5 rounded-field border px-3.5 py-3.5">
            <Spinner size="sm" label="Opening Reel" />
            <span className="text-body text-2xs font-semibold">Opening Reel…</span>
          </div>
        </div>
      </div>
    );
  }

  return <PostDetailBody flow={flow} />;
}
