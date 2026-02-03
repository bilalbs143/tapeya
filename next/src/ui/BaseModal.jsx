import * as Dialog from '@radix-ui/react-dialog';

const BaseModal = ({
  children,
  isOpen,
  cssClass,
  onOpenChange,
  preventOutsideClose = true,
}) => {
  // Allow consumers to provide their own positioning/width classes to avoid conflicts
  const positionAndWidthClasses = cssClass
    ? cssClass
    : 'left-4 right-4 md:left-[130px] md:right-[130px] w-auto';

  // Simple: don't pass onOpenChange if we want to prevent outside close
  const handleOpenChange = preventOutsideClose ? undefined : onOpenChange;

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className="data-[state=open]:animate-overlayShow scrollbar-hide fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-[#71001817] backdrop-blur-[10px]"
          aria-hidden="true"
          onClick={(e) => e.stopPropagation()}
        />
        <Dialog.Content
          className={`fixed top-1/2 ${positionAndWidthClasses} data-[state=open]:animate-contentShow scrollbar-hide z-[400] flex max-h-[95vh] min-h-[85vh] -translate-y-1/2 items-center justify-center overflow-visible bg-transparent focus:outline-none md:max-h-[90vh] md:min-h-[80vh]`}
          role="dialog"
          aria-modal="true"
          onEscapeKeyDown={(e) => preventOutsideClose && e.preventDefault()}
        >
          <Dialog.Title className="sr-only">Modal</Dialog.Title>
          <Dialog.Description className="sr-only">
            Modal content
          </Dialog.Description>
          <div className="scrollbar-hide flex h-full w-full items-center justify-center overflow-visible">
            {children}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default BaseModal;
