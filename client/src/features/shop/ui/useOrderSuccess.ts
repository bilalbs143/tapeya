import { useLocation, useNavigate } from 'react-router-dom';

import { parseOrderSuccessTotal } from '../lib/orderSuccess';
import { shopPaths } from '../lib/shopPaths';

/** Location-state total for OrderSuccessPage. */
export function useOrderSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const total = parseOrderSuccessTotal(location.state);

  function goHome() {
    navigate(shopPaths.home(), { replace: true });
  }

  return {
    total,
    goHome,
  };
}
