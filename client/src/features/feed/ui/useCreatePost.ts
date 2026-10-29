import { type FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useMeQuery } from '@/features/auth';

import { getApiErrorMessage } from '@/shared/api/errors';
import { formatHashtagLabel, mergeCaptionWithHashtags } from '@/shared/lib/hashtags';
import { toast } from '@/shared/ui/toast';

import { useCreatePostMutation } from '../api/feedApi';
import { canUseComposeBackgrounds, resolveBackgroundIdForSubmit } from '../lib/composeBackgrounds';
import {
  createPostActiveBackground,
  createPostApiBackgroundId,
  createPostCanPublish,
  createPostCharLimit,
  type CreatePostUiBackground,
} from '../lib/createPost';
import { feedRoutes } from '../routes';

/** Caption, backgrounds, photo picks, and publish for CreatePostPage. */
export function useCreatePost() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const wantPhotos = params.get('media') === 'photo';
  const fileRef = useRef<HTMLInputElement>(null);
  const hashRef = useRef<HTMLInputElement>(null);

  const { data: me } = useMeQuery();
  const [createPost, { isLoading }] = useCreatePostMutation();

  const [body, setBody] = useState('');
  const [background, setBackground] = useState<CreatePostUiBackground>('plain');
  const [photos, setPhotos] = useState<File[]>([]);
  /** Plain posts only — same chip pattern as create reel; ignored when a frame is on. */
  const [hashtags, setHashtags] = useState('');
  const [hashEditing, setHashEditing] = useState(false);

  const hasMedia = photos.length > 0;
  const showBackgrounds = canUseComposeBackgrounds(body, hasMedia);
  const activeBackground = createPostActiveBackground(background, body, hasMedia);
  const withBg = activeBackground !== 'plain';
  const limit = createPostCharLimit(withBg);
  const over = body.length > limit;
  const canPost = createPostCanPublish(body, hasMedia, over);
  const hashLabel = hashtags ? formatHashtagLabel(hashtags) : 'Hashtags';

  const previewUrls = useMemo(() => photos.map((file) => URL.createObjectURL(file)), [photos]);

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  useEffect(() => {
    if (wantPhotos) fileRef.current?.click();
  }, [wantPhotos]);

  useEffect(() => {
    if (hashEditing) hashRef.current?.focus();
  }, [hashEditing]);

  function pickPhotos(files: FileList | null) {
    if (!files?.length) return;
    const next = [...photos, ...Array.from(files)].slice(0, 10);
    setPhotos(next);
    setBackground('plain');
  }

  function selectBackground(next: CreatePostUiBackground) {
    setBackground(next);
    if (next !== 'plain') {
      setHashtags('');
      setHashEditing(false);
    }
  }

  function removePhoto(index: number) {
    setPhotos((prev) => prev.filter((_, idx) => idx !== index));
  }

  function goHome() {
    navigate(feedRoutes.home());
  }

  function goCreateReel() {
    navigate(feedRoutes.createReel(), { state: { body, fromCompose: true } });
  }

  async function publish(e?: FormEvent) {
    e?.preventDefault();
    if (!canPost || isLoading) return;
    try {
      const apiId = createPostApiBackgroundId(activeBackground);
      const submitBody = withBg ? body.trim() : mergeCaptionWithHashtags(body, hashtags);
      const backgroundId = resolveBackgroundIdForSubmit({
        backgroundId: apiId,
        body: submitBody,
        hasMedia,
      });
      const post = hasMedia
        ? await createPost({ body: submitBody, images: photos }).unwrap()
        : await createPost({
            body: submitBody,
            backgroundId: backgroundId ?? null,
          }).unwrap();
      toast({ title: 'Post Created', tone: 'success' });
      navigate(feedRoutes.post(post.id), { replace: true });
    } catch (err) {
      toast({ title: getApiErrorMessage(err, 'Could not create post.'), tone: 'error' });
    }
  }

  return {
    me,
    fileRef,
    hashRef,
    body,
    setBody,
    background,
    setBackground: selectBackground,
    photos,
    hasMedia,
    showBackgrounds,
    activeBackground,
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
    goHome,
    goCreateReel,
    publish,
  };
}
