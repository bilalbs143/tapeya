import wagonWheelUrl from '@/assets/images/icons/wagon-wheel.svg';

/**
 * Wagon wheel icon — shot-direction analytics toggle in the scoring header.
 * `stroke` prop sets the icon color (maps to CSS mask backgroundColor).
 */
export function WagonWheelIcon({ size = 16, className = '', stroke = 'currentColor' }) {
  return (
    <span
      className={`inline-block shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: stroke,
        WebkitMaskImage: `url("${wagonWheelUrl}")`,
        WebkitMaskSize: 'contain',
        WebkitMaskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskImage: `url("${wagonWheelUrl}")`,
        maskSize: 'contain',
        maskRepeat: 'no-repeat',
        maskPosition: 'center',
      }}
      aria-hidden
    />
  );
}
