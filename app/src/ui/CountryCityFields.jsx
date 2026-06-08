import { useCountryCity } from '@/hooks/useCountryCity';
import { COUNTRY_CITY_DENSITY } from '@/lib/constants/formLayout';
import { FormField } from '@/ui/FormField';
import { SearchableSelect } from '@/ui/SearchableSelect';

/**
 * Searchable country + city pair. Works with useState or react-hook-form (watch + setValue).
 *
 * @param {object} props
 * @param {string} props.country
 * @param {string} props.city
 * @param {(value: string) => void} props.onCountryChange
 * @param {(value: string) => void} props.onCityChange
 * @param {string} [props.countryError]
 * @param {string} [props.cityError]
 * @param {boolean} [props.required]
 * @param {boolean} [props.readOnly]
 * @param {boolean} [props.enabled]
 * @param {string} [props.countryLabel]
 * @param {string} [props.cityLabel]
 * @param {string} [props.countryId]
 * @param {string} [props.cityId]
 * @param {string} [props.className]
 * @param {'default' | 'relaxed'} [props.density='default'] — gap between country and city (16px or 24px)
 */
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
  countryId = 'country',
  cityId = 'city',
  className = '',
  density = 'default',
}) {
  const { countries, cities, citiesLoading } = useCountryCity({
    countryName: country,
    enabled,
  });

  const countryOptions = countries.map((c) => ({ value: c.name, label: c.name }));
  const cityOptions = cities.map((c) => ({ value: c.name, label: c.name }));
  const readonlyClass = readOnly ? 'cursor-default opacity-90' : '';

  function handleCountryChange(name) {
    onCountryChange(name);
    onCityChange('');
  }

  const densityClass = COUNTRY_CITY_DENSITY[density] ?? COUNTRY_CITY_DENSITY.default;

  return (
    <div className={`flex flex-col ${densityClass} ${className}`.trim()}>
      <FormField label={countryLabel} htmlFor={countryId} required={required}>
        <SearchableSelect
          id={countryId}
          value={country}
          onChange={handleCountryChange}
          options={countryOptions}
          placeholder="Select Country"
          searchPlaceholder="Search Countries…"
          readOnly={readOnly}
          disabled={readOnly}
          className={readonlyClass}
          ariaLabel="Country"
        />
        {countryError ? (
          <p className="text-sm text-red-200" role="alert">
            {countryError}
          </p>
        ) : null}
      </FormField>

      <FormField label={cityLabel} htmlFor={cityId} required={required}>
        <SearchableSelect
          id={cityId}
          value={city}
          onChange={onCityChange}
          options={cityOptions}
          placeholder="Select City"
          searchPlaceholder="Search Cities…"
          disabled={!country || readOnly}
          loading={citiesLoading && !!country}
          readOnly={readOnly}
          className={readonlyClass}
          ariaLabel="City"
        />
        {cityError ? (
          <p className="text-sm text-red-200" role="alert">
            {cityError}
          </p>
        ) : null}
      </FormField>
    </div>
  );
}
