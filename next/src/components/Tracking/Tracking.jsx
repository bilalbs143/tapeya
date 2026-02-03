'use client';

import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { fetchTrackingHtmlCode } from '@/website/websiteAction';

const Tracking = () => {
  const dispatch = useDispatch();
  const trackingHtmlCode = useSelector(
    (state) => state.website.trackingHtmlCodeData,
  );
  const isLoading = useSelector(
    (state) => state.website.trackingHtmlCodeLoader,
  );
  const containerRef = useRef(null);

  useEffect(() => {
    dispatch(fetchTrackingHtmlCode());
  }, [dispatch]);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    container.innerHTML = '';

    const value = trackingHtmlCode?.value;

    if (!value) {
      return;
    }

    const template = document.createElement('template');
    template.innerHTML = value;

    Array.from(template.content.childNodes).forEach((node) => {
      if (node.nodeName.toLowerCase() === 'noscript') {
        return;
      }

      if (node.nodeName.toUpperCase() === 'SCRIPT') {
        const scriptEl = document.createElement('script');

        Array.from(node.attributes || []).forEach((attr) => {
          scriptEl.setAttribute(attr.name, attr.value);
        });

        scriptEl.text = node.textContent ?? '';
        container.appendChild(scriptEl);
      } else {
        container.appendChild(node.cloneNode(true));
      }
    });
  }, [trackingHtmlCode]);

  if (isLoading) {
    return null;
  }

  return <div ref={containerRef} />;
};

export default Tracking;
