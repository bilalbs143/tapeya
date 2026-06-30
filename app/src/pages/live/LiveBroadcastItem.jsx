/**
 * Live broadcast player — portrait or 90° landscape inside the parent player zone.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import CommentList from '@/features/stream/CommentList';
import { FloatingHeartsOverlay } from '@/features/stream/FloatingHeartsOverlay';
import { useFloatingHearts } from '@/features/stream/hooks/useFloatingHearts';
import { useMatchComments } from '@/features/stream/hooks/useMatchComments';
import { StreamPlayer } from '@/features/stream/StreamPlayer';
import { useToast } from '@/hooks/useToast';
import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';
import {
  LIVE_BROADCAST_CONTROLS_OVERLAY_Z,
  LIVE_BROADCAST_HEADER_OVERLAY_Z,
  LIVE_BROADCAST_HEADER_SCRIM,
  LIVE_BROADCAST_IMMERSIVE_TOGGLE_Z,
} from '@/lib/constants/liveBroadcastLayout';
import { getInitials } from '@/lib/utils/displayUtils';
import { usesIosNativeStreamUnderlay } from '@/lib/utils/liveStreamUtils';
import { mapSystemSettingsByKey } from '@/lib/utils/settingsUtils';
import { useSendLiveCommentMutation, useSendLiveHeartMutation } from '@/store/api/matchApi';
import { useGetPublicSystemSettingsQuery } from '@/store/api/systemSettingsApi';
import { useAppSelector } from '@/store/hooks';

import LandscapeRotatedStage from './LandscapeRotatedStage';

const maxMinIcon = `${CLOUDFRONT_APP_BASE}/images/icons/max-min-icon.svg`;
const commentIcon = `${CLOUDFRONT_APP_BASE}/images/icons/comment-icon.svg`;

const BOTTOM_OVERLAY = 'pointer-events-none absolute right-0 bottom-[12px] left-0 px-4 pb-2';

const TOGGLE_BTN =
  'flex h-9 w-9 shrink-0 touch-manipulation items-center justify-center rounded-full bg-white/[0.13] backdrop-blur-[9.7px] transition-opacity active:opacity-80';

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------

function HeartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        stroke="#000"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
        stroke="#080807"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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
// CommentInputRow — owns its own comment state so keystrokes never
// re-render the parent (and therefore never re-render the StreamPlayer).
// ---------------------------------------------------------------------------

function CommentInputRow({ onSend, onSendHeart, disabled = false }) {
  const [comment, setComment] = useState('');
  const canSend = comment.trim().length > 0 && !disabled;

  const handleSend = () => {
    const text = comment.trim();
    if (!text) return;
    onSend(text);
    setComment('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && canSend) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex w-full items-center gap-2 rounded-[12px] bg-white/[0.13] py-2 pr-2 pl-4 backdrop-blur-[9.7px]">
      <input
        type="text"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={disabled ? 'Chat Unavailable' : 'Add a Comment…'}
        disabled={disabled}
        className="min-w-0 flex-1 border-0 bg-transparent text-[13px] text-white placeholder:text-white/60 focus:outline-none disabled:opacity-50"
      />
      <div className="flex shrink-0 items-center gap-1.5">
        <button
          type="button"
          onClick={handleSend}
          disabled={!canSend}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white transition-transform active:scale-95 disabled:opacity-50"
          aria-label="Send Comment"
        >
          <SendIcon />
        </button>
        <button
          type="button"
          onClick={onSendHeart}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white transition-transform active:scale-95"
          aria-label="Send Heart"
        >
          <HeartIcon />
        </button>
      </div>
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
}) {
  return (
    <div className={`flex w-full flex-col gap-2 ${isLandscape ? '' : 'relative'}`}>
      {bottomPanelVisible && chatEnabled && <CommentList messages={messages} isLandscape={isLandscape} />}

      <div className={`flex gap-2 ${bottomPanelVisible ? 'items-start' : 'items-center justify-end'}`}>
        {bottomPanelVisible && streamStatus === 'ended' && (
          <div className="min-w-0 flex-1 px-1">
            <p className="mt-1 text-[11px] text-white/60 drop-shadow">Stream has ended</p>
          </div>
        )}
        <BroadcastFloatingToggles
          className={bottomPanelVisible ? 'ml-auto shrink-0' : ''}
          isLandscape={isLandscape}
          onToggleLayout={onToggleLayout}
          bottomPanelVisible={bottomPanelVisible}
          onToggleBottomPanel={onToggleBottomPanel}
        />
      </div>

      {bottomPanelVisible && chatEnabled && (
        <CommentInputRow onSend={onSend} onSendHeart={onSendHeart} disabled={inputDisabled} />
      )}
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
  bottomPanel,
  bottomPanelVisible,
  isLandscape,
  floatingHearts,
  onHeartEnd,
  headerSlot,
  isDesktop,
  immersiveLandscape = false,
  transparentVideoUnderlay = false,
}) {
  // Portrait: keep iframe interactive so mobile playback/tap-to-start works.
  // Landscape: block iframe touches so the portaled exit toggle stays tappable.
  const blockLandscapeVideoPointer = !isDesktop && isLandscape;
  const blockLandscapeVideoClass = blockLandscapeVideoPointer ? 'pointer-events-none [&_iframe]:pointer-events-none' : '';
  const videoLayer =
    isDesktop || isLandscape ? (
      <div className={`absolute inset-0 ${blockLandscapeVideoClass}`}>
        <StreamPlayer
          stream={stream}
          className="h-full w-full"
          fill
          isLandscape={isLandscape}
          allowInteraction={!blockLandscapeVideoPointer}
        />
      </div>
    ) : transparentVideoUnderlay ? (
      <div className="absolute inset-0">
        <StreamPlayer stream={stream} className="h-full w-full" fill isLandscape={false} allowInteraction />
      </div>
    ) : (
      <div className="absolute inset-0 flex items-start justify-center">
        <StreamPlayer stream={stream} className="max-h-full w-full" fill={false} isLandscape={false} allowInteraction />
      </div>
    );

  return (
    <div className={`relative size-full overflow-hidden ${transparentVideoUnderlay ? 'bg-transparent' : 'bg-black'}`}>
      {videoLayer}

      {!isDesktop && !immersiveLandscape && (
        <FloatingHeartsOverlay hearts={floatingHearts} onHeartEnd={onHeartEnd} isLandscape={isLandscape} />
      )}

      {!isDesktop && !immersiveLandscape && (
        <div className={`pointer-events-none absolute inset-0 ${bottomPanelVisible ? GRADIENT_VISIBLE : GRADIENT_HIDDEN}`} />
      )}

      {headerSlot && (
        <div className={LIVE_BROADCAST_HEADER_SCRIM} style={{ zIndex: LIVE_BROADCAST_HEADER_OVERLAY_Z }}>
          <div
            className="pointer-events-none relative flex items-center justify-between"
            style={{ paddingTop: isLandscape ? 'calc(env(safe-area-inset-top) + 8px)' : '8px' }}
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
  match,
  isLandscape,
  isDesktop = false,
  isMobileLandscape = false,
  onToggleLandscape,
  headerSlot = null,
}) {
  const toast = useToast();
  const myUserId = useAppSelector((s) => s.auth?.user?.id ?? null);
  const myAvatar = useAppSelector((s) => s.auth?.user?.avatar_url ?? s.auth?.user?.avatar ?? null);
  const myInitials = useAppSelector((s) => getInitials(s.auth?.user?.name, s.auth?.user?.nickname));
  const [bottomPanelVisible, setBottomPanelVisible] = useState(true);
  const [sendCooldown, setSendCooldown] = useState(false);
  const cooldownTimerRef = useRef(null);
  const { hearts: floatingHearts, spawnBurst, removeHeart, clearHearts } = useFloatingHearts();

  const matchId = match?.id ?? null;
  const streamStatus = match?.stream?.status;
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
  const { messages } = useMatchComments(matchId, chatEnabled, handleRemoteHeart);
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
    if (!matchId || !chatEnabled) return;
    spawnBurst(myAvatar, myInitials);
    sendHeart({ matchId });
  }, [spawnBurst, myAvatar, myInitials, matchId, chatEnabled, sendHeart]);

  const handleSend = useCallback(
    async (text) => {
      const body = text.trim();
      if (!body || !matchId || !chatEnabled || isSending || sendCooldown) {
        return;
      }

      setSendCooldown(true);
      cooldownTimerRef.current = window.setTimeout(() => {
        setSendCooldown(false);
      }, 2000);

      try {
        await sendComment({ matchId, body }).unwrap();
      } catch (err) {
        const type = err?.data?.type;
        if (type === 'TOO_MANY_REQUESTS') {
          toast.error('Slow down a little');
        }
      }
    },
    [matchId, chatEnabled, isSending, sendCooldown, sendComment, toast],
  );

  const toggleBottomPanel = useCallback(() => setBottomPanelVisible((v) => !v), []);

  const stream = match?.stream ?? null;
  const inputDisabled = isSending || sendCooldown;
  const usesIosNativeUnderlay = usesIosNativeStreamUnderlay();

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
      bottomPanelVisible={bottomPanelVisible}
      onToggleBottomPanel={toggleBottomPanel}
    />
  );

  const viewport = (
    <BroadcastViewport
      stream={stream}
      bottomPanel={bottomPanel}
      bottomPanelVisible={bottomPanelVisible}
      isLandscape={isLandscape}
      floatingHearts={floatingHearts}
      onHeartEnd={removeHeart}
      headerSlot={headerSlot}
      isDesktop={isDesktop}
      immersiveLandscape={isMobileLandscape}
      transparentVideoUnderlay={usesIosNativeUnderlay}
    />
  );

  const showFixedLandscapeToggle = isLandscape && !isDesktop;

  return (
    <div className={`relative h-full w-full overflow-hidden ${usesIosNativeUnderlay ? 'bg-transparent' : 'bg-black'}`}>
      <LandscapeRotatedStage rotated={isLandscape} transparentUnderlay={usesIosNativeUnderlay}>
        {viewport}
      </LandscapeRotatedStage>

      {showFixedLandscapeToggle && <LandscapeExitToggle onClick={onToggleLandscape} />}
    </div>
  );
}
