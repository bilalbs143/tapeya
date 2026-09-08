/**
 * Local still for upload details + progress dialog.
 */

/**
 * @param {{
 *   posterUrl?: string | null,
 *   className?: string,
 * }} props
 */
export function ReelLocalPreviewThumb({ posterUrl = null, className = 'h-full w-full object-cover' }) {
  if (!posterUrl) {
    return <span className="bg-surface block h-full w-full" aria-hidden />;
  }

  return <img src={posterUrl} alt="" className={className} draggable={false} decoding="async" />;
}
