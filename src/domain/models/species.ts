import type { Photo } from "./photo";

export type Emblem = "mammal" | "bird" | "plant";
export type ThermalFloor = "coast" | "cloud-forest" | "paramo";

/** Taxonomic backbone data (GBIF). */
export interface TaxonomyMatch {
  readonly key: number;
  readonly scientificName: string;
  readonly canonicalName: string;
  readonly kingdom: string | null;
  readonly order: string | null;
  readonly family: string | null;
  readonly status: string | null;
}

/** Natural-history profile of a taxon (iNaturalist). */
export interface TaxonProfile {
  readonly id: number;
  readonly scientificName: string;
  readonly commonName: string | null;
  readonly summary: string | null;
  readonly conservationStatus: string | null;
  readonly observationsCount: number | null;
  readonly wikipediaUrl: string | null;
  readonly photos: readonly Photo[];
}

/** The aggregate the UI works with: curated data enriched with both sources. */
export interface Species {
  readonly slug: string;
  readonly catalogNumber: number;
  readonly scientificName: string;
  readonly commonName: string;
  readonly emblem: Emblem;
  readonly thermalFloor: ThermalFloor;
  readonly taxonomy: TaxonomyMatch | null;
  readonly profile: TaxonProfile | null;
}
