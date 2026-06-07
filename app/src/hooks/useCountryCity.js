import { useMemo } from 'react';

import { useGetCitiesQuery, useGetCountriesQuery } from '@/store/api/locationApi';

/**
 * Shared country/city fetch + ISO2 derivation for location fields.
 *
 * @param {{ countryName: string, enabled?: boolean }} options
 */
export function useCountryCity({ countryName, enabled = true }) {
  const { data: countries = [] } = useGetCountriesQuery(undefined, {
    skip: !enabled,
  });

  const countryCode = useMemo(
    () => countries.find((c) => c.name === countryName)?.country_code ?? null,
    [countries, countryName],
  );

  const { data: cities = [], isFetching: citiesLoading } = useGetCitiesQuery(countryCode, {
    skip: !enabled || !countryCode,
  });

  return { countries, cities, countryCode, citiesLoading };
}
