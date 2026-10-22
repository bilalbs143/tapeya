import { type ChangeEvent, type FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getApiErrorMessage } from '@/shared/api/errors';
import { toast } from '@/shared/ui/toast';

import {
  useCreateVendorProductMutation,
  useGetVendorBrandsQuery,
  useGetVendorCategoriesQuery,
  useUpdateVendorProductMutation,
  useUploadVendorProductImagesMutation,
} from '../api/vendorShopApi';
import { isoDateHead, isoTimeLocal, toApiDateTime } from '../lib/sellerProductDateTime';
import { validateSellerProductImages } from '../lib/sellerProductImages';
import { shopPaths } from '../lib/shopPaths';
import type { ShopProduct, VendorProductWriteBody } from '../model/schemas';

type UseSellerProductFormArgs = {
  storeApproved: boolean;
  product: ShopProduct | null | undefined;
};

/** Form state, validation, and create/update submit for seller products. */
export function useSellerProductForm({ storeApproved, product }: UseSellerProductFormArgs) {
  const navigate = useNavigate();
  const isEdit = Boolean(product);
  const canEdit = storeApproved;

  const { data: brands = [] } = useGetVendorBrandsQuery({ all: true });
  const { data: categories = [] } = useGetVendorCategoriesQuery({ all: true });
  const [createProduct, createState] = useCreateVendorProductMutation();
  const [updateProduct, updateState] = useUpdateVendorProductMutation();
  const [uploadImages, uploadState] = useUploadVendorProductImagesMutation();

  const [name, setName] = useState(product?.name ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [price, setPrice] = useState(product ? String(product.price) : '');
  const [brandId, setBrandId] = useState(product?.brandId != null ? String(product.brandId) : '');
  const [categoryId, setCategoryId] = useState(product?.categoryId != null ? String(product.categoryId) : '');
  const [stock, setStock] = useState(product != null ? String(product.stock) : '0');
  const [isActive, setIsActive] = useState(product?.isActive !== false);
  const [enableDiscount, setEnableDiscount] = useState(Boolean(product?.discountType));
  const [discountType, setDiscountType] = useState(product?.discountType ?? 'percentage');
  const [discountValue, setDiscountValue] = useState(
    product?.discountValue != null ? String(product.discountValue) : ''
  );
  const [discountStartDate, setDiscountStartDate] = useState(isoDateHead(product?.discountStartsAt));
  const [discountStartTime, setDiscountStartTime] = useState(isoTimeLocal(product?.discountStartsAt) || '00:00');
  const [discountEndDate, setDiscountEndDate] = useState(isoDateHead(product?.discountEndsAt));
  const [discountEndTime, setDiscountEndTime] = useState(isoTimeLocal(product?.discountEndsAt) || '23:59');
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [brandDialogOpen, setBrandDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const existingImages = product?.imageUrls ?? [];
  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  useEffect(
    () => () => {
      for (const url of previews) URL.revokeObjectURL(url);
    },
    [previews]
  );
  const busy = createState.isLoading || updateState.isLoading || uploadState.isLoading;

  function onFilesPick(e: ChangeEvent<HTMLInputElement>) {
    const list = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (!list.length) return;
    const error = validateSellerProductImages(list);
    if (error) {
      setFileError(error);
      return;
    }
    setFileError(null);
    setFiles((prev) => [...prev, ...list].slice(0, 8));
  }

  function buildPayload(): VendorProductWriteBody | null {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = 'Name is required.';
    if (!price.trim() || !Number.isFinite(Number(price)) || Number(price) < 0) {
      next.price = 'Enter a valid price.';
    }
    if (!brandId) next.brandId = 'Pick a brand.';
    if (!categoryId) next.categoryId = 'Pick a category.';
    if (!stock.trim() || !Number.isFinite(Number(stock)) || Number(stock) < 0) {
      next.stock = 'Enter a valid stock quantity.';
    }
    if (enableDiscount) {
      if (!discountValue.trim() || !Number.isFinite(Number(discountValue))) {
        next.discountValue = 'Enter a discount value.';
      }
      if (!discountStartDate || !/^\d{2}:\d{2}$/.test(discountStartTime)) {
        next.discountStart = 'Pick a start date and time.';
      }
      if (!discountEndDate || !/^\d{2}:\d{2}$/.test(discountEndTime)) {
        next.discountEnd = 'Pick an end date and time.';
      }
    }
    setErrors(next);
    if (Object.keys(next).length) return null;

    const payload: VendorProductWriteBody = {
      name: name.trim(),
      description: description.trim() || undefined,
      price: Number(price),
      brand_id: Number(brandId),
      category_id: Number(categoryId),
      stock_quantity: Number(stock),
      is_active: isActive,
    };

    if (enableDiscount) {
      payload.discount_type = discountType;
      payload.discount_value = Number(discountValue);
      payload.discount_starts_at = toApiDateTime(discountStartDate, discountStartTime) ?? null;
      payload.discount_ends_at = toApiDateTime(discountEndDate, discountEndTime) ?? null;
    } else if (isEdit) {
      payload.discount_type = null;
      payload.discount_value = null;
      payload.discount_starts_at = null;
      payload.discount_ends_at = null;
    }

    return payload;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canEdit || busy) return;
    const payload = buildPayload();
    if (!payload) return;

    try {
      if (isEdit && product) {
        await updateProduct({ id: product.id, ...payload }).unwrap();
        if (files.length) {
          await uploadImages({ productId: product.id, files }).unwrap();
        }
        toast({ title: 'Product Updated', tone: 'success' });
      } else {
        const created = await createProduct(payload).unwrap();
        if (files.length && created.id) {
          await uploadImages({ productId: created.id, files }).unwrap();
        }
        toast({ title: 'Product Created', tone: 'success' });
      }
      navigate(shopPaths.sellerProducts());
    } catch (err) {
      toast({
        title: getApiErrorMessage(err, isEdit ? 'Could not update product.' : 'Could not create product.'),
        tone: 'error',
      });
    }
  }

  return {
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
  };
}
