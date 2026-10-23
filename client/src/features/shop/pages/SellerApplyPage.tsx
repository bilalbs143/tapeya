import { Navigate } from 'react-router-dom';

import { useMeQuery } from '@/features/auth';

import { userHasVendorAccess, userProfilePath } from '@/entities/user';

import { shopPaths } from '../lib/shopPaths';
import { SellerApplyFormBody } from '../ui/SellerApplyFormBody';
import { useSellerApplyForm } from '../ui/useSellerApplyForm';

/** Posts ApplyVendorRequest fields to POST /shop/vendor/apply. */

export default function SellerApplyPage() {
  const { data: me, isLoading } = useMeQuery();
  const flow = useSellerApplyForm();

  if (!isLoading && userHasVendorAccess(me)) {
    return <Navigate to={shopPaths.seller()} replace />;
  }

  if (!isLoading && me?.vendor != null) {
    return <Navigate to={userProfilePath(me)} replace />;
  }

  return <SellerApplyFormBody flow={flow} />;
}
