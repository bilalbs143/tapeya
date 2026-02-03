'use client';

import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { fetchLiveChatHtmlCode } from '@/website/websiteAction';

const LiveChat = () => {
  const dispatch = useDispatch();
  const liveChatHtmlCode = useSelector(
    (state) => state.website.liveChatHtmlCodeData,
  );
  const isLoading = useSelector(
    (state) => state.website.liveChatHtmlCodeLoader,
  );

  const containerRef = useRef(null);

  useEffect(() => {
    dispatch(fetchLiveChatHtmlCode());
  }, [dispatch]);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    container.innerHTML = '';

    const value = liveChatHtmlCode?.value;

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
  }, [liveChatHtmlCode]);

  if (isLoading) {
    return null;
  }

  return <div ref={containerRef} />;
};

export default LiveChat;
