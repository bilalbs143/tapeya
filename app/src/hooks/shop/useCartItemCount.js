import { useEffect, useRef, useState } from 'react';

import { useGetCartQuery } from '@/store/api/shopApi';

/**
 * Cart item quantity total and badge pop animation when count increases.
 * Used by NavbarCartButton (replaces former FloatingCartButton behavior).
 */
export function useCartItemCount() {
  const { data: cart } = useGetCartQuery();
  const items = cart?.items ?? [];
  const count = items.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);

  const prevCountRef = useRef(null);
  const [isPopping, setIsPopping] = useState(false);

  useEffect(() => {
    const prev = prevCountRef.current;
    prevCountRef.current = count;
    if (prev !== null && count > prev) {
      setIsPopping(true);
      const t = setTimeout(() => setIsPopping(false), 400);
      return () => clearTimeout(t);
    }
  }, [count]);

  return { items, count, isPopping, hasItems: items.length > 0 };
}
