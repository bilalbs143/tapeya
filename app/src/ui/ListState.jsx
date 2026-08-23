/**
 * Page-level list empty/error states — matches My Matches (`/matches`).
 */

/** Red message + brand text Retry (not an orange Button). */
export function ListError({ message, onRetry, retryLabel = 'Retry' }) {
  return (
    <div className="py-10 text-center">
      <p className="text-[14px] text-red-400">{message}</p>
      {onRetry ? (
        <button type="button" className="text-brand mt-2 text-[14px]" onClick={onRetry}>
          {retryLabel}
        </button>
      ) : null}
    </div>
  );
}

/**
 * Title, optional subtitle, optional CTA node (usually `<Button variant="orange">`).
 */
export function ListEmpty({ title, description, action = null }) {
  return (
    <div className="py-12 text-center">
      <p className="text-muted text-[14px]">{title}</p>
      {description ? <p className="text-muted mt-1 text-[13px]">{description}</p> : null}
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}
