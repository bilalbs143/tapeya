import { type ReactNode } from 'react';

import { UserIdentity, userProfilePath } from '@/entities/user';

import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { FieldLabel } from '@/shared/ui/Field';
import { Form } from '@/shared/ui/Form';
import { ChevronRightIcon, PhotoIcon, VideoIcon } from '@/shared/ui/icons';
import { Textarea } from '@/shared/ui/Input';
import { StickyActionBar } from '@/shared/ui/StickyActionBar';

import { COMPOSE_BACKGROUND_MAX_CHARS } from '../lib/composeBackgrounds';
import type { CreatePostUiBackground } from '../lib/createPost';
import type { useCreatePost } from './useCreatePost';

type CreatePostFlow = ReturnType<typeof useCreatePost>;

type CreatePostFormBodyProps = {
  flow: CreatePostFlow;
};

const BACKGROUNDS: {
  value: CreatePostUiBackground;
  label: ReactNode;
  klass: string;
}[] = [
  {
    value: 'none',
    label: 'Plain',
    klass: 'bg-surface border-border-subtle border text-body',
  },
  {
    value: 'turf',
    label: 'Turf',
    klass: 'bg-post-turf text-white',
  },
  {
    value: 'floodlit',
    label: (
      <>
        Flood
        <br />
        lit
      </>
    ),
    klass: 'bg-post-floodlit text-white',
  },
];

function MediaDoor({
  icon,
  iconClass,
  title,
  note,
  onClick,
}: {
  icon: ReactNode;
  iconClass: string;
  title: string;
  note: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="border-border-subtle bg-surface hover:border-border flex min-h-[54px] w-full items-center gap-2.5 rounded-field border px-3.5 text-left transition-colors"
    >
      <span className={cn('grid h-[34px] w-[34px] shrink-0 place-items-center rounded-icon', iconClass)}>{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="text-ink block text-2xs font-bold">{title}</span>
        <span className="text-muted mt-px block text-3xs">{note}</span>
      </span>
      <ChevronRightIcon size="xs" className="text-dim shrink-0" />
    </button>
  );
}

/** Caption, media doors, backgrounds, sticky Post — under ScreenBar. */
export function CreatePostFormBody({ flow }: CreatePostFormBodyProps) {
  const {
    me,
    fileRef,
    body,
    setBody,
    background,
    setBackground,
    photos,
    showBackgrounds,
    withBg,
    limit,
    over,
    canPost,
    isLoading,
    previewUrls,
    pickPhotos,
    removePhoto,
    goCreateReel,
    publish,
  } = flow;

  const bgClass = BACKGROUNDS.find((b) => b.value === flow.activeBackground)?.klass ?? '';

  return (
    <>
      <Form
        id="create-post-form"
        density="compact"
        data-scroll-to-top
        className="min-h-0 flex-1 overflow-y-auto px-4 pt-3.5 pb-4"
        onSubmit={(e) => void publish(e)}
      >
        {me ? (
          <UserIdentity
            className="items-center"
            user={{
              name: me.name ?? 'You',
              avatarUrl: me.avatarUrl,
              isOfficial: me.isOfficial,
            }}
            to={userProfilePath({ id: me.id, nickname: me.nickname })}
            avatarSize="md"
          />
        ) : null}

        <div>
          <div
            className={cn(
              'overflow-hidden rounded-card',
              withBg && cn(bgClass, 'flex min-h-[190px] items-center justify-center p-5')
            )}
          >
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={withBg ? "What's the update?" : 'Share Your Cricket Moment…'}
              maxLength={limit + 40}
              aria-label="Post Caption"
              className={cn(
                'placeholder:text-dim w-full resize-none border-0 bg-transparent p-0 text-body-lg shadow-none',
                withBg
                  ? 'min-h-[150px] text-center text-title font-extrabold text-white placeholder:text-white/55'
                  : 'text-ink min-h-[88px]'
              )}
            />
          </div>
          <div className="mt-1.5 flex items-center">
            <span
              className={cn(
                'font-mono ml-auto text-3xs font-semibold tabular-nums',
                over ? 'text-danger-soft' : 'text-dim'
              )}
            >
              {body.length} / {limit}
            </span>
          </div>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            pickPhotos(e.target.files);
            e.target.value = '';
          }}
        />

        {withBg ? (
          <p className="border-border-subtle bg-page-deep text-muted rounded-panel border p-2.5 text-3xs leading-snug">
            Add photo and Add reel disappear while a background is on — a background post is text only, so offering
            media would be a dead end.
          </p>
        ) : (
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Add to Your Post</FieldLabel>
            <MediaDoor
              icon={<PhotoIcon className="h-4 w-4" strokeWidth={1.9} />}
              iconClass="bg-positive/14 text-positive"
              title="Add Photo"
              note={photos.length ? `${photos.length} of 10 selected` : 'Up to 10 photos'}
              onClick={() => fileRef.current?.click()}
            />
            <MediaDoor
              icon={<VideoIcon className="h-4 w-4" strokeWidth={1.8} />}
              iconClass="bg-brand/14 text-brand-text"
              title="Add Reel"
              note="Video goes to the reel uploader"
              onClick={goCreateReel}
            />
          </div>
        )}

        {photos.length > 0 ? (
          <ul className="grid grid-cols-3 gap-1.5">
            {previewUrls.map((src, i) => (
              <li key={src} className="relative aspect-square overflow-hidden rounded-field">
                <img src={src} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  aria-label="Remove Photo"
                  className="bg-veil-scrim absolute top-1 right-1 grid h-6 w-6 place-items-center rounded-full text-2xs font-bold text-white"
                  onClick={() => removePhoto(i)}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        {showBackgrounds ? (
          <div className="flex flex-col gap-1.5">
            <FieldLabel>
              Background{' '}
              <span className="font-normal tracking-normal normal-case">
                — plain is text only; styled max {COMPOSE_BACKGROUND_MAX_CHARS} chars
              </span>
            </FieldLabel>
            <div className="flex gap-2">
              {BACKGROUNDS.map((opt) => {
                const on = background === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setBackground(opt.value)}
                    className={cn(
                      'grid h-14 w-14 shrink-0 place-items-center rounded-field text-4xs leading-tight font-bold',
                      opt.klass,
                      on ? 'ring-brand ring-offset-page ring-2 ring-offset-1' : null
                    )}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </Form>

      <StickyActionBar edge>
        <Button
          type="submit"
          form="create-post-form"
          size="lg"
          className="min-h-12 w-full"
          disabled={!canPost}
          loading={isLoading}
        >
          Post
        </Button>
      </StickyActionBar>
    </>
  );
}
