import "server-only";
import type { DomainError } from "@/domain/errors";
import { domainError } from "@/domain/errors";
import type { Observation } from "@/domain/models";
import { err, type Result } from "@/domain/result";
import { findMunicipality, NARINO_INAT_PLACE_ID } from "@/config/municipalities";
import { createObservationProvider } from "@/adapters/provider.factory";

const observations = createObservationProvider();

const DEFAULT_LIMIT = 20;
const LOCALE = "es";

export type ObservationsResult = Result<Observation[], DomainError>;

/** Recent observations for a given municipality slug (Logbook / ISR). */
export async function getRecentByMunicipality(
  municipalitySlug: string,
  limit = DEFAULT_LIMIT,
): Promise<ObservationsResult> {
  const muni = findMunicipality(municipalitySlug);
  if (!muni) return err(domainError("not-found", `Unknown municipality: ${municipalitySlug}`));

  return observations.getObservations({
    center: muni.center,
    radiusKm: muni.radiusKm,
    placeId: NARINO_INAT_PLACE_ID,
    limit,
    locale: LOCALE,
  });
}

/** Observations near a point (Radar / SSR). */
export async function getNearbyObservations(params: {
  lat: number;
  lng: number;
  radius: number;
  limit?: number;
}): Promise<ObservationsResult> {
  return observations.getObservations({
    center: { lat: params.lat, lng: params.lng },
    radiusKm: params.radius,
    limit: params.limit ?? DEFAULT_LIMIT,
    locale: LOCALE,
  });
}
