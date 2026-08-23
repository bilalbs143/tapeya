/**
 * Caption, hashtag helper, visibility, and Post for reel upload.
 * Page chrome matches Support: sticky AppSubpageHeader + Container inside MainLayout.
 */

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { Button } from '@/ui/Button';
import { Container } from '@/ui/Container';
import { Textarea } from '@/ui/Textarea';

const VISIBILITY_OPTIONS = [
  { value: 'public', label: 'Everyone', description: 'Anyone can view this reel' },
  { value: 'followers', label: 'Followers', description: 'Only people who follow you' },
  { value: 'private', label: 'Only Me', description: 'Only you can see this reel' },
];

export function UploadDetailsStep({
  previewUrl,
  caption,
  onCaptionChange,
  visibility,
  onVisibilityChange,
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
            {previewUrl ? (
              <video src={previewUrl} muted playsInline preload="metadata" className="h-full w-full object-cover">
                <track kind="captions" />
              </video>
            ) : null}
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

        <div className="mt-6 space-y-2">
          <p id="reel-visibility-label" className="text-muted text-xs font-medium tracking-wide uppercase">
            Who Can View
          </p>
          <div className="bg-surface overflow-hidden rounded-2xl" role="radiogroup" aria-labelledby="reel-visibility-label">
            {VISIBILITY_OPTIONS.map((option, index) => {
              const selected = visibility === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => onVisibilityChange(option.value)}
                  className={[
                    'flex w-full items-center gap-3 px-4 py-3.5 text-left active:opacity-90',
                    index > 0 ? 'border-t border-white/10' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-medium text-white">{option.label}</span>
                    <span className="text-muted block text-xs">{option.description}</span>
                  </span>
                  <span
                    className={[
                      'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2',
                      selected ? 'border-brand bg-brand' : 'border-white/30',
                    ].join(' ')}
                    aria-hidden
                  >
                    {selected ? <span className="bg-ink h-2 w-2 rounded-full" /> : null}
                  </span>
                </button>
              );
            })}
          </div>
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
