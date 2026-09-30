import type { DomainError } from "../errors";
import type { OccurrencePoint, OccurrenceQuery, TaxonomyMatch } from "../models";
import type { Result } from "../result";

/** Taxonomic backbone and georeferenced occurrence records (implemented by GBIF). */
export interface TaxonomyProvider {
  matchSpecies(scientificName: string, signal?: AbortSignal): Promise<Result<TaxonomyMatch, DomainError>>;
  getOccurrencePoints(
    query: OccurrenceQuery,
    signal?: AbortSignal,
  ): Promise<Result<OccurrencePoint[], DomainError>>;
}
