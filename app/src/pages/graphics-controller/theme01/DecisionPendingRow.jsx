import RowTextBanner from '@/pages/graphics-controller/theme01/RowTextBanner';

export default function DecisionPendingRow() {
  return (
    <RowTextBanner
      text="Decision Pending"
      mobileCount={2}
      desktopCount={2}
      mobileTextClass="text-[14px]"
      mobileShadowClass="text-[22px]"
    />
  );
}
