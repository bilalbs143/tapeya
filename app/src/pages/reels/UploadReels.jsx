/**
 * UploadReels
 *
 * Reel upload flow: back, preview, caption, publish. Route: /reels/upload
 *
 * Coding guidelines: docs/Coding guidelines.md (§2 selectors, useAppDispatch)
 */

import { useCallback, useRef, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/selectors';
import { addReel } from '@/store/slices/reelsSlice';
import { Avatar, AvatarFallback, AvatarImage } from '@/ui/Avatar';
import { Button } from '@/ui/Button';
import { Container } from '@/ui/Container';


const editReelIcon = `${CLOUDFRONT_APP_BASE}/images/icons/edit-reel.svg`;
const playIcon = `${CLOUDFRONT_APP_BASE}/images/icons/play-icon.svg`;
const reelCameraIcon = `${CLOUDFRONT_APP_BASE}/images/icons/reel-camera-icon.svg`;

const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=96&h=96&fit=crop';
const UPLOAD_REEL_TAB = 'my-videos';

function CloseIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#fff"
      strokeWidth="2.5"
      aria-hidden
    >
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function UploadReels() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const fileInputRef = useRef(null);

  const [caption, setCaption] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const videoPreviewRef = useRef(null);

  const displayName = user?.name ?? user?.username ?? 'Oneeb Arif';
  const displayHandle = user?.username ? `@${user.username}` : '@oneeb';
  const avatarUrl = user?.avatar ?? user?.profileImage ?? DEFAULT_AVATAR;

  const clearVideo = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
  }, [previewUrl]);

  const handleFileChange = useCallback(
    (e) => {
      const file = e.target?.files?.[0];
      if (!file || !file.type.startsWith('video/')) return;
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      e.target.value = '';
    },
    [previewUrl],
  );

  const handleDelete = useCallback(() => {
    clearVideo();
  }, [clearVideo]);

  const handlePublish = useCallback(async () => {
    if (!selectedFile) return;
    setIsPublishing(true);
    try {
      const dataUrl = await fileToDataUrl(selectedFile);
      const id = `published-${Date.now()}`;
      dispatch(
        addReel({
          id,
          caption: caption.trim() || 'No caption',
          videoUrl: dataUrl,
          username: displayName,
          handle: displayHandle,
          likes: 0,
        }),
      );
      clearVideo();
      setCaption('');
      navigate('/reels', { state: { tab: UPLOAD_REEL_TAB } });
    } finally {
      setIsPublishing(false);
    }
  }, [
    selectedFile,
    caption,
    displayName,
    displayHandle,
    dispatch,
    navigate,
    clearVideo,
  ]);

  return (
    <div className="bg-black">
      <Container className="!px-4 !py-0">
        {/* Header: back + title */}
        <AppSubpageHeader
          title="Upload Reel"
          className="-mx-4 -mt-6 justify-between gap-0 lg:mt-0"
          backAriaLabel="Go back"
          trailing={<div className="w-[27px] shrink-0" aria-hidden />}
        />

        {/* User row */}
        <div className="mb-4 flex items-center gap-3">
          <Avatar className="h-12 w-12 shrink-0">
            <AvatarImage src={avatarUrl} alt="" />
            <AvatarFallback className="bg-[#141412] text-white">
              {displayName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-[15px] font-medium text-white">
            {displayName}
          </span>
        </div>

        {/* Card: caption + video preview */}
        <div className="rounded-[17px] bg-[#141412] p-4">
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="What do you want to talk about?"
            rows={3}
            className="mb-4 w-full resize-none rounded-lg border-0 bg-transparent text-[15px] text-white placeholder:text-[#A2A6AB] focus:ring-0 focus:outline-none"
          />
          <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
            {previewUrl ? (
              <>
                <video
                  ref={videoPreviewRef}
                  src={previewUrl}
                  playsInline
                  preload="metadata"
                  className="h-full w-full object-contain"
                >
                  <track kind="captions" />
                </video>
                <button
                  type="button"
                  onClick={() => videoPreviewRef.current?.play()}
                  className="absolute top-1/2 left-1/2 flex h-[30px] w-[30px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow"
                  aria-label="Play"
                >
                  <img
                    src={playIcon}
                    alt=""
                    className="h-3 w-3 object-contain"
                    aria-hidden
                  />
                </button>
                <div className="absolute top-2 right-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex h-[25px] w-[25px] items-center justify-center rounded-full bg-white"
                    aria-label="Change video"
                  >
                    <img
                      src={editReelIcon}
                      alt=""
                      className="h-3.5 w-3.5 shrink-0"
                      aria-hidden
                    />
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="flex h-[25px] w-[25px] items-center justify-center rounded-full bg-[#FF2424]"
                    aria-label="Remove video"
                  >
                    <CloseIcon />
                  </button>
                </div>
              </>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-full w-full flex-col items-center justify-center gap-2 text-[#A2A6AB]"
              >
                <img
                  src={reelCameraIcon}
                  alt=""
                  className="h-8 w-8 shrink-0 opacity-80 brightness-0 invert"
                  aria-hidden
                />
                <span className="text-sm">Select video</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              className="hidden"
              aria-hidden
            />
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-center gap-4 lg:my-5 lg:justify-start">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex h-[37px] w-[37px] shrink-0 items-center justify-center rounded-full bg-white"
            aria-label="Add or change video"
          >
            <img
              src={reelCameraIcon}
              alt=""
              className="h-5 w-5 shrink-0 object-contain"
              aria-hidden
            />
          </button>
          <Button
            type="button"
            onClick={handlePublish}
            disabled={!selectedFile || isPublishing}
            variant="auth"
            className="!w-auto min-w-[160px]"
          >
            {isPublishing ? 'Publishing…' : 'Publish Now'}
          </Button>
        </div>
      </Container>
    </div>
  );
}
