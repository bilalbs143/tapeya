import { useEffect, useMemo, useState } from 'react';

import { Controller, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { useToast } from '@/hooks/useToast';
import { getApiErrorMessage } from '@/lib/apiErrors';
import { formatIsoDateForDisplay, toApiDate } from '@/lib/utils/dateUtils';
import { EMPTY_FILE_UPLOAD } from '@/lib/utils/fileUploadUtils';
import { useGetBrandsQuery, useGetCategoriesQuery } from '@/store/api/shopApi';
import {
  useCreateVendorProductMutation,
  useGetVendorProductQuery,
  useGetVendorStoreQuery,
  useUpdateVendorProductMutation,
  useUploadProductImagesMutation,
} from '@/store/api/vendorShopApi';
import { Button } from '@/ui/Button';
import { Container } from '@/ui/Container';
import { DatePicker } from '@/ui/DatePicker';
import { FileUploadField } from '@/ui/FileUploadField';
import { FormActions } from '@/ui/form/FormActions';
import { FormStack } from '@/ui/form/FormStack';
import { FormField } from '@/ui/FormField';
import { Input } from '@/ui/Input';
import {
  Select,
  SelectContent,
  selectContentInputClass,
  SelectItem,
  selectItemInputClass,
  SelectTrigger,
  selectTriggerInputClass,
  SelectValue,
  selectViewportInputClass,
} from '@/ui/Select';
import { Textarea } from '@/ui/Textarea';

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
];

const DISCOUNT_TYPES = [
  { value: 'percentage', label: 'Percentage' },
  { value: 'fixed', label: 'Fixed Amount' },
];

function slugify(text) {
  return String(text ?? '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const DEFAULT_VALUES = {
  name: '',
  slug: '',
  description: '',
  price: '',
  brand_id: '',
  category_id: '',
  stock_quantity: '0',
  status: 'draft',
  enable_discount: false,
  discount_type: 'percentage',
  discount_value: '',
  discount_starts_at: '',
  discount_ends_at: '',
};

export default function SellerProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();

  const { data: store } = useGetVendorStoreQuery();
  const canEdit = store?.status === 'approved';

  const { data: brandsResponse } = useGetBrandsQuery({ all: true });
  const { data: categoriesResponse } = useGetCategoriesQuery({ all: true });
  const brands = brandsResponse?.data ?? [];
  const categories = categoriesResponse?.data ?? [];

  const { data: product, isLoading: productLoading } = useGetVendorProductQuery(id, { skip: !isEdit });
  const [createProduct, { isLoading: isCreating }] = useCreateVendorProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateVendorProductMutation();
  const [uploadImages, { isLoading: isUploading }] = useUploadProductImagesMutation();
  const [imageUpload, setImageUpload] = useState(EMPTY_FILE_UPLOAD);
  const [slugTouched, setSlugTouched] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({ defaultValues: DEFAULT_VALUES });

  const enableDiscount = watch('enable_discount');
  const nameValue = watch('name');

  useEffect(() => {
    if (!isEdit || !product) return;
    setSlugTouched(true);
    reset({
      name: product.name ?? '',
      slug: product.slug ?? '',
      description: product.description ?? '',
      price: product.price != null ? String(product.price) : '',
      brand_id: product.brand_id != null ? String(product.brand_id) : '',
      category_id: product.category_id != null ? String(product.category_id) : '',
      stock_quantity: product.stock_quantity != null ? String(product.stock_quantity) : '0',
      status: product.status ?? 'draft',
      enable_discount: Boolean(product.discount_type),
      discount_type: product.discount_type ?? 'percentage',
      discount_value: product.discount_value != null ? String(product.discount_value) : '',
      discount_starts_at: formatIsoDateForDisplay(product.discount_starts_at),
      discount_ends_at: formatIsoDateForDisplay(product.discount_ends_at),
    });
    const existingUrls = (product.images ?? []).map((img) => img.path ?? img.url).filter(Boolean);
    setImageUpload({ files: [], existingUrls });
  }, [isEdit, product, reset]);

  useEffect(() => {
    if (isEdit || slugTouched) return;
    setValue('slug', slugify(nameValue));
  }, [nameValue, isEdit, slugTouched, setValue]);

  const existingImageUrls = useMemo(() => imageUpload?.existingUrls ?? [], [imageUpload]);

  const isSubmitting = isCreating || isUpdating || isUploading;
  const readOnly = !canEdit;

  const onSubmit = async (data) => {
    if (readOnly) return;

    const payload = {
      name: data.name.trim(),
      slug: data.slug.trim(),
      description: data.description.trim(),
      price: Number(data.price),
      brand_id: Number(data.brand_id),
      category_id: Number(data.category_id),
      stock_quantity: Number(data.stock_quantity),
      status: data.status,
    };

    if (data.enable_discount && data.discount_type && data.discount_value !== '') {
      payload.discount_type = data.discount_type;
      payload.discount_value = Number(data.discount_value);
      payload.discount_starts_at = toApiDate(data.discount_starts_at) || undefined;
      payload.discount_ends_at = toApiDate(data.discount_ends_at) || undefined;
    } else if (isEdit) {
      payload.discount_type = null;
      payload.discount_value = null;
      payload.discount_starts_at = null;
      payload.discount_ends_at = null;
    }

    try {
      if (isEdit) {
        await updateProduct({ id, ...payload }).unwrap();
        const newFiles = imageUpload?.files ?? [];
        if (newFiles.length > 0) {
          await uploadImages({ productId: Number(id), files: newFiles }).unwrap();
        }
        toast.success(data.status === 'published' ? 'Product published' : 'Product updated');
        navigate('/seller/products');
      } else {
        const result = await createProduct(payload).unwrap();
        const created = result?.data ?? result;
        const productId = created?.id;
        const newFiles = imageUpload?.files ?? [];
        if (productId && newFiles.length > 0) {
          await uploadImages({ productId, files: newFiles }).unwrap();
        }
        toast.success(data.status === 'published' ? 'Product published' : 'Product created');
        navigate('/seller/products');
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, isEdit ? 'Could not update product.' : 'Could not create product.'));
    }
  };

  if (isEdit && productLoading) {
    return (
      <div className="bg-black">
        <AppSubpageHeader sticky title="EDIT PRODUCT" onBack={() => navigate('/seller/products')} />
        <Container>
          <div className="flex min-h-[30vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-white/70" />
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="bg-black">
      <AppSubpageHeader sticky title={isEdit ? 'EDIT PRODUCT' : 'NEW PRODUCT'} onBack={() => navigate('/seller/products')} />
      <Container>
        {readOnly && (
          <p className="text-muted mb-4 text-[13px]">
            Editing is disabled while your seller account is {store?.status_label ?? store?.status ?? 'not approved'}.
          </p>
        )}

        <FormStack as="form" density="default" className="pb-10" onSubmit={handleSubmit(onSubmit)}>
          <FormField label="Name" htmlFor="name" required>
            <Input
              id="name"
              placeholder="Product Name"
              disabled={readOnly}
              error={errors.name?.message}
              {...register('name', { required: 'Name is required' })}
            />
          </FormField>

          <FormField label="Slug" htmlFor="slug" required>
            <Input
              id="slug"
              disabled={readOnly}
              error={errors.slug?.message}
              {...register('slug', {
                required: 'Slug is required',
                onChange: () => setSlugTouched(true),
              })}
            />
          </FormField>

          <FormField label="Description" htmlFor="description" required>
            <Textarea
              id="description"
              rows={5}
              disabled={readOnly}
              error={errors.description?.message}
              {...register('description', { required: 'Description is required' })}
            />
          </FormField>

          <FormField label="Price (PKR)" htmlFor="price" required>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              disabled={readOnly}
              error={errors.price?.message}
              {...register('price', {
                required: 'Price is required',
                validate: (v) => Number(v) >= 0 || 'Price must be 0 or more',
              })}
            />
          </FormField>

          <FormField label="Brand" htmlFor="brand_id" required>
            <Controller
              name="brand_id"
              control={control}
              rules={{ required: 'Brand is required' }}
              render={({ field }) => (
                <Select value={field.value || undefined} onValueChange={field.onChange} disabled={readOnly}>
                  <SelectTrigger
                    id="brand_id"
                    className={selectTriggerInputClass}
                    aria-label="Brand"
                    aria-invalid={!!errors.brand_id}
                  >
                    <SelectValue placeholder="Select Brand" />
                  </SelectTrigger>
                  <SelectContent
                    className={selectContentInputClass}
                    viewportClassName={selectViewportInputClass}
                    position="popper"
                  >
                    {brands.map((b) => (
                      <SelectItem
                        key={b.id}
                        value={String(b.id)}
                        className={selectItemInputClass}
                        textClassName="!text-white"
                        indicatorClassName="!text-white"
                      >
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.brand_id?.message && (
              <p className="text-sm text-red-200" role="alert">
                {errors.brand_id.message}
              </p>
            )}
          </FormField>

          <FormField label="Category" htmlFor="category_id" required>
            <Controller
              name="category_id"
              control={control}
              rules={{ required: 'Category is required' }}
              render={({ field }) => (
                <Select value={field.value || undefined} onValueChange={field.onChange} disabled={readOnly}>
                  <SelectTrigger
                    id="category_id"
                    className={selectTriggerInputClass}
                    aria-label="Category"
                    aria-invalid={!!errors.category_id}
                  >
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent
                    className={selectContentInputClass}
                    viewportClassName={selectViewportInputClass}
                    position="popper"
                  >
                    {categories.map((c) => (
                      <SelectItem
                        key={c.id}
                        value={String(c.id)}
                        className={selectItemInputClass}
                        textClassName="!text-white"
                        indicatorClassName="!text-white"
                      >
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.category_id?.message && (
              <p className="text-sm text-red-200" role="alert">
                {errors.category_id.message}
              </p>
            )}
          </FormField>

          <FormField label="Stock" htmlFor="stock_quantity" required>
            <Input
              id="stock_quantity"
              type="number"
              min="0"
              step="1"
              disabled={readOnly}
              error={errors.stock_quantity?.message}
              {...register('stock_quantity', {
                required: 'Stock is required',
                validate: (v) => Number(v) >= 0 || 'Stock must be 0 or more',
              })}
            />
          </FormField>

          <FormField label="Status" htmlFor="status" required>
            <Controller
              name="status"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} disabled={readOnly}>
                  <SelectTrigger id="status" className={selectTriggerInputClass} aria-label="Status">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent
                    className={selectContentInputClass}
                    viewportClassName={selectViewportInputClass}
                    position="popper"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem
                        key={opt.value}
                        value={opt.value}
                        className={selectItemInputClass}
                        textClassName="!text-white"
                        indicatorClassName="!text-white"
                      >
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>

          <div className="border-t border-[#FFFFFF14] pt-6">
            <label className="flex items-center gap-3 text-[14px] text-white">
              <input type="checkbox" className="accent-brand h-4 w-4" disabled={readOnly} {...register('enable_discount')} />
              Add Discount (Optional)
            </label>
          </div>

          {enableDiscount && (
            <>
              <FormField label="Discount Type" htmlFor="discount_type">
                <Controller
                  name="discount_type"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange} disabled={readOnly}>
                      <SelectTrigger id="discount_type" className={selectTriggerInputClass}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent
                        className={selectContentInputClass}
                        viewportClassName={selectViewportInputClass}
                        position="popper"
                      >
                        {DISCOUNT_TYPES.map((opt) => (
                          <SelectItem
                            key={opt.value}
                            value={opt.value}
                            className={selectItemInputClass}
                            textClassName="!text-white"
                            indicatorClassName="!text-white"
                          >
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
              <FormField label="Discount Value" htmlFor="discount_value" required>
                <Input
                  id="discount_value"
                  type="number"
                  min="0"
                  step="0.01"
                  disabled={readOnly}
                  {...register('discount_value', {
                    validate: (v) => !enableDiscount || (v !== '' && Number(v) >= 0) || 'Discount value is required',
                  })}
                />
              </FormField>
              <FormField label="Discount Starts" htmlFor="discount_starts_at" required>
                <Controller
                  name="discount_starts_at"
                  control={control}
                  rules={{
                    validate: (v) => !enableDiscount || !!v || 'Start date is required',
                  }}
                  render={({ field }) => (
                    <DatePicker
                      id="discount_starts_at"
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Choose Date"
                      allowFuture
                      disabled={readOnly}
                      error={errors.discount_starts_at?.message}
                    />
                  )}
                />
              </FormField>
              <FormField label="Discount Ends" htmlFor="discount_ends_at" required>
                <Controller
                  name="discount_ends_at"
                  control={control}
                  rules={{
                    validate: (v) => !enableDiscount || !!v || 'End date is required',
                  }}
                  render={({ field }) => (
                    <DatePicker
                      id="discount_ends_at"
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Choose Date"
                      allowFuture
                      disabled={readOnly}
                      error={errors.discount_ends_at?.message}
                    />
                  )}
                />
              </FormField>
            </>
          )}

          <FileUploadField
            label={isEdit ? 'Add Images' : 'Images (Optional)'}
            value={imageUpload}
            onChange={setImageUpload}
            accept="image/jpeg,image/png,image/webp"
            acceptLabel="JPG, PNG, WebP"
            maxSizeMb={5}
            maxFiles={8}
            multiple
            disabled={readOnly}
          />

          {existingImageUrls.length > 0 && (
            <p className="text-muted text-[12px]">Existing images stay on the product. New uploads are added after save.</p>
          )}

          {!readOnly && (
            <FormActions align="stack">
              <Button type="submit" variant="auth" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Product'}
              </Button>
            </FormActions>
          )}
        </FormStack>
      </Container>
    </div>
  );
}
