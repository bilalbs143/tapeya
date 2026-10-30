import { FORM_FIELD_ERROR_CLASS } from '@/lib/constants/formLayout';
import { FormField } from '@/ui/FormField';

export const QUICK_MATCH_OVERS_INPUT_CLASS =
  'flex h-12 w-full items-center rounded-[6px] bg-surface px-4 py-3 text-left text-white focus:outline-none focus:ring-2 focus:ring-brand/50 cursor-pointer';

/**
 * Shared overs / PPS fields for create + resume.
 */
export function QuickMatchSettingsFields({
  overs,
  playersPerSide,
  onOpenOvers,
  onOpenPlayersPerSide,
  errors = {},
  required = false,
}) {
  return (
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
  );
}
