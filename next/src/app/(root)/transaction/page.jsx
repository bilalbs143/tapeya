'use client';
import React from 'react';

import TemplateRenderer from '@/dynamic-components/template-pages/TemplateRenderer';

function TransactionContainer() {
  return (
    <>
      <TemplateRenderer pageKey="transaction" />
    </>
  );
}

export default TransactionContainer;
