import { type ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';

import { getApiErrorMessage } from '@/shared/api/errors';
import {
  BaseDialog,
  DialogBody,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/dialogs/BaseDialog';
import { Button } from '@/shared/ui/Button';
import { Field } from '@/shared/ui/Field';
import { Form } from '@/shared/ui/Form';
import { Input } from '@/shared/ui/Input';
import { SelectField, SelectItem } from '@/shared/ui/Select';
import { toast } from '@/shared/ui/toast';

import {
  useCreateVendorCategoryMutation,
  useGetVendorCategoriesQuery,
  useUpdateVendorCategoryMutation,
} from '../api/vendorShopApi';
import type { ShopCategory } from '../model/schemas';

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
const IMAGE_MAX_MB = 2;
const NONE = '__none__';

type SellerCategoryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: ShopCategory | null | undefined;
  canEdit?: boolean | undefined;
};

/** Add / edit category sheet — name, optional parent, optional image. */

export function SellerCategoryDialog({
  open,
  onOpenChange,
  category = null,
  canEdit = true,
}: SellerCategoryDialogProps) {
  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      contentClassName="flex max-h-[90dvh] flex-col gap-0 overflow-hidden p-0"
    >
      {open ? (
        <CategoryDialogBody
          key={category?.id ?? 'new'}
          category={category}
          canEdit={canEdit}
          onOpenChange={onOpenChange}
        />
      ) : null}
    </BaseDialog>
  );
}

function CategoryDialogBody({
  category,
  canEdit,
  onOpenChange,
}: {
  category: ShopCategory | null;
  canEdit: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const isEdit = Boolean(category?.id);
  const { data: allCategories = [] } = useGetVendorCategoriesQuery({ all: true });
  const [createCategory, createState] = useCreateVendorCategoryMutation();
  const [updateCategory, updateState] = useUpdateVendorCategoryMutation();
  const busy = createState.isLoading || updateState.isLoading;

  const [name, setName] = useState(category?.name ?? '');
  const [parentId, setParentId] = useState(category?.parentId != null ? String(category.parentId) : NONE);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [clearedExisting, setClearedExisting] = useState(false);
  const imageInput = useRef<HTMLInputElement>(null);

  const parentOptions = useMemo(
    () => allCategories.filter((c) => !isEdit || c.id !== category?.id),
    [allCategories, category?.id, isEdit]
  );

  const existingImage = !clearedExisting && !imageFile ? (category?.imageUrl ?? null) : null;
  const imagePreview = useMemo(() => (imageFile ? URL.createObjectURL(imageFile) : null), [imageFile]);

  useEffect(() => {
    if (!imagePreview) return undefined;
    return () => URL.revokeObjectURL(imagePreview);
  }, [imagePreview]);

  function onImagePick(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!(IMAGE_TYPES as readonly string[]).includes(file.type)) {
      setImageError('Image must be JPG, PNG or WebP.');
      return;
    }
    if (file.size > IMAGE_MAX_MB * 1024 * 1024) {
      setImageError(`Image must be under ${IMAGE_MAX_MB} MB.`);
      return;
    }
    setImageError(null);
    setClearedExisting(true);
    setImageFile(file);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canEdit || busy) return;
    if (!name.trim()) {
      setNameError('Name is required.');
      return;
    }
    setNameError(null);

    const parent = parentId === NONE || parentId === '' ? null : Number(parentId);

    try {
      let body: { name: string; parent_id: number | null } | FormData = {
        name: name.trim(),
        parent_id: Number.isFinite(parent) ? parent : null,
      };
      if (imageFile) {
        const fd = new FormData();
        fd.append('name', name.trim());
        fd.append('parent_id', parent == null || !Number.isFinite(parent) ? '' : String(parent));
        fd.append('image', imageFile);
        body = fd;
      }

      if (isEdit && category) {
        await updateCategory({ id: category.id, body }).unwrap();
        toast({ title: 'Category Updated', tone: 'success' });
      } else {
        await createCategory(body).unwrap();
        toast({ title: 'Category Created', tone: 'success' });
      }
      onOpenChange(false);
    } catch (err) {
      toast({
        title: getApiErrorMessage(err, isEdit ? 'Could not update category.' : 'Could not create category.'),
        tone: 'error',
      });
    }
  }

  const preview = imagePreview ?? existingImage;

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEdit ? 'Edit Category' : 'Add Category'}</DialogTitle>
        <DialogDescription className="font-mono text-dim text-3xs font-medium tracking-eyebrow uppercase">
          What buyers filter by
        </DialogDescription>
      </DialogHeader>

      <DialogBody className="min-h-0 flex-1 overflow-y-auto">
        <Form id="seller-category-form" density="compact" onSubmit={(ev) => void onSubmit(ev)}>
          <Input
            label="Name"
            required
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setNameError(null);
            }}
            error={nameError ?? undefined}
            disabled={!canEdit}
            placeholder="Bats"
            className="h-12 rounded-field"
          />

          <SelectField
            label="Parent Category"
            value={parentId}
            onValueChange={setParentId}
            disabled={!canEdit}
            triggerClassName="h-12 rounded-field text-body-sm font-semibold"
          >
            <SelectItem value={NONE}>None</SelectItem>
            {parentOptions.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.name}
              </SelectItem>
            ))}
          </SelectField>

          <Field
            label="Image"
            error={imageError ?? undefined}
            hint={imageError ? undefined : 'JPG, PNG or WebP, max 2 MB.'}
          >
            {({ id }) => (
              <div className="flex items-center gap-3">
                <span className="bg-surface-raised border-border-subtle flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-panel border">
                  {preview ? (
                    <img src={preview} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-dim font-mono text-4xs font-bold">IMG</span>
                  )}
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  {canEdit ? (
                    <>
                      <button
                        type="button"
                        id={id}
                        onClick={() => imageInput.current?.click()}
                        className="text-brand-text self-start text-2xs font-bold"
                      >
                        {preview ? 'Replace Image' : 'Upload Image'}
                      </button>
                      {preview ? (
                        <button
                          type="button"
                          onClick={() => {
                            setImageFile(null);
                            setClearedExisting(true);
                            setImageError(null);
                          }}
                          className="text-dim self-start text-3xs font-semibold"
                        >
                          Remove
                        </button>
                      ) : null}
                    </>
                  ) : (
                    <span className="text-dim text-3xs">On file.</span>
                  )}
                </div>
                <input
                  ref={imageInput}
                  type="file"
                  accept={IMAGE_TYPES.join(',')}
                  onChange={onImagePick}
                  className="hidden"
                />
              </div>
            )}
          </Field>
        </Form>
      </DialogBody>

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="secondary" size="md" disabled={busy}>
            Cancel
          </Button>
        </DialogClose>
        {canEdit ? (
          <Button type="submit" form="seller-category-form" size="md" loading={busy}>
            {isEdit ? 'Save Category' : 'Add Category'}
          </Button>
        ) : null}
      </DialogFooter>
    </>
  );
}
