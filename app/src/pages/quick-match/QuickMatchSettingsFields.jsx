import { FORM_FIELD_ERROR_CLASS } from '@/lib/constants/formLayout';
import { FormField } from '@/ui/FormField';

export const QUICK_MATCH_OVERS_INPUT_CLASS =
  'flex h-12 w-full items-center rounded-[6px] bg-surface px-4 py-3 text-left text-white focus:outline-none focus:ring-2 focus:ring-brand/50 cursor-pointer';

/**
 * Shared ball type / overs / PPS fields for create + resume.
 */
export function QuickMatchSettingsFields({
  cricketFormat,
  overs,
  playersPerSide,
  formatOptions,
  onOpenBallType,
  onOpenOvers,
  onOpenPlayersPerSide,
  errors = {},
  required = false,
}) {
  return (
    <>
      <FormField label="Ball Type" required={required}>
        <button
          type="button"
          className={`${QUICK_MATCH_OVERS_INPUT_CLASS} ${errors.cricket_format ? 'ring-2 ring-red-500' : ''}`}
          onClick={onOpenBallType}
        >
          {formatOptions.find((o) => o.value === cricketFormat)?.label ??
            (cricketFormat ? String(cricketFormat) : 'Select Ball Type')}
        </button>
        {errors.cricket_format?.message ? (
          <p className={FORM_FIELD_ERROR_CLASS} role="alert">
            {errors.cricket_format.message}
          </p>
        ) : null}
      </FormField>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Overs" required={required}>
          <button
            type="button"
            className={`${QUICK_MATCH_OVERS_INPUT_CLASS} ${errors.overs ? 'ring-2 ring-red-500' : ''}`}
            onClick={onOpenOvers}
          >
            {overs ? `${overs} Overs` : 'Select Overs'}
          </button>
          {errors.overs?.message ? (
            <p className={FORM_FIELD_ERROR_CLASS} role="alert">
              {errors.overs.message}
            </p>
          ) : null}
        </FormField>

        <FormField label="Players Per Side" required={required}>
          <button
            type="button"
            className={`${QUICK_MATCH_OVERS_INPUT_CLASS} ${errors.players_per_side ? 'ring-2 ring-red-500' : ''}`}
            onClick={onOpenPlayersPerSide}
          >
            {playersPerSide ? `${playersPerSide}` : 'Select'}
          </button>
          {errors.players_per_side?.message ? (
            <p className={FORM_FIELD_ERROR_CLASS} role="alert">
              {errors.players_per_side.message}
            </p>
          ) : null}
        </FormField>
      </div>
    </>
  );
}
