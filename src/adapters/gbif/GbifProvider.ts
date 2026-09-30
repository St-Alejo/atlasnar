import { domainError, type DomainError } from "@/domain/errors";
import type { OccurrencePoint, OccurrenceQuery, TaxonomyMatch } from "@/domain/models";
import type { TaxonomyProvider } from "@/domain/ports";
import { err, ok, type Result } from "@/domain/result";
import type { HttpClient } from "@/infrastructure/http";
import { toDomainError } from "../shared/toDomainError";
import { toOccurrencePoint, toTaxonomyMatch } from "./gbif.mapper";
import { gbifMatchSchema, gbifOccurrencePageSchema } from "./schemas";

export const GBIF_BASE_URL = "https://api.gbif.org/v1";
const SOURCE = "GBIF";

export class GbifProvider implements TaxonomyProvider {
  constructor(private readonly http: HttpClient) {}

  async matchSpecies(
    scientificName: string,
    signal?: AbortSignal,
  ): Promise<Result<TaxonomyMatch, DomainError>> {
    try {
      const url = `${GBIF_BASE_URL}/species/match?${new URLSearchParams({ name: scientificName })}`;
      const match = toTaxonomyMatch(gbifMatchSchema.parse(await this.http.getJson({ url, signal })));
      return match ? ok(match) : err(domainError("not-found", `${SOURCE}: no match for ${scientificName}`));
    } catch (error) {
      return err(toDomainError(error, SOURCE));
    }
  }

  async getOccurrencePoints(
    query: OccurrenceQuery,
    signal?: AbortSignal,
  ): Promise<Result<OccurrencePoint[], DomainError>> {
    try {
      const params = new URLSearchParams({
        taxonKey: String(query.taxonKey),
        country: query.countryCode,
        stateProvince: query.stateProvince,
        hasCoordinate: "true",
        hasGeospatialIssue: "false",
        limit: String(query.limit),
      });
      const url = `${GBIF_BASE_URL}/occurrence/search?${params}`;
      const page = gbifOccurrencePageSchema.parse(await this.http.getJson({ url, signal }));
      return ok(
        page.results.map(toOccurrencePoint).filter((point): point is OccurrencePoint => point !== null),
      );
    } catch (error) {
      return err(toDomainError(error, SOURCE));
    }
  }
}
