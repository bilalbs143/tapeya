import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook for creating a smooth marquee animation using requestAnimationFrame
 * @param {Object} options - Configuration options
 * @param {number} options.speed - Animation speed in pixels per second (default: 30)
 * @param {boolean} options.pauseOnHover - Whether to pause animation on hover (default: true)
 * @param {boolean} options.direction - Animation direction: 'left' or 'right' (default: 'left')
 * @returns {Object} - Returns refs and state for the marquee
 */
export const useMarquee = ({
  speed = 30,
  pauseOnHover = true,
  direction = 'left',
} = {}) => {
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const animationRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  // Use state for position to trigger re-renders
  const [position, setPosition] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const reducedMotionRef = useRef(false);
  const isVisibleRef = useRef(true);
  const isPageHiddenRef = useRef(false);

  // Calculate if we need to duplicate content for seamless loop
  const needsDuplication = contentWidth > containerWidth;

  useEffect(() => {
    const updateDimensions = () => {
      if (contentRef.current && containerRef.current) {
        const newContentWidth = contentRef.current.scrollWidth;
        const newContainerWidth = containerRef.current.offsetWidth;
        if (newContentWidth !== contentWidth) setContentWidth(newContentWidth);
        if (newContainerWidth !== containerWidth)
          setContainerWidth(newContainerWidth);
      }
    };

    // ResizeObserver for precise size updates without layout thrash
    let ro;
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      ro = new ResizeObserver(() => {
        // Schedule on the next frame to batch
        requestAnimationFrame(updateDimensions);
      });
      ro.observe(containerRef.current);
    } else {
      window.addEventListener('resize', updateDimensions);
    }

    // Initial measure
    updateDimensions();

    return () => {
      if (ro) ro.disconnect();
      else window.removeEventListener('resize', updateDimensions);
    };
  }, [contentWidth, containerWidth]);

  // Respect prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotionRef.current = mq.matches;
    const onChange = () => {
      reducedMotionRef.current = mq.matches;
    };
    if (typeof mq.addEventListener === 'function')
      mq.addEventListener('change', onChange);
    else if (typeof mq.addListener === 'function') mq.addListener(onChange);
    return () => {
      if (typeof mq.removeEventListener === 'function')
        mq.removeEventListener('change', onChange);
      else if (typeof mq.removeListener === 'function')
        mq.removeListener(onChange);
    };
  }, []);

  // Pause when section is offscreen
  useEffect(() => {
    if (!containerRef.current || typeof IntersectionObserver === 'undefined')
      return;
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        isVisibleRef.current = Boolean(
          entry && entry.isIntersecting && entry.intersectionRatio > 0,
        );
      },
      { threshold: 0.1 },
    );
    io.observe(containerRef.current);
    return () => io.disconnect();
  }, []);

  // Pause when tab is hidden
  useEffect(() => {
    const onVisibility = () => {
      isPageHiddenRef.current = document.hidden;
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  useEffect(() => {
    const shouldRun =
      needsDuplication &&
      !isPaused &&
      contentWidth > 0 &&
      !reducedMotionRef.current &&
      isVisibleRef.current &&
      !isPageHiddenRef.current;
    if (!shouldRun) return;

    let startTime = null;

    const applyTransform = (x) => {
      setPosition(x);
    };

    const animate = (currentTime) => {
      if (startTime === null) startTime = currentTime;

      const elapsed = (currentTime - startTime) / 1000; // seconds
      const distance = speed * elapsed;

      // Use modulo to prevent jumps and ensure seamless loop
      const cycle = contentWidth;
      const offset = distance % cycle;
      const newPosition = direction === 'left' ? -offset : offset;

      applyTransform(newPosition);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [speed, direction, needsDuplication, isPaused, contentWidth]);

  const handleMouseEnter = () => {
    if (pauseOnHover) {
      setIsPaused(true);
    }
  };

  const handleMouseLeave = () => {
    if (pauseOnHover) {
      setIsPaused(false);
    }
  };

  return {
    containerRef,
    contentRef,
    // Expose current numeric position for direct use in transforms
    position,
    isPaused,
    needsDuplication,
    handleMouseEnter,
    handleMouseLeave,
  };
};
