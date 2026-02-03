'use client';

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { resolveModalComponent } from '@/lib/templateConfig';
import { closeModal } from '@/slices/common/commonSlice';
import BaseModal from '@/ui/BaseModal';

const ModalManager = () => {
  const dispatch = useDispatch();
  const currentModal = useSelector((state) => state.common.currentModal);
  const modalProps = useSelector((state) => state.common.modalProps);

  const handleModalClose = () => {
    dispatch(closeModal());
  };

  // Modal component mapping resolved via template
  const modalComponents = new Proxy(
    {},
    {
      get: (_, key) => resolveModalComponent(key),
    },
  );

  if (!currentModal || !modalComponents[currentModal]) {
    return null;
  }

  const ModalComponent = modalComponents[currentModal];

  // Make deposit and customer service modals full-width with responsive margins
  const isFullWidthModal =
    currentModal === 'transaction' ||
    currentModal === 'customerService' ||
    currentModal === 'promotionDetail' ||
    currentModal === 'footerInfo';

  return (
    <BaseModal
      isOpen={true}
      onOpenChange={handleModalClose}
      preventOutsideClose={true}
      cssClass={
        isFullWidthModal
          ? 'left-2 right-2 sm:left-4 sm:right-4 md:left-8 md:right-8 lg:left-12 lg:right-12 xl:left-16 xl:right-16 w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] md:w-[calc(100%-4rem)] lg:w-[calc(100%-6rem)] xl:w-[calc(100%-8rem)]'
          : ''
      }
    >
      <ModalComponent {...(modalProps || {})} />
    </BaseModal>
  );
};

export default ModalManager;
