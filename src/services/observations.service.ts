import "server-only";
import type { Observation } from "@/domain/models";
import { findMunicipality, NARINO_REGION } from "@/config/municipalities";
import { createObservationProvider } from "@/adapters/provider.factory";

const observations = createObservationProvider();

const DEFAULT_LIMIT = 20;

/** Recent observations for a given municipality slug (Logbook / ISR). */
export async function getRecentByMunicipality(
  municipalitySlug: string,
  limit = DEFAULT_LIMIT,
): Promise<Observation[]> {
  const muni = findMunicipality(municipalitySlug);
  if (!muni) return [];

  const result = await observations.getObservations({
    center: muni.center,
    radiusKm: muni.radiusKm,
    limit,
    locale: "es",
  });

  return result.ok ? result.value : [];
}

/** Observations near a point with optional filters (Radar / SSR). */
export async function getNearbyObservations(params: {
  lat: number;
  lng: number;
  radius: number;
  limit?: number;
}): Promise<Observation[]> {
  const result = await observations.getObservations({
    center: { lat: params.lat, lng: params.lng },
    radiusKm: params.radius,
    limit: params.limit ?? DEFAULT_LIMIT,
    locale: "es",
  });

  return result.ok ? result.value : [];
}

/** Region-wide observations for a given taxon name (Dossier sightings panel). */
export async function getSightingsBySpecies(
  scientificName: string,
  limit = 15,
  signal?: AbortSignal,
): Promise<Observation[]> {
  const result = await observations.getObservations(
    {
      center: NARINO_REGION.center,
      radiusKm: NARINO_REGION.radiusKm,
      taxonName: scientificName,
      limit,
      locale: "es",
    },
    signal,
  );

  return result.ok ? result.value : [];
}
