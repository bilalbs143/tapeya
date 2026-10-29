import { type ReactNode } from 'react';

import { UserIdentity, userProfilePath } from '@/entities/user';

import { PageDock } from '@/shared/layout';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { FieldLabel } from '@/shared/ui/Field';
import { Form } from '@/shared/ui/Form';
import { HashtagChipField } from '@/shared/ui/HashtagChipField';
import { ChevronRightIcon, PhotoIcon, VideoIcon } from '@/shared/ui/icons';
import { Textarea } from '@/shared/ui/Input';
import { StickyActionBar } from '@/shared/ui/StickyActionBar';

import {
  COMPOSE_BACKGROUND_MAX_CHARS,
  getComposeBackground,
  SELECTABLE_COMPOSE_TEXT_BACKGROUNDS,
} from '../lib/composeBackgrounds';
import { TextPostBackground } from './TextPostBackground';
import type { useCreatePost } from './useCreatePost';

type CreatePostFlow = ReturnType<typeof useCreatePost>;

type CreatePostFormBodyProps = {
  flow: CreatePostFlow;
  header: ReactNode;
};

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
export function CreatePostFormBody({ flow, header }: CreatePostFormBodyProps) {
  const {
    me,
    fileRef,
    hashRef,
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
    hashtags,
    setHashtags,
    hashEditing,
    setHashEditing,
    hashLabel,
    pickPhotos,
    removePhoto,
    goCreateReel,
    publish,
  } = flow;

  const activeBg = getComposeBackground(flow.activeBackground);

  return (
    <>
      <PageDock
        header={header}
        footer={
          <StickyActionBar edge>
            <Button type="submit" form="create-post-form" className="w-full" disabled={!canPost} loading={isLoading}>
              Post
            </Button>
          </StickyActionBar>
        }
      >
        <Form
          id="create-post-form"
          density="compact"
          className="flex flex-col px-4 pt-3.5 pb-4"
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
              meta={me.nickname?.trim() ? <p className="text-muted truncate text-3xs">@{me.nickname.trim()}</p> : null}
            />
          ) : null}

          {withBg ? (
            <div>
              <TextPostBackground
                background={activeBg}
                className="min-h-[200px]"
                contentClassName="flex min-h-[200px] items-center justify-center p-5"
              >
                <Textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="What's the update?"
                  aria-label="Post Caption"
                  className={cn(
                    'placeholder:opacity-55 min-h-[150px] w-full resize-none border-0 bg-transparent p-0 shadow-none',
                    activeBg.textClass,
                    activeBg.id === 'gold' ? 'placeholder:text-[#080807]/55' : 'placeholder:text-white/55'
                  )}
                />
              </TextPostBackground>
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
          ) : (
            <div className="flex flex-col gap-2">
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value.slice(0, limit))}
                placeholder="Share your cricket moment…"
                rows={3}
                aria-label="Post Caption"
                className="text-body min-h-[99px] text-2xs leading-snug"
              />
              <div className="flex items-center">
                <HashtagChipField
                  value={hashtags}
                  onChange={setHashtags}
                  editing={hashEditing}
                  onEditingChange={setHashEditing}
                  inputRef={hashRef}
                  label={hashLabel}
                />
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
          )}

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
              <div className="grid grid-cols-8 gap-1.5">
                {SELECTABLE_COMPOSE_TEXT_BACKGROUNDS.map((opt) => {
                  const on = background === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      aria-label={`${opt.label} background`}
                      aria-pressed={on}
                      title={opt.label}
                      onClick={() => setBackground(opt.id)}
                      className={cn(
                        'relative aspect-square w-full overflow-hidden rounded-field border-2 transition-colors',
                        opt.id === 'plain'
                          ? 'bg-surface-raised text-muted grid place-items-center text-4xs font-bold'
                          : opt.surfaceClass,
                        on ? 'border-brand' : 'border-transparent'
                      )}
                    >
                      {opt.id === 'plain' ? 'Aa' : null}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </Form>
      </PageDock>
    </>
  );
}
