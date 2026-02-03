'use client';
import React from 'react';

import TemplateRenderer from '@/dynamic-components/template-pages/TemplateRenderer';

function ProfileContainer() {
  return (
    <>
      <TemplateRenderer pageKey="profile" />
    </>
  );
}

export default ProfileContainer;
