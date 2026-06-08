import { useState } from 'react';

/**
 * Overthrow dialog state — delivery type + runs 0–6 on one screen.
 *
 * @param {string|null} [initialDeliveryType] Optional preset (e.g. OT(W) / OT(NB) buttons).
 */
export function useOverthrowFlow(initialDeliveryType = null) {
  const [deliveryType, setDeliveryType] = useState(initialDeliveryType);
  const [runs, setRuns] = useState(0);

  return {
    deliveryType,
    setDeliveryType,
    runs,
    setRuns,
  };
}
