/**
 * Live broadcast player — portrait or 90° landscape inside the parent player zone.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { CommentInputRow } from '@/features/stream/CommentInputRow';
import CommentList from '@/features/stream/CommentList';
import { FloatingHeartsOverlay } from '@/features/stream/FloatingHeartsOverlay';
import { useFloatingHearts } from '@/features/stream/hooks/useFloatingHearts';
import { useStreamComments } from '@/features/stream/hooks/useStreamComments';
import { IosLandscapeStreamChrome } from '@/features/stream/ios/IosLandscapeStreamChrome';
import { streamUsesIosNativeYoutubePlayer } from '@/features/stream/ios/streamUsesIosNativeYoutubePlayer';
import { StreamPlayer } from '@/features/stream/StreamPlayer';
import { useToast } from '@/hooks/useToast';
import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';
import {
  LIVE_BROADCAST_CONTROLS_OVERLAY_Z,
  LIVE_BROADCAST_HEADER_OVERLAY_Z,
  LIVE_BROADCAST_HEADER_SCRIM,
  LIVE_BROADCAST_HEADER_TOP_PADDING,
  LIVE_BROADCAST_IMMERSIVE_TOGGLE_Z,
  LIVE_BROADCAST_LANDSCAPE_HEADER_ROW,
} from '@/lib/constants/liveBroadcastLayout';
import { getInitials } from '@/lib/utils/displayUtils';
import { mapSystemSettingsByKey } from '@/lib/utils/settingsUtils';
import { useSendLiveCommentMutation, useSendLiveHeartMutation } from '@/store/api/liveApi';
import { useGetPublicSystemSettingsQuery } from '@/store/api/systemSettingsApi';
import { useAppSelector } from '@/store/hooks';

import LandscapeRotatedStage from './LandscapeRotatedStage';

const maxMinIcon = `${CLOUDFRONT_APP_BASE}/images/icons/max-min-icon.svg`;
const commentIcon = `${CLOUDFRONT_APP_BASE}/images/icons/comment-icon.svg`;

const BOTTOM_OVERLAY = 'pointer-events-none absolute right-0 bottom-[12px] left-0 px-4 pb-2';

const TOGGLE_BTN =
  'flex h-9 w-9 shrink-0 touch-manipulation items-center justify-center rounded-full bg-white/[0.13] backdrop-blur-[9.7px] transition-opacity active:opacity-80';

function LandscapeExitToggle({ onClick }) {
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="pointer-events-none fixed right-0 bottom-0 p-4 pb-[calc(env(safe-area-inset-bottom)+12px)]"
      style={{ zIndex: LIVE_BROADCAST_IMMERSIVE_TOGGLE_Z }}
    >
      <button
        type="button"
        onClick={onClick}
        className={`pointer-events-auto touch-manipulation ${TOGGLE_BTN}`}
        aria-label="Rotate to portrait"
      >
        <img src={maxMinIcon} alt="" className="h-5 w-5 shrink-0 object-contain" aria-hidden />
      </button>
    </div>,
    document.body,
  );
}

// ---------------------------------------------------------------------------
// BroadcastFloatingToggles
// ---------------------------------------------------------------------------

function BroadcastFloatingToggles({ className = '', isLandscape, onToggleLayout, bottomPanelVisible, onToggleBottomPanel }) {
  return (
    <div className={`flex shrink-0 items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={onToggleBottomPanel}
        className={`${TOGGLE_BTN} ${bottomPanelVisible ? '' : 'ring-1 ring-white/25'}`}
        aria-label={bottomPanelVisible ? 'Hide match info and comments' : 'Show match info and comments'}
        aria-pressed={bottomPanelVisible}
      >
        <img
          src={commentIcon}
          alt=""
          className={`h-5 w-5 shrink-0 object-contain ${bottomPanelVisible ? 'opacity-100' : 'opacity-45'}`}
          aria-hidden
        />
      </button>
      <button
        type="button"
        onClick={onToggleLayout}
        className={TOGGLE_BTN}
        aria-label={isLandscape ? 'Rotate to portrait' : 'Rotate to landscape'}
      >
        <img src={maxMinIcon} alt="" className="h-5 w-5 shrink-0 object-contain" aria-hidden />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// BroadcastBottomPanel
// ---------------------------------------------------------------------------

function BroadcastBottomPanel({
  messages,
  chatEnabled,
  streamStatus,
  inputDisabled,
  onSend,
  onSendHeart,
  isLandscape,
  onToggleLayout,
  bottomPanelVisible,
  onToggleBottomPanel,
  hideFloatingToggles = false,
}) {
  const showChat = bottomPanelVisible || hideFloatingToggles;

  return (
    <div className={`flex w-full flex-col gap-2 ${isLandscape ? '' : 'relative'}`}>
      {showChat && chatEnabled && <CommentList messages={messages} isLandscape={isLandscape} />}

      {streamStatus === 'ended' && showChat && (
        <div className="min-w-0 px-1">
          <p className="mt-1 text-[11px] text-white/60 drop-shadow">Stream has ended</p>
        </div>
      )}

      {!hideFloatingToggles && (
        <div className={`flex gap-2 ${bottomPanelVisible ? 'items-start' : 'items-center justify-end'}`}>
          <BroadcastFloatingToggles
            className={bottomPanelVisible ? 'ml-auto shrink-0' : ''}
            isLandscape={isLandscape}
            onToggleLayout={onToggleLayout}
            bottomPanelVisible={bottomPanelVisible}
            onToggleBottomPanel={onToggleBottomPanel}
          />
        </div>
      )}

      {showChat && chatEnabled && <CommentInputRow onSend={onSend} onSendHeart={onSendHeart} disabled={inputDisabled} />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// BroadcastViewport — video, hearts, and comments share one rotated box
// ---------------------------------------------------------------------------

const GRADIENT_VISIBLE = 'bg-gradient-to-t from-black/80 via-black/10 to-transparent';
const GRADIENT_HIDDEN = 'bg-gradient-to-t from-black/25 to-transparent';

function BroadcastViewport({
  stream,
  posterUrl = null,
  bottomPanel,
  bottomPanelVisible,
  isLandscape,
  floatingHearts,
  onHeartEnd,
  headerSlot,
  isDesktop,
  immersiveLandscape = false,
  isIosNativeLandscape = false,
  hideHeaderOverlay = false,
  /** Self-serve mobile: fill the shell. Match-linked: 16:9 aspect-video in portrait. */
  fillPortrait = false,
}) {
  // Landscape / desktop / self-serve portrait: fill the shell.
  // Match portrait: aspect-video (16:9) — tournament streams are landscape-encoded.
  // Landscape: block iframe touches so the portaled exit toggle stays tappable.
  const blockLandscapeVideoPointer = !isDesktop && isLandscape;
  const blockLandscapeVideoClass = blockLandscapeVideoPointer ? 'pointer-events-none [&_iframe]:pointer-events-none' : '';
  const fillVideo = isDesktop || isLandscape || fillPortrait;
  const videoLayer = fillVideo ? (
    <div className={`absolute inset-0 ${blockLandscapeVideoClass}`}>
      <StreamPlayer stream={stream} posterUrl={posterUrl} className="h-full w-full" fill isLandscape={isLandscape} />
    </div>
  ) : (
    <div className="absolute inset-0 flex items-start justify-center">
      <StreamPlayer stream={stream} posterUrl={posterUrl} className="max-h-full w-full" fill={false} isLandscape={false} />
    </div>
  );

  // Match classic portrait sits under the solid app navbar — no extra navbar clearance.
  // Self-serve hero mode sits under a *transparent* app navbar, so its own back/status row
  // still needs to clear the navbar's height, not just the safe area. Landscape owns the top
  // safe area itself (no app navbar there at all).
  const headerTopPadding = isLandscape && !isDesktop ? '8px' : fillPortrait ? LIVE_BROADCAST_HEADER_TOP_PADDING : '10px';

  return (
    <div className={`relative size-full overflow-hidden ${isIosNativeLandscape ? 'bg-transparent' : 'bg-black'}`}>
      {videoLayer}

      {!isDesktop && !immersiveLandscape && (
        <FloatingHeartsOverlay hearts={floatingHearts} onHeartEnd={onHeartEnd} isLandscape={isLandscape} />
      )}

      {!isDesktop && !immersiveLandscape && (
        <div className={`pointer-events-none absolute inset-0 ${bottomPanelVisible ? GRADIENT_VISIBLE : GRADIENT_HIDDEN}`} />
      )}

      {headerSlot && !hideHeaderOverlay && (
        <div
          className={isLandscape ? LIVE_BROADCAST_LANDSCAPE_HEADER_ROW : LIVE_BROADCAST_HEADER_SCRIM}
          style={{ zIndex: LIVE_BROADCAST_HEADER_OVERLAY_Z }}
        >
          <div
            className={`pointer-events-none relative flex items-center ${isLandscape && !isDesktop ? 'justify-center' : 'justify-between'}`}
            style={{ paddingTop: headerTopPadding }}
          >
            {headerSlot}
          </div>
        </div>
      )}

      {!isDesktop && !isLandscape && (
        <div className={BOTTOM_OVERLAY} style={{ zIndex: LIVE_BROADCAST_CONTROLS_OVERLAY_Z }}>
          <div className="pointer-events-auto">{bottomPanel}</div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function LiveBroadcastItem({
  broadcast,
  isLandscape,
  isDesktop = false,
  isMobileLandscape = false,
  onToggleLandscape,
  headerSlot = null,
  /** LIVE + viewer badges only — used by iOS landscape chrome (no back button / spacers). */
  statusHeaderSlot = null,
  /** Self-serve mobile portrait — fill shell instead of 16:9. */
  fillPortrait = false,
  /** Self-serve go-live watch — no comment/landscape toggles; comments always visible. */
  selfServeChrome = false,
}) {
  const toast = useToast();
  const myUserId = useAppSelector((s) => s.auth?.user?.id ?? null);
  const myAvatar = useAppSelector((s) => s.auth?.user?.avatar_url ?? s.auth?.user?.avatar ?? null);
  const myInitials = useAppSelector((s) => getInitials(s.auth?.user?.name, s.auth?.user?.nickname));
  const [bottomPanelVisible, setBottomPanelVisible] = useState(true);
  const [sendCooldown, setSendCooldown] = useState(false);
  const cooldownTimerRef = useRef(null);
  const { hearts: floatingHearts, spawnBurst, removeHeart, clearHearts } = useFloatingHearts();

  const streamId = broadcast?.id ?? null;
  const streamStatus = broadcast?.stream?.status;
  const streamChatActive = streamStatus === 'live' || streamStatus === 'starting';

  const { data: settingsRows } = useGetPublicSystemSettingsQuery();
  const settingsByKey = useMemo(() => mapSystemSettingsByKey(settingsRows), [settingsRows]);
  const liveChatGloballyEnabled = settingsByKey.live_chat_enabled !== '0';

  const chatEnabled = liveChatGloballyEnabled && streamChatActive;
  const handleRemoteHeart = useCallback(
    (payload) => {
      if (isMobileLandscape) return;
      if (payload?.user_id != null && myUserId != null && Number(payload.user_id) === Number(myUserId)) {
        return;
      }
      spawnBurst(payload?.avatar_url ?? null, payload?.initials ?? '?');
    },
    [spawnBurst, isMobileLandscape, myUserId],
  );
  const { messages } = useStreamComments(streamId, chatEnabled, handleRemoteHeart);
  const [sendComment, { isLoading: isSending }] = useSendLiveCommentMutation();
  const [sendHeart] = useSendLiveHeartMutation();

  useEffect(() => {
    clearHearts();
  }, [isLandscape, isMobileLandscape, clearHearts]);

  useEffect(
    () => () => {
      if (cooldownTimerRef.current) {
        window.clearTimeout(cooldownTimerRef.current);
      }
    },
    [],
  );

  const handleSendHeart = useCallback(() => {
    if (!streamId || !chatEnabled) return;
    spawnBurst(myAvatar, myInitials);
    sendHeart({ streamId });
  }, [spawnBurst, myAvatar, myInitials, streamId, chatEnabled, sendHeart]);

  const handleSend = useCallback(
    async (text) => {
      const body = text.trim();
      if (!body || !streamId || !chatEnabled || isSending || sendCooldown) {
        return;
      }

      setSendCooldown(true);
      cooldownTimerRef.current = window.setTimeout(() => {
        setSendCooldown(false);
      }, 2000);

      try {
        await sendComment({ streamId, body }).unwrap();
      } catch (err) {
        const type = err?.data?.type;
        if (type === 'TOO_MANY_REQUESTS') {
          toast.error('Slow down a little');
        }
      }
    },
    [streamId, chatEnabled, isSending, sendCooldown, sendComment, toast],
  );

  const toggleBottomPanel = useCallback(() => setBottomPanelVisible((v) => !v), []);

  const stream = broadcast?.stream ?? null;
  const posterUrl = broadcast?.thumbnail_url?.trim() || null;
  const inputDisabled = isSending || sendCooldown;
  const isIosNativeLandscape = streamUsesIosNativeYoutubePlayer(stream) && isLandscape;

  const bottomPanel = (
    <BroadcastBottomPanel
      messages={messages}
      chatEnabled={chatEnabled}
      streamStatus={streamStatus}
      inputDisabled={inputDisabled}
      onSend={handleSend}
      onSendHeart={handleSendHeart}
      isLandscape={isLandscape}
      onToggleLayout={onToggleLandscape}
      bottomPanelVisible={selfServeChrome ? true : bottomPanelVisible}
      onToggleBottomPanel={toggleBottomPanel}
      hideFloatingToggles={selfServeChrome}
    />
  );

  const viewport = (
    <BroadcastViewport
      stream={stream}
      posterUrl={posterUrl}
      bottomPanel={bottomPanel}
      bottomPanelVisible={selfServeChrome ? true : bottomPanelVisible}
      isLandscape={isLandscape}
      floatingHearts={floatingHearts}
      onHeartEnd={removeHeart}
      headerSlot={isMobileLandscape && !isIosNativeLandscape ? (statusHeaderSlot ?? headerSlot) : headerSlot}
      isDesktop={isDesktop}
      immersiveLandscape={isMobileLandscape}
      isIosNativeLandscape={isIosNativeLandscape}
      hideHeaderOverlay={isIosNativeLandscape && isMobileLandscape}
      fillPortrait={fillPortrait}
    />
  );

  const showFixedLandscapeToggle = !selfServeChrome && isLandscape && !isDesktop && !isIosNativeLandscape;

  return (
    <div className={`relative h-full w-full overflow-hidden ${isIosNativeLandscape ? 'bg-transparent' : 'bg-black'}`}>
      {isIosNativeLandscape && isMobileLandscape && (
        <IosLandscapeStreamChrome headerSlot={statusHeaderSlot ?? headerSlot} onToggleLandscape={onToggleLandscape} />
      )}

      <LandscapeRotatedStage rotated={isLandscape} iosNativeLandscape={isIosNativeLandscape}>
        {viewport}
      </LandscapeRotatedStage>

      {showFixedLandscapeToggle && <LandscapeExitToggle onClick={onToggleLandscape} />}
    </div>
  );
}
