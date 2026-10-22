import { useNavigate } from 'react-router-dom';

import { useGetShopOrdersQuery } from '../api/shopApi';
import { shopPaths } from '../lib/shopPaths';
import { splitOrders } from '../model/schemas';

/** Buyer orders query + current/previous split for OrdersPage. */
export function useOrdersPage() {
  const navigate = useNavigate();
  const { data = [], isLoading, isError, refetch } = useGetShopOrdersQuery({ perPage: 50 });
  const { current, previous } = splitOrders(data);

  function goHome() {
    navigate(shopPaths.home());
  }

  return {
    current,
    previous,
    isLoading,
    isError,
    refetch,
    goHome,
  };
}
