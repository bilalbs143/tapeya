import { ScreenBar } from '@/shared/layout';
import { Button } from '@/shared/ui/Button';
import { DatePicker } from '@/shared/ui/DatePicker';
import { Form } from '@/shared/ui/Form';
import { Input, Textarea } from '@/shared/ui/Input';
import { SelectField, SelectItem } from '@/shared/ui/Select';
import { StickyActionBar } from '@/shared/ui/StickyActionBar';
import { SwitchRow } from '@/shared/ui/Switch';

import { SELLER_PRODUCT_IMAGE_TYPES } from '../lib/sellerProductImages';
import { shopPaths } from '../lib/shopPaths';
import type { ShopProduct } from '../model/schemas';
import { SellerBrandDialog } from './SellerBrandDialog';
import { SellerCategoryDialog } from './SellerCategoryDialog';
import { useSellerProductForm } from './useSellerProductForm';

type SellerProductFormBodyProps = {
  storeApproved: boolean;
  storeStatusLabel?: string | undefined;
  product: ShopProduct | null | undefined;
};

/** Create / edit form fields, media, and sticky save. */
export function SellerProductFormBody({ storeApproved, storeStatusLabel, product }: SellerProductFormBodyProps) {
  const form = useSellerProductForm({ storeApproved, product });
  const {
    navigate,
    isEdit,
    canEdit,
    brands,
    categories,
    name,
    setName,
    description,
    setDescription,
    price,
    setPrice,
    brandId,
    setBrandId,
    categoryId,
    setCategoryId,
    stock,
    setStock,
    isActive,
    setIsActive,
    enableDiscount,
    setEnableDiscount,
    discountType,
    setDiscountType,
    discountValue,
    setDiscountValue,
    discountStartDate,
    setDiscountStartDate,
    discountStartTime,
    setDiscountStartTime,
    discountEndDate,
    setDiscountEndDate,
    discountEndTime,
    setDiscountEndTime,
    files,
    setFiles,
    fileError,
    errors,
    brandDialogOpen,
    setBrandDialogOpen,
    categoryDialogOpen,
    setCategoryDialogOpen,
    fileInput,
    existingImages,
    previews,
    busy,
    onFilesPick,
    onSubmit,
  } = form;

  return (
    <div className="bg-surface flex min-h-full flex-col">
      <ScreenBar
        title={isEdit ? 'Edit Product' : 'New Product'}
        subtitle="Name, Price and Media"
        onBack={() => navigate(shopPaths.sellerProducts())}
      />

      <Form id="seller-product-form" density="compact" onSubmit={(ev) => void onSubmit(ev)} className="px-4 pt-4 pb-4">
        {!canEdit ? (
          <p className="text-muted text-2xs leading-relaxed">
            Catalog is read-only while your account is {storeStatusLabel ?? 'not approved'}.
          </p>
        ) : null}

        <section className="border-border-subtle bg-surface flex flex-col gap-3 rounded-card border p-4">
          <h2 className="font-mono text-2xs font-bold tracking-eyebrow text-ink uppercase">Listing</h2>

          <Input
            label="Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            disabled={!canEdit}
            className="h-12 rounded-field"
          />
          <Textarea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={!canEdit}
            className="min-h-24 rounded-field p-3 text-body-sm"
          />
          <Input
            label="Price (PKR)"
            type="number"
            min={0}
            required
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            error={errors.price}
            disabled={!canEdit}
            className="h-12 rounded-field"
          />
          <Input
            label="Stock"
            type="number"
            min={0}
            required
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            error={errors.stock}
            disabled={!canEdit}
            className="h-12 rounded-field"
          />

          <div className="flex flex-col gap-1.5">
            <SelectField
              label="Brand"
              required
              {...(brandId ? { value: brandId } : {})}
              placeholder="Select Brand"
              onValueChange={setBrandId}
              disabled={!canEdit}
              error={errors.brandId}
              triggerClassName="h-12 rounded-field text-body-sm font-semibold"
            >
              {brands.map((b) => (
                <SelectItem key={b.id} value={String(b.id)}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectField>
            {canEdit ? (
              <button
                type="button"
                onClick={() => setBrandDialogOpen(true)}
                className="text-brand-text self-start text-2xs font-bold"
              >
                Add Brand
              </button>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <SelectField
              label="Category"
              required
              {...(categoryId ? { value: categoryId } : {})}
              placeholder="Select Category"
              onValueChange={setCategoryId}
              disabled={!canEdit}
              error={errors.categoryId}
              triggerClassName="h-12 rounded-field text-body-sm font-semibold"
            >
              {categories.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectField>
            {canEdit ? (
              <button
                type="button"
                onClick={() => setCategoryDialogOpen(true)}
                className="text-brand-text self-start text-2xs font-bold"
              >
                Add Category
              </button>
            ) : null}
          </div>

          <SwitchRow
            label="Active (sellable)"
            checked={isActive}
            onCheckedChange={setIsActive}
            disabled={!canEdit}
            className="py-1"
          />
        </section>

        <section className="border-border-subtle bg-surface flex flex-col gap-3 rounded-card border p-4">
          <SwitchRow
            label="Discount"
            checked={enableDiscount}
            onCheckedChange={setEnableDiscount}
            disabled={!canEdit}
            className="py-0"
          />
          {enableDiscount ? (
            <>
              <SelectField
                label="Type"
                value={discountType}
                onValueChange={setDiscountType}
                disabled={!canEdit}
                triggerClassName="h-12 rounded-field text-body-sm font-semibold"
              >
                <SelectItem value="percentage">Percentage</SelectItem>
                <SelectItem value="fixed">Fixed Amount</SelectItem>
              </SelectField>
              <Input
                label="Value"
                type="number"
                min={0}
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                error={errors.discountValue}
                disabled={!canEdit}
                className="h-12 rounded-field"
              />
              <div className="grid grid-cols-2 gap-3">
                <DatePicker
                  label="Starts"
                  days="any"
                  value={discountStartDate}
                  onChange={setDiscountStartDate}
                  disabled={!canEdit}
                  error={errors.discountStart}
                  className="h-12 rounded-field"
                />
                <Input
                  label="Start Time"
                  type="time"
                  value={discountStartTime}
                  onChange={(e) => setDiscountStartTime(e.target.value)}
                  disabled={!canEdit}
                  className="h-12 rounded-field"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <DatePicker
                  label="Ends"
                  days="any"
                  value={discountEndDate}
                  onChange={setDiscountEndDate}
                  disabled={!canEdit}
                  error={errors.discountEnd}
                  className="h-12 rounded-field"
                />
                <Input
                  label="End Time"
                  type="time"
                  value={discountEndTime}
                  onChange={(e) => setDiscountEndTime(e.target.value)}
                  disabled={!canEdit}
                  className="h-12 rounded-field"
                />
              </div>
            </>
          ) : null}
        </section>

        <section className="border-border-subtle bg-surface flex flex-col gap-3 rounded-card border p-4">
          <h2 className="font-mono text-2xs font-bold tracking-eyebrow text-ink uppercase">Photos</h2>
          {existingImages.length > 0 || previews.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {existingImages.map((src) => (
                <span
                  key={src}
                  className="border-border-subtle bg-surface-raised h-16 w-16 overflow-hidden rounded-panel border"
                >
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </span>
              ))}
              {previews.map((src) => (
                <span
                  key={src}
                  className="border-border-subtle bg-surface-raised h-16 w-16 overflow-hidden rounded-panel border"
                >
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </span>
              ))}
            </div>
          ) : null}
          {canEdit ? (
            <>
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                className="text-brand-text self-start text-2xs font-bold"
              >
                Add Photos
              </button>
              {files.length ? (
                <button
                  type="button"
                  onClick={() => setFiles([])}
                  className="text-dim self-start text-3xs font-semibold"
                >
                  Clear new photos
                </button>
              ) : null}
            </>
          ) : null}
          <span className={`text-3xs ${fileError ? 'text-danger-soft' : 'text-dim'}`}>
            {fileError ?? 'JPG, PNG or WebP, max 5 MB each.'}
          </span>
          <input
            ref={fileInput}
            type="file"
            accept={SELLER_PRODUCT_IMAGE_TYPES.join(',')}
            multiple
            onChange={onFilesPick}
            className="hidden"
          />
        </section>
      </Form>

      {canEdit ? (
        <StickyActionBar>
          <Button
            type="submit"
            form="seller-product-form"
            size="lg"
            className="min-h-12 w-full rounded-field text-body-sm font-bold"
            loading={busy}
          >
            {isEdit ? 'Save Product' : 'Create Product'}
          </Button>
        </StickyActionBar>
      ) : null}

      <SellerBrandDialog open={brandDialogOpen} onOpenChange={setBrandDialogOpen} canEdit />
      <SellerCategoryDialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen} canEdit />
    </div>
  );
}
