import "server-only";
import type { Species } from "@/domain/models";
import { unwrapOr } from "@/domain/result";
import { findCuratedSpecies, catalogNumberOf, CURATED_SPECIES } from "@/config/species";
import {
  createTaxonomyProvider,
  createProfileProvider,
} from "@/adapters/provider.factory";

const taxonomy = createTaxonomyProvider();
const profile = createProfileProvider();

/**
 * Fetch a species by slug: merge curated data + GBIF taxonomy + iNaturalist profile.
 * Returns null for unknown slugs.
 */
export async function getSpeciesBySlug(slug: string): Promise<Species | null> {
  const curated = findCuratedSpecies(slug);
  if (!curated) return null;

  const catalogNumber = catalogNumberOf(slug);

  const [taxonomyResult, profileResult] = await Promise.allSettled([
    taxonomy.matchSpecies(curated.scientificName),
    profile.getTaxonProfile(curated.scientificName, "es"),
  ]);

  const taxonomyMatch =
    taxonomyResult.status === "fulfilled" && taxonomyResult.value.ok
      ? taxonomyResult.value.value
      : null;

  const taxonProfile =
    profileResult.status === "fulfilled" && profileResult.value.ok
      ? profileResult.value.value
      : null;

  return {
    slug: curated.slug,
    catalogNumber,
    scientificName: curated.scientificName,
    commonName:
      taxonProfile?.commonName ?? curated.commonName.es,
    emblem: curated.emblem,
    thermalFloor: curated.thermalFloor,
    taxonomy: taxonomyMatch,
    profile: taxonProfile,
  };
}

/** All slugs for generateStaticParams. */
export function getAllSpeciesSlugs(): { slug: string }[] {
  return CURATED_SPECIES.map(({ slug }) => ({ slug }));
}

/** Lightweight list for the Herbarium grid: no profile fetches needed. */
export async function getAllSpeciesForList(): Promise<
  { slug: string; scientificName: string; commonName: string; emblem: string; thermalFloor: string; catalogNumber: number }[]
> {
  return CURATED_SPECIES.map((s, i) => ({
    slug: s.slug,
    scientificName: s.scientificName,
    commonName: s.commonName.es,
    emblem: s.emblem,
    thermalFloor: s.thermalFloor,
    catalogNumber: i + 1,
  }));
}

// Suppress unused-import warning for unwrapOr (used indirectly)
void unwrapOr;
