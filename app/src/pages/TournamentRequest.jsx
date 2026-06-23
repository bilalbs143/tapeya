import { useEffect, useMemo } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { useToast } from '@/hooks/useToast';
import { getApiErrorMessage } from '@/lib/apiErrors';
import { DEFAULT_COUNTRY } from '@/lib/constants/geo';
import { toApiDate } from '@/lib/utils/dateUtils';
import { createTournamentRequestSchema } from '@/lib/validations/tournamentRequest';
import { useGetEnumsQuery } from '@/store/api/enumApi';
import { useCreateTournamentRequestMutation } from '@/store/api/tournamentRequestApi';
import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/selectors';
import { Button } from '@/ui/Button';
import { Container } from '@/ui/Container';
import { CountryCityFields } from '@/ui/CountryCityFields';
import { DatePicker } from '@/ui/DatePicker';
import { FormActions } from '@/ui/form/FormActions';
import { FormStack } from '@/ui/form/FormStack';
import { FormField } from '@/ui/FormField';
import { Input } from '@/ui/Input';
import { PhoneInput } from '@/ui/PhoneInput';
import { ToggleGroupField } from '@/ui/ToggleGroupField';

const DEFAULT_VALUES = {
  contact_person_name: '',
  contact_phone: '+92',
  tournament_name: '',
  short_name: '',
  tournament_type: '',
  cricket_format: '',
  venue_name: '',
  start_date: '',
  end_date: '',
  number_of_teams: '',
  country: DEFAULT_COUNTRY,
  city: '',
  match_timings: '',
  prize: '',
  group_mode: 'open',
  number_of_groups: '',
};

export default function TournamentRequest() {
  const navigate = useNavigate();
  const toast = useToast();
  const user = useAppSelector(selectUser);

  const { data: enums = {}, isLoading: enumsLoading } = useGetEnumsQuery();

  const tournamentTypeOptions = enums.tournament_type ?? [];
  const cricketFormatOptions = enums.cricket_format ?? [];
  const matchTimingsOptions = enums.match_timings ?? [];
  const groupModeOptions = Array.isArray(enums.group_mode) ? enums.group_mode : [];

  const tournamentRequestSchema = useMemo(
    () => createTournamentRequestSchema(groupModeOptions.map((o) => o.value)),
    // enums is stable per query result; groupModeOptions is derived from it.
    [enums],
  );

  const [createTournamentRequest, { isLoading: isSubmitting, reset: resetApiError }] = useCreateTournamentRequestMutation();

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(tournamentRequestSchema),
    defaultValues: DEFAULT_VALUES,
    mode: 'onChange',
  });

  const groupMode = watch('group_mode');
  const country = watch('country');
  const city = watch('city');

  // Pre-fill contact details and default enum selections once enums are loaded.
  // Depends on `enums` (not derived arrays) to avoid re-firing on reference changes.
  useEffect(() => {
    if (enumsLoading || tournamentTypeOptions.length === 0) return;
    reset({
      ...DEFAULT_VALUES,
      contact_person_name: user?.name ?? '',
      contact_phone: user?.phone ?? '+92',
      country: user?.country?.trim() || DEFAULT_COUNTRY,
      city: user?.city ?? '',
      tournament_type: tournamentTypeOptions[0]?.value ?? '',
      cricket_format: cricketFormatOptions[0]?.value ?? '',
      match_timings: matchTimingsOptions[0]?.value ?? '',
      group_mode: groupModeOptions[0]?.value ?? 'open',
      prize: '',
    });
  }, [enumsLoading, enums, user?.name, user?.phone, user?.country, user?.city]);

  const onSubmit = async (data) => {
    resetApiError();
    try {
      const number_of_groups =
        data.group_mode === 'group_wise' && data.number_of_groups !== '' ? Number(data.number_of_groups) : 1;

      const payload = {
        ...data,
        start_date: toApiDate(data.start_date),
        end_date: toApiDate(data.end_date),
        number_of_teams: Number(data.number_of_teams),
        number_of_groups,
        ...(data.prize?.trim() ? { prize: data.prize.trim() } : {}),
        ...(data.short_name?.trim() ? { short_name: data.short_name.trim() } : {}),
      };

      const res = await createTournamentRequest(payload).unwrap();
      const tournament = res.data?.tournament;

      if (tournament?.id != null) {
        if (res.message) toast.success(res.message);
        navigate('/organizer/tournaments', { replace: true });
      } else {
        navigate('/tournament-request/success');
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to submit request. Please try again.'));
    }
  };

  const busy = enumsLoading || isSubmitting;

  return (
    <div className="bg-black">
      <AppSubpageHeader title="REQUEST TOURNAMENT" />
      <Container>
        <p className="mb-6 text-left text-[14px] text-white/90 lg:text-center">
          Please fill in the details below to request tournament services. Our team will review your request and contact you
          shortly.
        </p>

        <FormStack
          as="form"
          layout="grid-3"
          className="pb-8 lg:items-start lg:gap-y-4"
          onSubmit={handleSubmit(onSubmit)}
          onFocus={resetApiError}
        >
          <FormField label="Contact Person Name" htmlFor="contact_person_name" required>
            <Input
              id="contact_person_name"
              placeholder="Enter Name"
              autoComplete="name"
              error={errors.contact_person_name?.message}
              {...register('contact_person_name')}
            />
          </FormField>

          <FormField label="Mobile / WhatsApp Number" htmlFor="contact_phone" required>
            <Controller
              name="contact_phone"
              control={control}
              render={({ field }) => (
                <PhoneInput
                  id="contact_phone"
                  placeholder="Enter Phone Number"
                  error={errors.contact_phone?.message}
                  {...field}
                />
              )}
            />
          </FormField>

          <FormField label="Tournament Name" htmlFor="tournament_name" required>
            <Input
              id="tournament_name"
              placeholder="Enter Tournament Name"
              error={errors.tournament_name?.message}
              {...register('tournament_name')}
            />
          </FormField>

          <FormField label="Short Name" htmlFor="short_name">
            <Input
              id="short_name"
              placeholder="e.g. PSL"
              maxLength={64}
              error={errors.short_name?.message}
              {...register('short_name')}
            />
          </FormField>

          <ToggleGroupField
            name="tournament_type"
            control={control}
            label="Tournament Type"
            options={tournamentTypeOptions}
            error={errors.tournament_type?.message}
            required
          />

          <ToggleGroupField
            name="cricket_format"
            control={control}
            label="Cricket Format"
            options={cricketFormatOptions}
            error={errors.cricket_format?.message}
            required
          />

          <FormField label="Number of Teams" htmlFor="number_of_teams" required>
            <Input
              id="number_of_teams"
              inputMode="numeric"
              placeholder="Enter Number of Teams"
              error={errors.number_of_teams?.message}
              {...register('number_of_teams')}
            />
          </FormField>

          <ToggleGroupField
            name="group_mode"
            control={control}
            label="Group Mode"
            options={groupModeOptions}
            error={errors.group_mode?.message}
            required
          />

          {groupMode === 'group_wise' && (
            <div className="max-lg:order-9">
              <FormField label="Number of Groups" htmlFor="number_of_groups" required>
                <Input
                  id="number_of_groups"
                  inputMode="numeric"
                  placeholder="e.g. 2, 4"
                  error={errors.number_of_groups?.message}
                  {...register('number_of_groups')}
                />
              </FormField>
            </div>
          )}

          <div className="max-lg:order-11">
            <ToggleGroupField
              name="match_timings"
              control={control}
              label="Match Timings"
              options={matchTimingsOptions}
              error={errors.match_timings?.message}
              required
            />
          </div>

          <FormField label="Ground / Venue Name" htmlFor="venue_name" required className="max-lg:order-12">
            <Input
              id="venue_name"
              placeholder="Name of the Venue"
              error={errors.venue_name?.message}
              {...register('venue_name')}
            />
          </FormField>

          <CountryCityFields
            country={country ?? ''}
            city={city ?? ''}
            onCountryChange={(v) => setValue('country', v, { shouldValidate: true })}
            onCityChange={(v) => setValue('city', v, { shouldValidate: true })}
            countryLabel="Country"
            cityLabel="City"
            density="relaxed"
            countryError={errors.country?.message}
            cityError={errors.city?.message}
            required
            className="max-lg:order-10 lg:contents"
          />

          <FormField label="Start Date" htmlFor="start_date" required className="max-lg:order-13">
            <Controller
              name="start_date"
              control={control}
              render={({ field }) => (
                <DatePicker
                  id="start_date"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Choose Date"
                  allowFuture
                  error={errors.start_date?.message}
                />
              )}
            />
          </FormField>

          <FormField label="End Date" htmlFor="end_date" required className="max-lg:order-14">
            <Controller
              name="end_date"
              control={control}
              render={({ field }) => (
                <DatePicker
                  id="end_date"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Choose Date"
                  allowFuture
                  error={errors.end_date?.message}
                />
              )}
            />
          </FormField>

          <FormField label="Prize (optional)" htmlFor="prize" className="max-lg:order-15">
            <Input id="prize" placeholder="e.g. Car, Bike, 1 Lakh" error={errors.prize?.message} {...register('prize')} />
          </FormField>

          <FormActions align="start" className="max-lg:order-16 lg:col-span-3">
            <Button type="submit" disabled={busy} variant="auth" className="w-full lg:w-[150px]">
              {isSubmitting ? 'Submitting…' : 'Submit'}
            </Button>
          </FormActions>
        </FormStack>
      </Container>
    </div>
  );
}
