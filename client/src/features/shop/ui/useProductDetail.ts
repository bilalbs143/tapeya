import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getApiErrorMessage } from '@/shared/api/errors';
import { toast } from '@/shared/ui/toast';

import { useAddShopCartItemMutation, useGetShopProductQuery } from '../api/shopApi';
import { formatPkr } from '../lib/money';
import { productAddToCartLabel, productMaxQty, productStockLabel, productStockToneClass } from '../lib/productDetail';
import { shopPaths } from '../lib/shopPaths';

/** Product query, gallery shot, qty, and add-to-cart for ProductDetailPage. */
export function useProductDetail(productSlug: string, vendor: string | undefined) {
  const navigate = useNavigate();
  const productQuery = useGetShopProductQuery({ slug: productSlug, vendor }, { skip: !productSlug });
  const { data: product, isLoading, isError, refetch } = productQuery;
  const [addItem, { isLoading: adding }] = useAddShopCartItemMutation();
  const [shot, setShot] = useState(0);
  const [qty, setQty] = useState(1);

  const oos = Boolean(product?.outOfStock);
  const maxQty = productMaxQty(product?.stock ?? 1);
  const unit = product?.unitPrice ?? 0;
  const stockLabel = product ? productStockLabel(oos, product.lowStock, product.stock) : 'In Stock';
  const stockToneClass = product ? productStockToneClass(oos, product.lowStock) : 'text-positive-2';
  const addLabel = productAddToCartLabel(oos, formatPkr(unit * qty));
  const barSubtitle = product?.categoryName ?? 'Gear and Kits';

  async function add() {
    if (!product) return;
    try {
      await addItem({ productId: product.id, quantity: qty }).unwrap();
      toast({ title: 'Added to Cart', tone: 'success' });
    } catch (err) {
      toast({ title: getApiErrorMessage(err, 'Could not add to cart.'), tone: 'error' });
    }
  }

  function goBack() {
    navigate(-1);
  }

  function goHome() {
    navigate(shopPaths.home());
  }

  return {
    product,
    isLoading,
    isError,
    refetch,
    shot,
    setShot,
    qty,
    setQty,
    oos,
    maxQty,
    stockLabel,
    stockToneClass,
    addLabel,
    barSubtitle,
    adding,
    add,
    goBack,
    goHome,
  };
}
