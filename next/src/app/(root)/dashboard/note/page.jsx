'use client';
import React from 'react';

import TemplateRenderer from '@/dynamic-components/template-pages/TemplateRenderer';

function NoteContainer() {
  return (
    <>
      <TemplateRenderer pageKey="note" />
    </>
  );
}

export default NoteContainer;
