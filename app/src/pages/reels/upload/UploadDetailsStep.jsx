/**
 * Caption, hashtag helper, and Post for reel upload.
 */

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { ReelLocalPreviewThumb } from '@/components/reels/ReelLocalPreviewThumb';
import { Button } from '@/ui/Button';
import { Container } from '@/ui/Container';
import { Textarea } from '@/ui/Textarea';

export function UploadDetailsStep({
  posterUrl = null,
  caption,
  onCaptionChange,
  onInsertHashtag,
  onBack,
  onPost,
  isPublishing,
  error,
}) {
  return (
    <div className="bg-black">
      <AppSubpageHeader
        sticky
        title="New Reel"
        onBack={onBack}
        backAriaLabel="Back to preview"
        backClassName={isPublishing ? 'pointer-events-none opacity-40' : ''}
      />

      <Container className={`pb-8 ${isPublishing ? 'pointer-events-none opacity-50 select-none' : ''}`}>
        <div className="flex gap-3">
          <Textarea
            id="reel-caption"
            value={caption}
            onChange={(e) => onCaptionChange(e.target.value)}
            placeholder="Add Description…"
            rows={4}
            maxLength={2200}
            className="min-h-[96px] flex-1 resize-none bg-transparent! px-0! py-0! text-[15px] focus:ring-0!"
          />
          <div className="bg-surface relative h-[120px] w-[84px] shrink-0 overflow-hidden rounded-xl">
            <ReelLocalPreviewThumb posterUrl={posterUrl} />
            <span className="absolute inset-x-0 top-0 bg-black/45 py-0.5 text-center text-[10px] font-medium text-white">
              Preview
            </span>
          </div>
        </div>

        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={onInsertHashtag}
            className="bg-surface rounded-full border border-white/15 px-3.5 py-1.5 text-sm font-medium text-white active:opacity-80"
          >
            # Hashtags
          </button>
        </div>

        {error ? (
          <p className="mt-4 text-sm text-red-400" role="alert">
            {error}
          </p>
        ) : null}

        <div className="mt-8">
          <Button
            type="button"
            variant="orange"
            disabled={isPublishing}
            loading={isPublishing}
            onClick={onPost}
            className="w-full! rounded-full!"
          >
            {isPublishing ? 'Posting…' : 'Post'}
          </Button>
        </div>
      </Container>
    </div>
  );
}
