/**
 * Renders a CDN-hosted SVG as a CSS-masked element.
 * Inherits its color from the parent's text color (`currentColor`),
 * so wrapping in `<span className="text-[#DA9811]">` renders gold,
 * `text-white` renders white, `text-red-500` renders red, etc.
 *
 * Use this instead of <img> for icons that need to respect currentColor.
 */
export function CdnIcon({ src, className = '' }) {
  return (
    <span
      className={`inline-block shrink-0 ${className}`}
      style={{
        backgroundColor: 'currentColor',
        WebkitMaskImage: `url("${src}")`,
        WebkitMaskSize: 'contain',
        WebkitMaskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskImage: `url("${src}")`,
        maskSize: 'contain',
        maskRepeat: 'no-repeat',
        maskPosition: 'center',
      }}
      aria-hidden
    />
  );
}
