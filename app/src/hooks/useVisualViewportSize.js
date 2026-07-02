import { useLayoutEffect, useState } from 'react';

function readVisualViewportSize() {
  return {
    w: window.visualViewport?.width ?? window.innerWidth,
    h: window.visualViewport?.height ?? window.innerHeight,
  };
}

/** Tracks visual viewport width × height; falls back to window inner dimensions. */
export function useVisualViewportSize() {
  const [size, setSize] = useState({ w: 0, h: 0 });

  useLayoutEffect(() => {
    const update = () => {
      setSize(readVisualViewportSize());
    };

    update();
    window.visualViewport?.addEventListener('resize', update);
    window.addEventListener('resize', update);

    return () => {
      window.visualViewport?.removeEventListener('resize', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return size;
}
