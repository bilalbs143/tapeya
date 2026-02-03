'use client';
import React from 'react';

import TemplateRenderer from '@/dynamic-components/template-pages/TemplateRenderer';

function AnnouncementsContainer() {
  return (
    <>
      <TemplateRenderer pageKey="announcements" />
    </>
  );
}

export default AnnouncementsContainer;
