import { useEffect } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';

import { useDialog } from '@/context/DialogContext';
import { useToast } from '@/hooks/useToast';
import { getApiErrorMessage } from '@/lib/apiErrors';
import { FORM_HELPER_TEXT_CLASS } from '@/lib/constants/formLayout';
import { matchSettingsFormSchema } from '@/lib/validations/matchSettings';
import { useUpdateMatchAnalyticsSettingsMutation } from '@/store/api/matchApi';
import { DialogHeaderRow, dialogPrimaryTitleClass, DialogSaveButton, DialogScrollBody, DialogTitle } from '@/ui/Dialog';
import { FormStack } from '@/ui/form/FormStack';
import { FormField } from '@/ui/FormField';
import { Switch } from '@/ui/Switch';
import { Textarea } from '@/ui/Textarea';

const MATCH_SETTINGS_FORM_ID = 'match-settings-form';

const DEFAULT_VALUES = {
  wagon_wheel_enabled: false,
  umpires: '',
  scorers: '',
  commentators: '',
};

function settingsToFormValues(settings = {}) {
  return {
    wagon_wheel_enabled: Boolean(settings.wagon_wheel_enabled),
    umpires: settings.umpires ?? '',
    scorers: settings.scorers ?? '',
    commentators: settings.commentators ?? '',
  };
}

/**
 * Scoring header → Match settings (wagon wheel + match officials).
 *
 * @param {string} matchId
 * @param {object} [settings] — `analytics_settings` from match API
 */
export function MatchSettingsDialog({ matchId, settings = {} }) {
  const { closeDialog } = useDialog();
  const toast = useToast();
  const [updateSettings, { isLoading: isSaving }] = useUpdateMatchAnalyticsSettingsMutation();

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(matchSettingsFormSchema),
    defaultValues: DEFAULT_VALUES,
    mode: 'onChange',
  });

  useEffect(() => {
    reset(settingsToFormValues(settings));
  }, [settings, reset]);

  const onSubmit = async (values) => {
    try {
      await updateSettings({
        matchId,
        wagon_wheel_enabled: values.wagon_wheel_enabled,
        umpires: values.umpires.trim() || null,
        scorers: values.scorers.trim() || null,
        commentators: values.commentators.trim() || null,
      }).unwrap();
      toast.success('Match settings saved.');
      closeDialog();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not save match settings. Please try again.'));
    }
  };

  return (
    <>
      <DialogHeaderRow>
        <DialogTitle className={dialogPrimaryTitleClass}>Match Settings</DialogTitle>
      </DialogHeaderRow>

      <DialogScrollBody>
        <FormStack as="form" id={MATCH_SETTINGS_FORM_ID} onSubmit={handleSubmit(onSubmit)}>
          <FormField label="Wagon Wheel" htmlFor="match-settings-wagon-wheel">
            <div className="flex items-center justify-between gap-3">
              <p className={`${FORM_HELPER_TEXT_CLASS} min-w-0 leading-snug`}>Prompt for shot direction after scoring.</p>
              <Controller
                name="wagon_wheel_enabled"
                control={control}
                render={({ field }) => (
                  <Switch
                    id="match-settings-wagon-wheel"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    aria-label="Enable wagon wheel"
                  />
                )}
              />
            </div>
          </FormField>

          <FormField label="Umpires" htmlFor="match-settings-umpires">
            <Textarea
              id="match-settings-umpires"
              rows={2}
              placeholder="One name per line"
              className="!min-h-[72px] max-w-none resize-none"
              error={errors.umpires?.message}
              {...register('umpires')}
            />
          </FormField>

          <FormField label="Scorers" htmlFor="match-settings-scorers">
            <Textarea
              id="match-settings-scorers"
              rows={2}
              placeholder="One name per line"
              className="!min-h-[72px] max-w-none resize-none"
              error={errors.scorers?.message}
              {...register('scorers')}
            />
          </FormField>

          <FormField label="Commentators" htmlFor="match-settings-commentators">
            <Textarea
              id="match-settings-commentators"
              rows={2}
              placeholder="One name per line"
              className="!min-h-[72px] max-w-none resize-none"
              error={errors.commentators?.message}
              {...register('commentators')}
            />
          </FormField>
        </FormStack>
      </DialogScrollBody>

      <DialogSaveButton form={MATCH_SETTINGS_FORM_ID} type="submit" disabled={isSaving || !isDirty} loading={isSaving}>
        {isSaving ? 'Saving…' : 'Save'}
      </DialogSaveButton>
    </>
  );
}

export default MatchSettingsDialog;
