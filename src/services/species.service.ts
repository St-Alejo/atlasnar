import "server-only";
import { cache } from "react";
import type { Species } from "@/domain/models";
import { unwrapOr } from "@/domain/result";
import { CURATED_SPECIES, catalogNumberOf, findCuratedSpecies, type CuratedSpecies } from "@/config/species";
import { createProfileProvider, createTaxonomyProvider } from "@/adapters/provider.factory";

const taxonomy = createTaxonomyProvider();
const profile = createProfileProvider();

const LOCALE = "es";

/** Curated data only, with no network calls: used where speed matters (shells, metadata, lists). */
function toBaseSpecies(curated: CuratedSpecies): Species {
  return {
    slug: curated.slug,
    catalogNumber: catalogNumberOf(curated.slug),
    scientificName: curated.scientificName,
    commonName: curated.commonName.es,
    emblem: curated.emblem,
    thermalFloor: curated.thermalFloor,
    taxonomy: null,
    profile: null,
  };
}

export function getCuratedSpecies(slug: string): Species | null {
  const curated = findCuratedSpecies(slug);
  return curated ? toBaseSpecies(curated) : null;
}

/**
 * Curated data enriched with GBIF taxonomy and the iNaturalist profile.
 * Each source degrades independently: if an API fails, the page still
 * renders with the curated data (so the build never breaks).
 */
// React `cache` dedupes calls within one render (generateMetadata + page).
export const getSpeciesBySlug = cache(async (slug: string): Promise<Species | null> => {
  const curated = findCuratedSpecies(slug);
  if (!curated) return null;

  const [taxonomyResult, profileResult] = await Promise.all([
    taxonomy.matchSpecies(curated.scientificName),
    profile.getTaxonProfile(curated.scientificName, LOCALE),
  ]);
  const taxonProfile = unwrapOr(profileResult, null);

  return {
    ...toBaseSpecies(curated),
    commonName: taxonProfile?.commonName ?? curated.commonName.es,
    taxonomy: unwrapOr(taxonomyResult, null),
    profile: taxonProfile,
  };
});

/** All slugs for generateStaticParams. */
export function getAllSpeciesSlugs(): { slug: string }[] {
  return CURATED_SPECIES.map(({ slug }) => ({ slug }));
}

/** Lightweight list for the Herbarium grid: no network calls. */
export function getAllSpeciesForList(): Species[] {
  return CURATED_SPECIES.map(toBaseSpecies);
}
