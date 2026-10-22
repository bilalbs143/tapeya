import { z } from 'zod';

export const DEFAULT_COUNTRY = 'Pakistan';

export const countryWireSchema = z.object({
  id: z.number(),
  name: z.string(),
  country_code: z.string(),
});

export const cityWireSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export type Country = {
  id: number;
  name: string;
  countryCode: string;
};

export type City = {
  id: number;
  name: string;
};

export function mapCountry(wire: z.infer<typeof countryWireSchema>): Country {
  return {
    id: wire.id,
    name: wire.name,
    countryCode: wire.country_code,
  };
}

export function mapCity(wire: z.infer<typeof cityWireSchema>): City {
  return {
    id: wire.id,
    name: wire.name,
  };
}
