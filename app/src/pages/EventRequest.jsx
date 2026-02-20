import { Controller, useForm } from 'react-hook-form';

import { Container } from '@/ui/Container';
import { DatePicker } from '@/ui/DatePicker';
import { FormField } from '@/ui/FormField';
import { Input } from '@/ui/Input';
import { PhoneInput } from '@/ui/PhoneInput';
import { ToggleGroup, ToggleGroupItem } from '@/ui/ToggleGroup';

const DEFAULT_VALUES = {
  contactName: '',
  phone: '',
  eventName: '',
  eventType: 'league',
  cricketFormat: 'tape_ball',
  numberOfMatches: '',
  numberOfTeams: '',
  expectedPlayersCount: '',
  city: '',
  matchTimings: 'day',
  venueName: '',
  startDate: '',
  endDate: '',
};

const EVENT_TYPES = [
  { value: 'league', label: 'League' },
  { value: 'tournament', label: 'Tournament' },
  { value: 'friendly', label: 'Friendly Matches' },
];

const CRICKET_FORMATS = [
  { value: 'hard_ball', label: 'Hard Ball' },
  { value: 'tape_ball', label: 'Tape Ball' },
  { value: 'tennis_ball', label: 'Tennis Ball' },
  { value: 'hard_tennis', label: 'Hard Tennis' },
];

const MATCH_TIMINGS = [
  { value: 'day', label: 'Day' },
  { value: 'night', label: 'Night' },
  { value: 'day_night', label: 'Day & Night' },
];

function ToggleGroupField({ name, control, label, options }) {
  return (
    <FormField label={label} htmlFor={name}>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <ToggleGroup
            type="single"
            value={field.value}
            onValueChange={(v) => v != null && field.onChange(v)}
            className="flex flex-wrap gap-2"
          >
            {options.map((opt) => (
              <ToggleGroupItem key={opt.value} value={opt.value} aria-label={opt.label}>
                {opt.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        )}
      />
    </FormField>
  );
}

export default function EventRequest() {
  const { register, control, handleSubmit } = useForm({ defaultValues: DEFAULT_VALUES });

  const onSubmit = (data) => {
    // TODO: submit to API
    void data;
  };

  return (
    <div className="min-h-screen bg-black">
      <Container className="!px-4 !py-0">
        <header className="-mx-4 -mt-6 bg-black px-4 pt-6 pb-4">
          <h1 className="text-center text-[16px] font-bold uppercase tracking-wide text-white">
            REQUEST TOURNAMENT
          </h1>
        </header>

        <p className="mb-6 text-[14px] text-white/90">
          Please fill in the details below to request event services. Our team will review your request and contact you shortly.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-8">
          <FormField label="Contact Person Name:" htmlFor="contactName">
            <Input id="contactName" placeholder="Enter name" autoComplete="name" {...register('contactName')} />
          </FormField>

          <FormField label="Mobile / WhatsApp Number:" htmlFor="phone">
            <Controller
              name="phone"
              control={control}
              render={({ field }) => <PhoneInput id="phone" placeholder="Enter phone number" {...field} />}
            />
          </FormField>

          <FormField label="Event Name:" htmlFor="eventName">
            <Input id="eventName" placeholder="Enter event name" {...register('eventName')} />
          </FormField>

          <ToggleGroupField name="eventType" control={control} label="Event Type:" options={EVENT_TYPES} />
          <ToggleGroupField name="cricketFormat" control={control} label="Cricket Format:" options={CRICKET_FORMATS} />

          <FormField label="Number of Matches:" htmlFor="numberOfMatches">
            <Input id="numberOfMatches" inputMode="numeric" placeholder="Enter number of matches" {...register('numberOfMatches')} />
          </FormField>
          <FormField label="Number of Teams:" htmlFor="numberOfTeams">
            <Input id="numberOfTeams" inputMode="numeric" placeholder="Enter number of teams" {...register('numberOfTeams')} />
          </FormField>
          <FormField label="Expected Players Count:" htmlFor="expectedPlayersCount">
            <Input id="expectedPlayersCount" inputMode="numeric" placeholder="Enter number of expected players" {...register('expectedPlayersCount')} />
          </FormField>

          <FormField label="City:" htmlFor="city">
            <Input id="city" placeholder="Enter city" {...register('city')} />
          </FormField>

          <ToggleGroupField name="matchTimings" control={control} label="Match Timings:" options={MATCH_TIMINGS} />

          <FormField label="Ground / Venue Name:" htmlFor="venueName">
            <Input id="venueName" placeholder="Name of the venue" {...register('venueName')} />
          </FormField>

          <FormField label="Start Date:" htmlFor="startDate">
            <Controller
              name="startDate"
              control={control}
              render={({ field }) => (
                <DatePicker id="startDate" value={field.value} onChange={field.onChange} placeholder="Choose date" allowFuture />
              )}
            />
          </FormField>
          <FormField label="End Date:" htmlFor="endDate">
            <Controller
              name="endDate"
              control={control}
              render={({ field }) => (
                <DatePicker id="endDate" value={field.value} onChange={field.onChange} placeholder="Choose date" allowFuture />
              )}
            />
          </FormField>

          <button
            type="submit"
            className="flex w-full items-center justify-center rounded-[6px] bg-white py-3.5 text-[16px] font-bold text-black transition-opacity active:opacity-90"
          >
            Submit
          </button>
        </form>
      </Container>
    </div>
  );
}
