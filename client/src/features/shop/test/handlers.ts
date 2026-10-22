/**
 * Shop MSW handlers barrel — split by resource per Phase 1 Q2 / blueprint §5.4.
 * Registration order matches the former monolithic file (products → cart → orders → vendor → media).
 * Import `shopHandlers` from this module so `src/test/server.ts` stays stable.
 */

import { cartHandlers } from './cartHandlers';
import { orderHandlers } from './orderHandlers';
import { productHandlers } from './productHandlers';
import { vendorHandlers } from './vendorHandlers';

export const shopHandlers = [...productHandlers, ...cartHandlers, ...orderHandlers, ...vendorHandlers];
