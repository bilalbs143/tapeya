'use client';
import React from 'react';

import TemplateRenderer from '@/dynamic-components/template-pages/TemplateRenderer';

function HomeContainer() {
  return (
    <>
      <TemplateRenderer pageKey="home" />
    </>
  );
}

export default HomeContainer;
