import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import TextPostBackground from '@/components/feed/TextPostBackground';
import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';
import {
  canUseComposeBackgrounds,
  COMPOSE_BACKGROUND_MAX_CHARS,
  getComposeBackground,
  resolveBackgroundIdForSubmit,
  SELECTABLE_COMPOSE_TEXT_BACKGROUNDS,
} from '@/lib/constants/composeBackgrounds';
import { useCreatePostMutation } from '@/store/api/feedApi';
import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/selectors';
import { Container } from '@/ui/Container';
import {
  Select,
  SelectContent,
  selectContentInputClass,
  SelectItem,
  selectItemInputClass,
  SelectTrigger,
  SelectValue,
  selectViewportInputClass,
} from '@/ui/Select';

const defaultAvatar = `${CLOUDFRONT_APP_BASE}/images/standard/default-avatar.png`;
const POST_BODY_MAX_CHARS = 2200;
const PLAIN_EDITOR_BACKGROUND = { className: 'bg-transparent' };
const VISIBILITY_OPTIONS = [
  { value: 'public', label: 'Public' },
  { value: 'followers', label: 'Followers' },
  { value: 'private', label: 'Private' },
];

function ImageIcon({ className = '' }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  );
}

function FilmIcon({ className = '' }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="2" y="2" width="20" height="20" rx="2.18" />
      <path d="M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 7h5M17 17h5" />
    </svg>
  );
}

function CloseIcon({ className = '' }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

/**
 * Compose sheet for text and photo posts. Reel creation lives at /reels/upload.
 */
export default function ComposePost() {
  const navigate = useNavigate();
  const user = useAppSelector(selectUser);
  const textareaRef = useRef(null);
  const imageInputRef = useRef(null);

  const [body, setBody] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [images, setImages] = useState([]); // { file, url }[]
  const [bgId, setBgId] = useState('plain');
  const [error, setError] = useState('');
  const [createPost, { isLoading }] = useCreatePostMutation();

  const avatar = user?.avatar_url || user?.avatarUrl || defaultAvatar;
  const displayName = user?.name || 'You';

  const hasMedia = images.length > 0;
  const showBackgrounds = canUseComposeBackgrounds(body, hasMedia);
  const activeBg = getComposeBackground(bgId);
  const usingBg = showBackgrounds && bgId !== 'plain';
  const editorBackground = usingBg ? activeBg : PLAIN_EDITOR_BACKGROUND;
  const bodyMaxLength = usingBg ? COMPOSE_BACKGROUND_MAX_CHARS : POST_BODY_MAX_CHARS;
  const canPost = body.trim().length > 0 || images.length > 0;

  const imagesRef = useRef(images);
  imagesRef.current = images;

  useEffect(() => {
    const t = setTimeout(() => textareaRef.current?.focus(), 120);
    return () => clearTimeout(t);
  }, []);

  // Drop styled background when media is added or caption grows past the short-text limit.
  useEffect(() => {
    if (!showBackgrounds && bgId !== 'plain') {
      setBgId('plain');
    }
  }, [showBackgrounds, bgId]);

  // Styled posts render as ordinary wrapped text in the feed. Grow the editor
  // with its content so compose mirrors that preview instead of scrolling.
  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    if (!usingBg) {
      textarea.style.height = '';
      return;
    }

    textarea.style.height = '0px';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [body, usingBg, bgId]);

  useEffect(() => {
    return () => {
      imagesRef.current.forEach((img) => URL.revokeObjectURL(img.url));
    };
  }, []);

  const clearImages = () => {
    images.forEach((img) => URL.revokeObjectURL(img.url));
    setImages([]);
  };

  const onPickImages = (e) => {
    const files = Array.from(e.target.files || []).slice(0, 10);
    e.target.value = '';
    if (!files.length) return;
    setBgId('plain');
    clearImages();
    setImages(
      files.map((file) => ({
        file,
        url: URL.createObjectURL(file),
      })),
    );
  };

  const removeImageAt = (index) => {
    setImages((prev) => {
      const next = [...prev];
      const [removed] = next.splice(index, 1);
      if (removed?.url) URL.revokeObjectURL(removed.url);
      return next;
    });
  };

  const onSubmit = async (e) => {
    e?.preventDefault?.();
    setError('');
    if (!canPost || isLoading) return;

    try {
      if (images.length > 0) {
        const payload = new FormData();
        payload.append('type', 'image');
        if (body.trim()) payload.append('body', body.trim());
        payload.append('visibility', visibility);
        images.forEach((img) => payload.append('images[]', img.file));
        const post = await createPost(payload).unwrap();
        navigate(`/feed/${post.id}`);
        return;
      }

      if (!body.trim()) {
        setError('Write something to post.');
        return;
      }
      const background_id = resolveBackgroundIdForSubmit({
        backgroundId: bgId,
        body: body.trim(),
        hasMedia: false,
      });
      const post = await createPost({
        type: 'text',
        body: body.trim(),
        visibility,
        ...(background_id ? { background_id } : {}),
      }).unwrap();
      navigate(`/feed/${post.id}`);
    } catch (err) {
      const msg =
        err?.data?.message ||
        err?.data?.errors?.body?.[0] ||
        err?.data?.errors?.images?.[0] ||
        err?.data?.errors?.['images.0']?.[0] ||
        'Could not create post.';
      setError(msg);
    }
  };

  const postLabel = isLoading ? 'Posting…' : 'Post';

  const headerPost = (
    <button
      type="button"
      onClick={onSubmit}
      disabled={!canPost || isLoading}
      className={`flex h-9 shrink-0 items-center rounded-full px-4 text-[13px] font-bold transition-all ${
        canPost && !isLoading ? 'bg-brand text-ink active:scale-95' : 'bg-surface-raised text-muted cursor-not-allowed'
      }`}
    >
      {postLabel}
    </button>
  );

  return (
    <div className="bg-black text-white">
      <AppSubpageHeader sticky title="Create post" titleClassName="normal-case" right={headerPost} />

      <Container className="pb-8">
        <form onSubmit={onSubmit}>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-[linear-gradient(135deg,var(--color-brand),var(--color-brand-dark))] p-[2px]">
              <img src={avatar} alt="" className="border-page h-11 w-11 rounded-full border-2 object-cover" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[15px] font-bold text-white">{displayName}</p>
              <div className="mt-1">
                <Select value={visibility} onValueChange={setVisibility}>
                  <SelectTrigger
                    aria-label="Post privacy"
                    className="bg-surface-raised! text-muted! focus:ring-brand/50! [&>span]:text-muted! [&_svg]:text-muted! h-7! w-auto! min-w-24 rounded-md! border-0! px-2! py-0.5! text-[12px]! font-semibold! [&>span]:text-[12px]!"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    className={selectContentInputClass}
                    viewportClassName={selectViewportInputClass}
                    position="popper"
                    sideOffset={6}
                  >
                    {VISIBILITY_OPTIONS.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        className={`${selectItemInputClass} py-2! text-[13px]!`}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="border-border bg-surface mt-4 flex items-center justify-between rounded-2xl border px-4 py-2.5">
            <span className="text-muted text-[13px] font-semibold">Add to your post</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                aria-label="Add photo"
                className="text-brand hover:bg-surface-raised grid h-9 w-9 place-items-center rounded-full transition-colors"
              >
                <ImageIcon />
              </button>
              <button
                type="button"
                onClick={() =>
                  navigate('/reels/upload', {
                    state: {
                      caption: body,
                      visibility,
                      fromCompose: true,
                    },
                  })
                }
                aria-label="Add reel"
                className="text-brand-hover hover:bg-surface-raised grid h-9 w-9 place-items-center rounded-full transition-colors"
              >
                <FilmIcon />
              </button>
            </div>
          </div>

          <div className="pt-4">
            <TextPostBackground
              background={editorBackground}
              className={`h-56 ${usingBg ? '' : 'ring-0!'}`}
              contentClassName={`flex h-full flex-col justify-center ${usingBg ? '' : '!px-0 !py-0 sm:!px-0 sm:!py-0'}`}
            >
              <textarea
                ref={textareaRef}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={usingBg ? 'What’s the update?' : 'Share your cricket moment…'}
                maxLength={bodyMaxLength}
                rows={1}
                className={`mx-auto block w-full resize-none bg-transparent outline-none ${
                  usingBg
                    ? `overflow-hidden placeholder:opacity-70 ${activeBg.textClassName}`
                    : 'placeholder:text-muted/47 bg-surface! min-h-[144px] flex-1 overflow-y-auto rounded-[6px] px-4 py-3 text-left text-base text-white transition-colors placeholder:text-base focus:ring-2 focus:ring-[#FF9700]/50'
                }`}
              />
              {usingBg && (
                <p className="pointer-events-none absolute right-3 bottom-2 text-[10px] font-medium text-current opacity-55">
                  {body.length}/{COMPOSE_BACKGROUND_MAX_CHARS}
                </p>
              )}
            </TextPostBackground>
          </div>

          {images.length > 0 && (
            <div className="mt-3 space-y-2">
              {images.map((img, index) => (
                <div key={img.url} className="border-border relative overflow-hidden rounded-2xl border bg-black">
                  <img src={img.url} alt="" className="max-h-96 w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImageAt(index)}
                    aria-label="Remove photo"
                    className="absolute top-3 right-3 grid h-8 w-8 place-items-center rounded-full bg-black/60 text-white backdrop-blur-sm"
                  >
                    <CloseIcon />
                  </button>
                </div>
              ))}
            </div>
          )}

          {showBackgrounds && (
            <div className="px-2 pt-4 pb-1">
              <div className="mx-auto grid w-full max-w-[376px] grid-cols-8 gap-1.5">
                {SELECTABLE_COMPOSE_TEXT_BACKGROUNDS.map((b) => {
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setBgId(b.id)}
                      aria-label={`${b.label} background`}
                      aria-pressed={bgId === b.id}
                      title={b.label}
                      className={`focus-visible:border-brand relative aspect-square w-full max-w-10 min-w-0 justify-self-center overflow-hidden rounded-xl border-2 transition-all focus-visible:outline-none ${
                        b.id === 'plain' ? 'bg-surface-raised grid place-items-center' : b.className
                      } ${bgId === b.id ? 'border-brand' : 'border-transparent'}`}
                    >
                      {b.id === 'plain' && <span className="text-muted text-[10px] font-bold">Aa</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {error && <p className="mt-3 text-[13px] text-red-400">{error}</p>}

          <input ref={imageInputRef} type="file" accept="image/*" multiple hidden onChange={onPickImages} />
        </form>
      </Container>
    </div>
  );
}
