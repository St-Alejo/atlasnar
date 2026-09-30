import type { GeoPoint, Municipality } from "@/domain/models";

/** Ordered by expected traffic: the first entries are prebuilt by the Logbook. */
export const MUNICIPALITIES: readonly Municipality[] = [
  { slug: "pasto", name: "Pasto", center: { lat: 1.2136, lng: -77.2811 }, radiusKm: 15, altitudeM: 2527 },
  { slug: "ipiales", name: "Ipiales", center: { lat: 0.8303, lng: -77.6444 }, radiusKm: 15, altitudeM: 2898 },
  { slug: "tumaco", name: "Tumaco", center: { lat: 1.8067, lng: -78.7647 }, radiusKm: 20, altitudeM: 2 },
  { slug: "tuquerres", name: "Túquerres", center: { lat: 1.0864, lng: -77.6175 }, radiusKm: 12, altitudeM: 3104 },
  { slug: "la-cruz", name: "La Cruz", center: { lat: 1.6017, lng: -76.9711 }, radiusKm: 12, altitudeM: 2525 },
  { slug: "sandona", name: "Sandoná", center: { lat: 1.2847, lng: -77.4731 }, radiusKm: 10, altitudeM: 1848 },
  { slug: "barbacoas", name: "Barbacoas", center: { lat: 1.6717, lng: -78.1406 }, radiusKm: 20, altitudeM: 32 },
] as const;

/** Municipalities rendered at build time; the rest are generated on first visit. */
export const PREBUILT_MUNICIPALITY_COUNT = 2;

export function findMunicipality(slug: string): Municipality | undefined {
  return MUNICIPALITIES.find((municipality) => municipality.slug === slug);
}

/** A circle that covers the department of Nariño, used for region-wide queries. */
export const NARINO_REGION: { readonly center: GeoPoint; readonly radiusKm: number } = {
  center: { lat: 1.45, lng: -77.75 },
  radiusKm: 130,
};

export const NARINO_GBIF_FILTER = { countryCode: "CO", stateProvince: "Nariño" } as const;
