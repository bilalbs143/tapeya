'use client';
import React, { useMemo } from 'react';

import { resolveStaticPageComponent } from '@/lib/staticTemplatePageResolver';

export default function TemplateRenderer({ pageKey }) {
  const Component = useMemo(
    () => resolveStaticPageComponent(pageKey),
    [pageKey],
  );
  return Component ? <Component /> : null;
}
