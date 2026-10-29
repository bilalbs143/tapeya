import { ScreenBar } from '@/shared/layout';

import { CreatePostFormBody } from '../ui/CreatePostFormBody';
import { useCreatePost } from '../ui/useCreatePost';

/** Create post — styled background only when ≤120 chars and no media; plain omits `background_id`. */
export default function CreatePostPage() {
  const flow = useCreatePost();

  return (
    <CreatePostFormBody
      flow={flow}
      header={<ScreenBar title="Create Post" subtitle="Text or Photo" onBack={flow.goHome} />}
    />
  );
}
