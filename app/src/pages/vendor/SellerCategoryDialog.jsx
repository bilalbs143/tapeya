import { useEffect, useMemo } from 'react';

import { Controller, useForm } from 'react-hook-form';

import { BaseDialog } from '@/components/dialogs/BaseDialog';
import { useToast } from '@/hooks/useToast';
import { getApiErrorMessage } from '@/lib/apiErrors';
import { appendFileUploadToFormData, EMPTY_FILE_UPLOAD, fileUploadValueFromUrl } from '@/lib/utils/fileUploadUtils';
import {
  useCreateVendorCategoryMutation,
  useGetVendorCategoriesQuery,
  useUpdateVendorCategoryMutation,
} from '@/store/api/vendorShopApi';
import { DialogHeaderRow, dialogPrimaryTitleClass, DialogSaveButton, DialogScrollBody, DialogTitle } from '@/ui/Dialog';
import { FileUploadField } from '@/ui/FileUploadField';
import { FormStack } from '@/ui/form/FormStack';
import { FormField } from '@/ui/FormField';
import { Input } from '@/ui/Input';
import { SearchableSelect } from '@/ui/SearchableSelect';

const FORM_ID = 'seller-category-form';

const DEFAULT_VALUES = {
  name: '',
  parent_id: '',
  image: EMPTY_FILE_UPLOAD,
};

function toPayload(data) {
  const hasFile = (data.image?.files?.length ?? 0) > 0;
  const parentId = data.parent_id === '' || data.parent_id == null ? null : Number(data.parent_id);
  if (!hasFile) {
    return {
      name: data.name.trim(),
      parent_id: parentId,
    };
  }
  const fd = new FormData();
  fd.append('name', data.name.trim());
  fd.append('parent_id', parentId == null ? '' : String(parentId));
  appendFileUploadToFormData(fd, 'image', data.image);
  return fd;
}

/**
 * @param {{
 *   open: boolean,
 *   onOpenChange: (open: boolean) => void,
 *   category?: { id: number|string, name?: string, parent_id?: number|null, image?: string|null } | null,
 *   canEdit?: boolean,
 *   onSaved?: (category: object) => void,
 * }} props
 */
export function SellerCategoryDialog({ open, onOpenChange, category = null, canEdit = true, onSaved }) {
  const toast = useToast();
  const isEdit = Boolean(category?.id);
  const { data: categoriesResponse } = useGetVendorCategoriesQuery({ all: true }, { skip: !open });
  const [createCategory, { isLoading: isCreating }] = useCreateVendorCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateVendorCategoryMutation();

  const parentOptions = useMemo(() => {
    const rows = categoriesResponse?.data ?? [];
    return [
      { value: '', label: 'None' },
      ...rows
        .filter((row) => !isEdit || String(row.id) !== String(category?.id))
        .map((row) => ({ value: String(row.id), label: row.name })),
    ];
  }, [categoriesResponse?.data, category?.id, isEdit]);

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
      name: category?.name ?? '',
      parent_id: category?.parent_id != null ? String(category.parent_id) : '',
      image: fileUploadValueFromUrl(category?.image),
    });
  }, [category, open, reset]);

  const isSubmitting = isCreating || isUpdating;
  const readOnly = !canEdit;

  const onSubmit = async (data) => {
    if (readOnly) return;
    try {
      const body = toPayload(data);
      const result = isEdit ? await updateCategory({ id: category.id, body }).unwrap() : await createCategory(body).unwrap();
      const saved = result?.data ?? result;
      toast.success(isEdit ? 'Category updated' : 'Category created');
      onSaved?.(saved);
      onOpenChange(false);
    } catch (err) {
      toast.error(getApiErrorMessage(err, isEdit ? 'Could not update category.' : 'Could not create category.'));
    }
  };

  return (
    <BaseDialog open={open} onOpenChange={onOpenChange}>
      <DialogHeaderRow>
        <DialogTitle className={dialogPrimaryTitleClass}>{isEdit ? 'Edit Category' : 'Add Category'}</DialogTitle>
      </DialogHeaderRow>

      <DialogScrollBody>
        <FormStack as="form" id={FORM_ID} onSubmit={handleSubmit(onSubmit)}>
          <FormField label="Name" htmlFor="seller-category-name" required>
            <Input
              id="seller-category-name"
              placeholder="Category Name"
              className="max-w-none"
              disabled={readOnly}
              error={errors.name?.message}
              {...register('name', { required: 'Name is required' })}
            />
          </FormField>

          <FormField label="Parent Category" htmlFor="seller-category-parent">
            <Controller
              name="parent_id"
              control={control}
              render={({ field }) => (
                <SearchableSelect
                  id="seller-category-parent"
                  value={field.value || ''}
                  onChange={field.onChange}
                  options={parentOptions}
                  placeholder="None"
                  searchPlaceholder="Search Categories…"
                  disabled={readOnly}
                  readOnly={readOnly}
                  ariaLabel="Parent Category"
                />
              )}
            />
          </FormField>

          <Controller
            name="image"
            control={control}
            render={({ field }) => (
              <FileUploadField
                label="Image"
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
        <DialogSaveButton form={FORM_ID} type="submit" disabled={isSubmitting} loading={isSubmitting}>
          {isSubmitting ? 'Saving…' : isEdit ? 'Save' : 'Add Category'}
        </DialogSaveButton>
      ) : null}
    </BaseDialog>
  );
}
