import { useEffect, useMemo } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';

import { useToast } from '@/hooks/useToast';
import { getApiErrorMessage } from '@/lib/apiErrors';
import { tournamentRequestSchema } from '@/lib/validations/tournamentRequest';
import { useGetEnumsQuery } from '@/store/api/enumApi';
import {
  useGetCitiesQuery,
  useGetCountriesQuery,
} from '@/store/api/locationApi';
import { useCreateTournamentRequestMutation } from '@/store/api/tournamentRequestApi';
import { useAppSelector } from '@/store/hooks';
import { Container } from '@/ui/Container';
import { DatePicker } from '@/ui/DatePicker';
import { FormField } from '@/ui/FormField';
import { Input } from '@/ui/Input';
import { PhoneInput } from '@/ui/PhoneInput';
import {
  Select,
  SelectContent,
  selectContentInputClass,
  SelectItem,
  selectItemInputClass,
  SelectTrigger,
  selectTriggerInputClass,
  SelectValue,
  selectViewportInputClass,
} from '@/ui/Select';
import { ToggleGroup, ToggleGroupItem } from '@/ui/ToggleGroup';

const DEFAULT_VALUES = {
  contact_person_name: '',
  contact_phone: '+92',
  tournament_name: '',
  tournament_type: '',
  cricket_format: '',
  venue_name: '',
  start_date: '',
  end_date: '',
  number_of_matches: '',
  number_of_teams: '',
  expected_players_count: '',
  country: '',
  city: '',
  match_timings: '',
  prize: '',
};

function ToggleGroupField({ name, control, label, options, error, required }) {
  return (
    <FormField label={label} htmlFor={name} required={required}>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <>
            <ToggleGroup
              type="single"
              value={field.value}
              onValueChange={(v) => v != null && field.onChange(v)}
              className="flex flex-wrap gap-2"
              aria-invalid={error ? 'true' : undefined}
            >
              {options.map((opt) => (
                <ToggleGroupItem
                  key={opt.value}
                  value={opt.value}
                  aria-label={opt.label}
                >
                  {opt.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            {error && (
              <p className="text-sm text-red-200" role="alert">
                {error}
              </p>
            )}
          </>
        )}
      />
    </FormField>
  );
}

export default function TournamentRequest() {
  const toast = useToast();
  const user = useAppSelector((state) => state.auth?.user);
  const { data: enums = {}, isLoading: enumsLoading } = useGetEnumsQuery();
  const [
    createTournamentRequest,
    { isLoading: isSubmitting, reset: resetApiError },
  ] = useCreateTournamentRequestMutation();

  const tournamentTypeOptions = useMemo(
    () => enums.tournament_type ?? [],
    [enums.tournament_type],
  );
  const cricketFormatOptions = useMemo(
    () => enums.cricket_format ?? [],
    [enums.cricket_format],
  );
  const matchTimingsOptions = useMemo(
    () => enums.match_timings ?? [],
    [enums.match_timings],
  );

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

  const selectedCountryName = watch('country');
  const { data: countriesList = [] } = useGetCountriesQuery();
  const selectedCountry = countriesList.find(
    (c) => c.name === selectedCountryName,
  );
  const countryCode = selectedCountry?.country_code ?? null;
  const { data: citiesList = [] } = useGetCitiesQuery(countryCode, {
    skip: !countryCode,
  });

  useEffect(() => {
    if (enumsLoading || tournamentTypeOptions.length === 0) return;
    reset({
      ...DEFAULT_VALUES,
      contact_person_name: user?.name ?? '',
      contact_phone: user?.phone ?? '+92',
      country: user?.country ?? '',
      city: user?.city ?? '',
      tournament_type: tournamentTypeOptions[0]?.value ?? '',
      cricket_format: cricketFormatOptions[0]?.value ?? '',
      match_timings: matchTimingsOptions[0]?.value ?? '',
      prize: '',
    });
  }, [
    enumsLoading,
    tournamentTypeOptions,
    cricketFormatOptions,
    matchTimingsOptions,
    user?.name,
    user?.phone,
    user?.country,
    user?.city,
    reset,
  ]);

  /** Convert MM-DD-YYYY (DatePicker) to YYYY-MM-DD (API). */
  const toApiDate = (value) => {
    if (!value || typeof value !== 'string') return value;
    const [mm, dd, yyyy] = value.split(/[-/]/);
    return yyyy && mm && dd ? `${yyyy}-${mm}-${dd}` : value;
  };

  const onSubmit = async (data) => {
    resetApiError();
    try {
      const payload = {
        ...data,
        start_date: toApiDate(data.start_date),
        end_date: toApiDate(data.end_date),
        number_of_matches: Number(data.number_of_matches),
        number_of_teams: Number(data.number_of_teams),
        expected_players_count: Number(data.expected_players_count),
        ...(data.prize != null && String(data.prize).trim() !== ''
          ? { prize: String(data.prize).trim() }
          : {}),
      };
      await createTournamentRequest(payload).unwrap();
      toast.success(
        'Request submitted successfully. We will contact you shortly.',
      );
      reset({
        ...DEFAULT_VALUES,
        contact_person_name: user?.name ?? '',
        contact_phone: user?.phone ?? '+92',
        country: user?.country ?? '',
        city: user?.city ?? '',
        tournament_type: tournamentTypeOptions[0]?.value ?? '',
        cricket_format: cricketFormatOptions[0]?.value ?? '',
        match_timings: matchTimingsOptions[0]?.value ?? '',
        prize: '',
      });
    } catch (err) {
      console.error('Tournament request failed:', err);
      toast.error(
        getApiErrorMessage(err, 'Failed to submit request. Please try again.'),
      );
    }
  };

  const busy = enumsLoading || isSubmitting;

  return (
    <div className="bg-black">
      <Container className="!px-4 !py-0">
        <header className="-mx-4 -mt-6 bg-black px-4 pt-6 pb-4">
          <h1 className="text-center text-[16px] font-bold tracking-wide text-white uppercase">
            REQUEST TOURNAMENT
          </h1>
        </header>

        <p className="mb-6 text-[14px] text-white/90">
          Please fill in the details below to request tournament services. Our
          team will review your request and contact you shortly.
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          onFocus={() => resetApiError()}
          className="space-y-6 pb-8"
        >
          <FormField
            label="Contact Person Name:"
            htmlFor="contact_person_name"
            required
          >
            <Input
              id="contact_person_name"
              placeholder="Enter Name"
              autoComplete="name"
              error={errors.contact_person_name?.message}
              {...register('contact_person_name')}
            />
          </FormField>

          <FormField
            label="Mobile / WhatsApp Number:"
            htmlFor="contact_phone"
            required
          >
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

          <FormField
            label="Tournament Name:"
            htmlFor="tournament_name"
            required
          >
            <Input
              id="tournament_name"
              placeholder="Enter Tournament Name"
              error={errors.tournament_name?.message}
              {...register('tournament_name')}
            />
          </FormField>

          <ToggleGroupField
            name="tournament_type"
            control={control}
            label="Tournament Type:"
            options={tournamentTypeOptions}
            error={errors.tournament_type?.message}
            required
          />
          <ToggleGroupField
            name="cricket_format"
            control={control}
            label="Cricket Format:"
            options={cricketFormatOptions}
            error={errors.cricket_format?.message}
            required
          />

          <FormField
            label="Number of Matches:"
            htmlFor="number_of_matches"
            required
          >
            <Input
              id="number_of_matches"
              inputMode="numeric"
              placeholder="Enter Number of Matches"
              error={errors.number_of_matches?.message}
              {...register('number_of_matches')}
            />
          </FormField>
          <FormField
            label="Number of Teams:"
            htmlFor="number_of_teams"
            required
          >
            <Input
              id="number_of_teams"
              inputMode="numeric"
              placeholder="Enter Number of Teams"
              error={errors.number_of_teams?.message}
              {...register('number_of_teams')}
            />
          </FormField>
          <FormField
            label="Expected Players Count:"
            htmlFor="expected_players_count"
            required
          >
            <Input
              id="expected_players_count"
              inputMode="numeric"
              placeholder="Enter Number of Expected Players"
              error={errors.expected_players_count?.message}
              {...register('expected_players_count')}
            />
          </FormField>

          <FormField label="Country:" htmlFor="country" required>
            <Controller
              name="country"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value || ''}
                  onValueChange={(val) => {
                    field.onChange(val);
                    setValue('city', '');
                  }}
                >
                  <SelectTrigger
                    id="country"
                    className={selectTriggerInputClass}
                    aria-label="Country"
                  >
                    <SelectValue placeholder="Select Country" />
                  </SelectTrigger>
                  <SelectContent
                    className={selectContentInputClass}
                    viewportClassName={selectViewportInputClass}
                    position="popper"
                  >
                    {countriesList.map((c) => (
                      <SelectItem
                        key={c.country_code}
                        value={c.name}
                        className={selectItemInputClass}
                        textClassName="!text-white"
                        indicatorClassName="!text-white"
                      >
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>
          {errors.country?.message && (
            <p className="text-sm text-red-200" role="alert">
              {errors.country.message}
            </p>
          )}

          <FormField label="City:" htmlFor="city" required>
            <Controller
              name="city"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value || ''}
                  onValueChange={field.onChange}
                  disabled={!countryCode}
                >
                  <SelectTrigger
                    id="city"
                    className={selectTriggerInputClass}
                    aria-label="City"
                    disabled={!countryCode}
                  >
                    <SelectValue placeholder="Select City" />
                  </SelectTrigger>
                  <SelectContent
                    className={selectContentInputClass}
                    viewportClassName={selectViewportInputClass}
                    position="popper"
                  >
                    {citiesList.map((c) => (
                      <SelectItem
                        key={c.id}
                        value={c.name}
                        className={selectItemInputClass}
                        textClassName="!text-white"
                        indicatorClassName="!text-white"
                      >
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>
          {errors.city?.message && (
            <p className="text-sm text-red-200" role="alert">
              {errors.city.message}
            </p>
          )}

          <ToggleGroupField
            name="match_timings"
            control={control}
            label="Match Timings:"
            options={matchTimingsOptions}
            error={errors.match_timings?.message}
            required
          />

          <FormField label="Ground / Venue Name:" htmlFor="venue_name" required>
            <Input
              id="venue_name"
              placeholder="Name of the Venue"
              error={errors.venue_name?.message}
              {...register('venue_name')}
            />
          </FormField>

          <FormField label="Start Date:" htmlFor="start_date" required>
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
                />
              )}
            />
            {errors.start_date?.message && (
              <p className="text-sm text-red-200" role="alert">
                {errors.start_date.message}
              </p>
            )}
          </FormField>
          <FormField label="End Date:" htmlFor="end_date" required>
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
                />
              )}
            />
            {errors.end_date?.message && (
              <p className="text-sm text-red-200" role="alert">
                {errors.end_date.message}
              </p>
            )}
          </FormField>

          <FormField label="Prize (optional):" htmlFor="prize">
            <Input
              id="prize"
              placeholder="e.g. Car, Bike, 1 Lakh"
              error={errors.prize?.message}
              {...register('prize')}
            />
          </FormField>

          <button
            type="submit"
            disabled={busy}
            className="flex w-full items-center justify-center rounded-[6px] bg-white py-3.5 text-[16px] font-bold text-black transition-opacity active:opacity-90 disabled:opacity-60"
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      </Container>
    </div>
  );
}
