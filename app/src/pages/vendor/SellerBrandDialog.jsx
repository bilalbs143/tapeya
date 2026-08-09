import { useEffect } from 'react';

import { Controller, useForm } from 'react-hook-form';

import { BaseDialog } from '@/components/dialogs/BaseDialog';
import { useToast } from '@/hooks/useToast';
import { getApiErrorMessage } from '@/lib/apiErrors';
import { appendFileUploadToFormData, EMPTY_FILE_UPLOAD, fileUploadValueFromUrl } from '@/lib/utils/fileUploadUtils';
import { useCreateVendorBrandMutation, useUpdateVendorBrandMutation } from '@/store/api/vendorShopApi';
import { DialogHeaderRow, dialogPrimaryTitleClass, DialogSaveButton, DialogScrollBody, DialogTitle } from '@/ui/Dialog';
import { FileUploadField } from '@/ui/FileUploadField';
import { FormStack } from '@/ui/form/FormStack';
import { FormField } from '@/ui/FormField';
import { Input } from '@/ui/Input';

const FORM_ID = 'seller-brand-form';

const DEFAULT_VALUES = {
  name: '',
  logo: EMPTY_FILE_UPLOAD,
};

function toPayload(data) {
  const hasFile = (data.logo?.files?.length ?? 0) > 0;
  if (!hasFile) {
    return { name: data.name.trim() };
  }
  const fd = new FormData();
  fd.append('name', data.name.trim());
  appendFileUploadToFormData(fd, 'logo', data.logo);
  return fd;
}

/**
 * @param {{
 *   open: boolean,
 *   onOpenChange: (open: boolean) => void,
 *   brand?: { id: number|string, name?: string, logo?: string|null } | null,
 *   canEdit?: boolean,
 *   onSaved?: (brand: object) => void,
 * }} props
 */
export function SellerBrandDialog({ open, onOpenChange, brand = null, canEdit = true, onSaved }) {
  const toast = useToast();
  const isEdit = Boolean(brand?.id);
  const [createBrand, { isLoading: isCreating }] = useCreateVendorBrandMutation();
  const [updateBrand, { isLoading: isUpdating }] = useUpdateVendorBrandMutation();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: DEFAULT_VALUES });

  useEffect(() => {
    if (!open) return;
    reset({
      name: brand?.name ?? '',
      logo: fileUploadValueFromUrl(brand?.logo),
    });
  }, [brand, open, reset]);

  const isSubmitting = isCreating || isUpdating;
  const readOnly = !canEdit;

  const onSubmit = async (data) => {
    if (readOnly) return;
    try {
      const body = toPayload(data);
      const result = isEdit ? await updateBrand({ id: brand.id, body }).unwrap() : await createBrand(body).unwrap();
      const saved = result?.data ?? result;
      toast.success(isEdit ? 'Brand updated' : 'Brand created');
      onSaved?.(saved);
      onOpenChange(false);
    } catch (err) {
      toast.error(getApiErrorMessage(err, isEdit ? 'Could not update brand.' : 'Could not create brand.'));
    }
  };

  return (
    <BaseDialog open={open} onOpenChange={onOpenChange}>
      <DialogHeaderRow>
        <DialogTitle className={dialogPrimaryTitleClass}>{isEdit ? 'Edit Brand' : 'Add Brand'}</DialogTitle>
      </DialogHeaderRow>

      <DialogScrollBody>
        <FormStack as="form" id={FORM_ID} onSubmit={handleSubmit(onSubmit)}>
          <FormField label="Name" htmlFor="seller-brand-name" required>
            <Input
              id="seller-brand-name"
              placeholder="Brand Name"
              className="max-w-none"
              disabled={readOnly}
              error={errors.name?.message}
              {...register('name', { required: 'Name is required' })}
            />
          </FormField>

          <Controller
            name="logo"
            control={control}
            render={({ field }) => (
              <FileUploadField
                label="Logo"
                value={field.value}
                onChange={field.onChange}
                accept="image/jpeg,image/png,image/webp"
                acceptLabel="JPG, PNG, WebP"
                maxSizeMb={2}
                disabled={readOnly}
              />
            )}
          />
        </FormStack>
      </DialogScrollBody>

      {canEdit ? (
        <DialogSaveButton form={FORM_ID} type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : isEdit ? 'Save' : 'Add Brand'}
        </DialogSaveButton>
      ) : null}
    </BaseDialog>
  );
}
