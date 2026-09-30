import "server-only";
import type { DomainError } from "@/domain/errors";
import type { Observation, OccurrencePoint, Photo } from "@/domain/models";
import { mapResult, type Result } from "@/domain/result";
import { DOSSIER_PANEL_LATENCY_FACTORS } from "@/config/timing";
import { NARINO_GBIF_FILTER, NARINO_INAT_PLACE_ID, NARINO_REGION } from "@/config/municipalities";
import {
  createOccurrenceProvider,
  createObservationProvider,
  createProfileProvider,
  createTaxonomyProvider,
} from "@/adapters/provider.factory";
import { env } from "@/infrastructure/config/env";

const taxonomy = createTaxonomyProvider();
const occurrences = createOccurrenceProvider();
const profile = createProfileProvider();
const observations = createObservationProvider();

const OCCURRENCE_LIMIT = 300;
const SIGHTINGS_LIMIT = 12;

type PanelKey = keyof typeof DOSSIER_PANEL_LATENCY_FACTORS;

/** Artificial, per-panel delay that makes streaming visible in demo mode. */
async function demoDelay(panel: PanelKey): Promise<void> {
  const ms = env.DEMO_LATENCY_MS * DOSSIER_PANEL_LATENCY_FACTORS[panel];
  if (ms > 0) await new Promise((resolve) => setTimeout(resolve, ms));
}

/** Photos panel: openly licensed iNaturalist taxon photos. */
export async function getDossierPhotos(
  scientificName: string,
): Promise<Result<readonly Photo[], DomainError>> {
  await demoDelay("photos");
  const result = await profile.getTaxonProfile(scientificName, "es");
  return mapResult(result, (taxon) => taxon.photos);
}

/** Map panel: GBIF georeferenced occurrences in Nariño. */
export async function getDossierOccurrences(
  scientificName: string,
): Promise<Result<OccurrencePoint[], DomainError>> {
  await demoDelay("map");
  const match = await taxonomy.matchSpecies(scientificName);
  if (!match.ok) return match;

  return occurrences.getOccurrencePoints({
    taxonKey: match.value.key,
    ...NARINO_GBIF_FILTER,
    limit: OCCURRENCE_LIMIT,
  });
}

/** Sightings panel: recent iNaturalist observations across Nariño. */
export async function getDossierSightings(
  scientificName: string,
): Promise<Result<Observation[], DomainError>> {
  await demoDelay("sightings");
  return observations.getObservations({
    center: NARINO_REGION.center,
    radiusKm: NARINO_REGION.radiusKm,
    placeId: NARINO_INAT_PLACE_ID,
    taxonName: scientificName,
    limit: SIGHTINGS_LIMIT,
    locale: "es",
  });
}
