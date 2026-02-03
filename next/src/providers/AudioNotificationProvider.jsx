'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useSelector } from 'react-redux';

const AudioNotificationContext = createContext({
  play: (_src, _volume) => {},
});

export function useAudioNotification() {
  return useContext(AudioNotificationContext);
}

export default function AudioNotificationProvider({
  children,
  soundUrl = 'https://d3emlo5tm9es2f.cloudfront.net/files/sounds/121qQykSLQLtf7VAzD10kntkBHsKolGufGXntcda.mp3',
  volume = 0.7,
  enabled = true,
}) {
  const isAuth = useSelector((state) => state.auth.isAuth);

  const audioRef = useRef(null);
  const [userInteracted, setUserInteracted] = useState(false);
  const pendingQueueRef = useRef([]);

  // Initialize the HTMLAudioElement lazily
  const ensureAudio = useCallback(() => {
    if (!audioRef.current && typeof window !== 'undefined') {
      const audio = new Audio();
      audio.preload = 'auto';
      audio.volume =
        typeof volume === 'number' ? Math.min(Math.max(volume, 0), 1) : 0.7;
      audioRef.current = audio;
    }
    return audioRef.current;
  }, [volume]);

  // Unlock audio on first user interaction and flush any queued sounds
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const onInteract = () => {
      if (!userInteracted) {
        setUserInteracted(true);
        // Flush queue
        const queued = pendingQueueRef.current.splice(0);
        queued.forEach(({ src, vol }) => {
          const audio = ensureAudio();
          if (!audio) return;
          try {
            audio.src = src;
            if (typeof vol === 'number') {
              audio.volume = Math.min(Math.max(vol, 0), 1);
            }
            audio.play().catch(() => {});
          } catch (_) {}
        });
      }
    };

    const opts = { once: true, capture: true };
    window.addEventListener('click', onInteract, opts);
    window.addEventListener('touchstart', onInteract, opts);
    window.addEventListener('pointerdown', onInteract, opts);
    window.addEventListener('keydown', onInteract, opts);

    return () => {
      window.removeEventListener('click', onInteract, { capture: true });
      window.removeEventListener('touchstart', onInteract, { capture: true });
      window.removeEventListener('pointerdown', onInteract, { capture: true });
      window.removeEventListener('keydown', onInteract, { capture: true });
    };
  }, [userInteracted, ensureAudio]);

  const play = useCallback(
    (src, vol) => {
      if (!enabled || !isAuth) return;

      const finalSrc = src || soundUrl;
      const finalVol = typeof vol === 'number' ? vol : volume;

      const audio = ensureAudio();
      if (!audio) return;

      // Try to play immediately. If blocked by autoplay policy, queue until next interaction
      const attemptPlay = () => {
        try {
          audio.src = finalSrc;
          audio.volume = Math.min(Math.max(finalVol, 0), 1);
          const promise = audio.play();
          if (promise && typeof promise.then === 'function') {
            promise
              .then(() => {
                if (!userInteracted) {
                  setUserInteracted(true);
                }
              })
              .catch(() => {
                if (!userInteracted) {
                  pendingQueueRef.current.push({
                    src: finalSrc,
                    vol: finalVol,
                  });
                }
              });
          }
        } catch (_) {
          if (!userInteracted) {
            pendingQueueRef.current.push({ src: finalSrc, vol: finalVol });
          }
        }
      };

      if (userInteracted) {
        attemptPlay();
      } else {
        attemptPlay();
      }
    },
    [enabled, isAuth, ensureAudio, soundUrl, volume, userInteracted],
  );

  const value = useMemo(
    () => ({
      play,
    }),
    [play],
  );

  return (
    <AudioNotificationContext.Provider value={value}>
      {children}
    </AudioNotificationContext.Provider>
  );
}
