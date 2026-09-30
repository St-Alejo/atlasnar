import type { DomainError } from "../errors";
import type { Observation, ObservationQuery, TaxonProfile } from "../models";
import type { Result } from "../result";

/** Citizen-science observations and taxon profiles (implemented by iNaturalist). */
export interface ObservationProvider {
  getObservations(query: ObservationQuery, signal?: AbortSignal): Promise<Result<Observation[], DomainError>>;
  getTaxonProfile(
    scientificName: string,
    locale: string,
    signal?: AbortSignal,
  ): Promise<Result<TaxonProfile, DomainError>>;
}
