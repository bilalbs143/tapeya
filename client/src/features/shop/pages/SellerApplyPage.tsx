import { SellerApplyFormBody } from '../ui/SellerApplyFormBody';
import { useSellerApplyForm } from '../ui/useSellerApplyForm';

/** Posts ApplyVendorRequest fields to POST /shop/vendor/apply. */

export default function SellerApplyPage() {
  const flow = useSellerApplyForm();
  return <SellerApplyFormBody flow={flow} />;
}
