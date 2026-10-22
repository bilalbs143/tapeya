import { useMemo } from 'react';

import { useGetCitiesQuery, useGetCountriesQuery } from '@/shared/api/locationApi';

/** Country/city queries — match selected country name → ISO2 → cities. */
export function useCountryCity({ countryName, enabled = true }: { countryName: string; enabled?: boolean }) {
  const { data: countries = [], isLoading: countriesLoading } = useGetCountriesQuery(undefined, {
    skip: !enabled,
  });

  const countryCode = useMemo(
    () => countries.find((c) => c.name === countryName)?.countryCode ?? null,
    [countries, countryName]
  );

  const { data: cities = [], isFetching: citiesLoading } = useGetCitiesQuery(countryCode ?? '', {
    skip: !enabled || !countryCode,
  });

  return { countries, cities, countryCode, countriesLoading, citiesLoading };
}
