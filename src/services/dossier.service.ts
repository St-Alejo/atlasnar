import "server-only";
import type { Observation, OccurrencePoint, TaxonProfile } from "@/domain/models";
import { DOSSIER_PANEL_LATENCY_FACTORS } from "@/config/timing";
import { NARINO_GBIF_FILTER, NARINO_REGION } from "@/config/municipalities";
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

/** Artificial delay to make streaming visible in demo mode. */
async function demoDelay(factor: number): Promise<void> {
  const ms = env.DEMO_LATENCY_MS * factor;
  if (ms > 0) await new Promise((r) => setTimeout(r, ms));
}

/** Photos panel: iNaturalist taxon profile photos. */
export async function getDossierPhotos(
  scientificName: string,
  signal?: AbortSignal,
): Promise<TaxonProfile["photos"]> {
  await demoDelay(DOSSIER_PANEL_LATENCY_FACTORS.photos);
  const result = await profile.getTaxonProfile(scientificName, "es", signal);
  return result.ok ? result.value.photos : [];
}

/** Map panel: GBIF occurrence points in Nariño. */
export async function getDossierOccurrences(
  scientificName: string,
  signal?: AbortSignal,
): Promise<OccurrencePoint[]> {
  await demoDelay(DOSSIER_PANEL_LATENCY_FACTORS.map);
  const matchResult = await taxonomy.matchSpecies(scientificName, signal);
  if (!matchResult.ok) return [];

  const result = await occurrences.getOccurrencePoints(
    {
      taxonKey: matchResult.value.key,
      ...NARINO_GBIF_FILTER,
      limit: 200,
    },
    signal,
  );
  return result.ok ? result.value : [];
}

/** Sightings panel: recent iNaturalist observations in the Nariño region. */
export async function getDossierSightings(
  scientificName: string,
  signal?: AbortSignal,
): Promise<Observation[]> {
  await demoDelay(DOSSIER_PANEL_LATENCY_FACTORS.sightings);
  const result = await observations.getObservations(
    {
      center: NARINO_REGION.center,
      radiusKm: NARINO_REGION.radiusKm,
      taxonName: scientificName,
      limit: 12,
      locale: "es",
    },
    signal,
  );
  return result.ok ? result.value : [];
}
