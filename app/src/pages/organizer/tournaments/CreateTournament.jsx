import { useEffect, useMemo } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { useToast } from '@/hooks/useToast';
import { getApiErrorMessage } from '@/lib/apiErrors';
import { DEFAULT_COUNTRY } from '@/lib/constants/geo';
import { toApiDate } from '@/lib/utils/dateUtils';
import { buildCreateTournamentPayload, createCreateTournamentSchema } from '@/lib/validations/createTournament';
import { useGetEnumsQuery } from '@/store/api/enumApi';
import { useCreateTournamentMutation } from '@/store/api/tournamentApi';
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
import { ToggleGroupField } from '@/ui/ToggleGroupField';

const DEFAULT_VALUES = {
  tournament_name: '',
  short_name: '',
  tournament_type: 'open_tournament',
  venue_name: '',
  start_date: '',
  end_date: '',
  number_of_teams: '',
  country: DEFAULT_COUNTRY,
  city: '',
  prize: '',
  group_mode: 'open',
  number_of_groups: '',
};

export default function CreateTournament() {
  const navigate = useNavigate();
  const toast = useToast();
  const user = useAppSelector(selectUser);

  const { data: enums = {}, isLoading: enumsLoading } = useGetEnumsQuery();
  const tournamentTypeOptions = enums.tournament_type ?? [];
  const groupModeOptions = Array.isArray(enums.group_mode) ? enums.group_mode : [];

  const schema = useMemo(() => createCreateTournamentSchema(groupModeOptions.map((o) => o.value)), [enums]);

  const [createTournament, { isLoading: isSubmitting }] = useCreateTournamentMutation();

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: DEFAULT_VALUES,
    mode: 'onChange',
  });

  const groupMode = watch('group_mode');
  const country = watch('country');
  const city = watch('city');

  useEffect(() => {
    if (enumsLoading || tournamentTypeOptions.length === 0) return;
    reset({
      ...DEFAULT_VALUES,
      country: user?.country?.trim() || DEFAULT_COUNTRY,
      city: user?.city ?? '',
      tournament_type: tournamentTypeOptions[0]?.value ?? 'open_tournament',
      group_mode: groupModeOptions[0]?.value ?? 'open',
    });
  }, [enumsLoading, enums, user?.country, user?.city, reset]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...buildCreateTournamentPayload(data),
        start_date: toApiDate(data.start_date),
        end_date: toApiDate(data.end_date),
      };

      const res = await createTournament(payload).unwrap();
      toast.success('Tournament created.');
      const id = res?.data?.id ?? res?.id;
      navigate(id ? `/organizer/tournaments/${id}/create-team-intro` : '/organizer/tournaments', { replace: true });
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not create tournament.'));
    }
  };

  const busy = enumsLoading || isSubmitting;

  return (
    <div className="bg-black">
      <AppSubpageHeader title="CREATE TOURNAMENT" />
      <Container>
        <p className="mb-6 text-left text-[14px] text-white/90 lg:text-center">
          Fill in your tournament details below. Once created, you can add teams and start scoring right away.
        </p>

        <FormStack as="form" layout="grid-3" className="pb-8 lg:items-start lg:gap-y-4" onSubmit={handleSubmit(onSubmit)}>
          <FormField label="Tournament Name" htmlFor="tournament_name" required>
            <Input
              id="tournament_name"
              placeholder="Enter Tournament Name"
              error={errors.tournament_name?.message}
              {...register('tournament_name')}
            />
          </FormField>

          <FormField label="Short Name" htmlFor="short_name" required>
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

          <FormField label="Prize" htmlFor="prize" className="max-lg:order-15">
            <Input id="prize" placeholder="e.g. Car, Bike, 1 Lakh" error={errors.prize?.message} {...register('prize')} />
          </FormField>

          <FormActions align="start" className="max-lg:order-16 lg:col-span-3">
            <Button type="submit" disabled={busy} loading={isSubmitting} variant="orange" className="w-full lg:w-[180px]">
              {isSubmitting ? 'Creating…' : 'Create Tournament'}
            </Button>
          </FormActions>
        </FormStack>
      </Container>
    </div>
  );
}
