import { useCountryCity } from '@/shared/hooks/useCountryCity';
import { cn } from '@/shared/lib/cn';
import { FormRow } from '@/shared/ui/Form';
import { SelectField, SelectItem } from '@/shared/ui/Select';

export type CountryCityFieldsProps = {
  country: string;
  city: string;
  onCountryChange: (value: string) => void;
  onCityChange: (value: string) => void;
  countryError?: string | undefined;
  cityError?: string | undefined;
  required?: boolean | undefined;
  readOnly?: boolean | undefined;
  enabled?: boolean | undefined;
  countryLabel?: string | undefined;
  cityLabel?: string | undefined;
  className?: string | undefined;
  triggerClassName?: string | undefined;
  layout?: 'stack' | 'row' | undefined;
  showCountry?: boolean | undefined;
  showCity?: boolean | undefined;
};

/** Country/city names from countries API — wire values are names, not IDs. */
export function CountryCityFields({
  country,
  city,
  onCountryChange,
  onCityChange,
  countryError,
  cityError,
  required = false,
  readOnly = false,
  enabled = true,
  countryLabel = 'Country',
  cityLabel = 'City',
  className,
  triggerClassName,
  layout = 'stack',
  showCountry = true,
  showCity = true,
}: CountryCityFieldsProps) {
  const { countries, cities, citiesLoading } = useCountryCity({
    countryName: country,
    enabled,
  });

  function handleCountryChange(name: string) {
    onCountryChange(name);
    onCityChange('');
  }

  const cityNames = cities.map((c) => c.name);
  const cityOrphan = city && !cityNames.includes(city) ? city : null;

  const fields = (
    <>
      {showCountry ? (
        <SelectField
          label={countryLabel}
          required={required}
          {...(country ? { value: country } : {})}
          onValueChange={handleCountryChange}
          disabled={readOnly || !enabled}
          error={countryError}
          placeholder="Select Country"
          triggerClassName={triggerClassName}
        >
          {countries.map((c) => (
            <SelectItem key={c.countryCode} value={c.name}>
              {c.name}
            </SelectItem>
          ))}
        </SelectField>
      ) : null}

      {showCity ? (
        <SelectField
          label={cityLabel}
          required={required}
          {...(city ? { value: city } : {})}
          onValueChange={onCityChange}
          disabled={readOnly || !enabled || !country}
          error={cityError}
          hint={
            cityError ? undefined : !country ? 'Select a Country First.' : citiesLoading ? 'Loading Cities…' : undefined
          }
          placeholder={citiesLoading && country ? 'Loading…' : 'Select City'}
          triggerClassName={triggerClassName}
        >
          {cityOrphan ? <SelectItem value={cityOrphan}>{cityOrphan}</SelectItem> : null}
          {cities.map((c) => (
            <SelectItem key={c.id} value={c.name}>
              {c.name}
            </SelectItem>
          ))}
        </SelectField>
      ) : null}
    </>
  );

  if (layout === 'row') {
    return <FormRow className={className}>{fields}</FormRow>;
  }

  return <div className={cn('flex flex-col gap-3', className)}>{fields}</div>;
}
