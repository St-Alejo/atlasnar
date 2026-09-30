import { domainError, type DomainError } from "@/domain/errors";
import type { Observation, ObservationQuery, TaxonProfile } from "@/domain/models";
import type { ObservationProvider } from "@/domain/ports";
import { err, ok, type Result } from "@/domain/result";
import type { HttpClient } from "@/infrastructure/http";
import { toDomainError } from "../shared/toDomainError";
import { toObservation, toTaxonProfile } from "./observation.mapper";
import {
  iNatObservationSchema,
  iNatPageSchema,
  iNatTaxonDetailSchema,
  iNatTaxonSummarySchema,
} from "./schemas";

export const INAT_BASE_URL = "https://api.inaturalist.org/v1";
const SOURCE = "iNaturalist";
const OPEN_LICENSES = "cc0,cc-by,cc-by-nc,cc-by-sa,cc-by-nc-sa,cc-by-nd,cc-by-nc-nd";
const TAXON_SEARCH_PAGE_SIZE = 5;

export function buildObservationsUrl(query: ObservationQuery): string {
  const params = new URLSearchParams({
    lat: String(query.center.lat),
    lng: String(query.center.lng),
    radius: String(query.radiusKm),
    per_page: String(query.limit),
    order: "desc",
    order_by: "observed_on",
    photos: "true",
    photo_license: OPEN_LICENSES,
    geoprivacy: "open",
  });
  if (query.taxonName) params.set("taxon_name", query.taxonName);
  if (query.group) params.set("iconic_taxa", query.group);
  if (query.from) params.set("d1", query.from);
  if (query.locale) params.set("locale", query.locale);
  return `${INAT_BASE_URL}/observations?${params}`;
}

export class INaturalistProvider implements ObservationProvider {
  constructor(private readonly http: HttpClient) {}

  async getObservations(
    query: ObservationQuery,
    signal?: AbortSignal,
  ): Promise<Result<Observation[], DomainError>> {
    try {
      const raw = await this.http.getJson({ url: buildObservationsUrl(query), signal });
      const page = iNatPageSchema(iNatObservationSchema).parse(raw);
      return ok(page.results.map(toObservation));
    } catch (error) {
      return err(toDomainError(error, SOURCE));
    }
  }

  async getTaxonProfile(
    scientificName: string,
    locale: string,
    signal?: AbortSignal,
  ): Promise<Result<TaxonProfile, DomainError>> {
    try {
      // The search is locale-independent so every language shares one cached call.
      const searchUrl = `${INAT_BASE_URL}/taxa?${new URLSearchParams({
        q: scientificName,
        rank: "species",
        per_page: String(TAXON_SEARCH_PAGE_SIZE),
      })}`;
      const search = iNatPageSchema(iNatTaxonSummarySchema).parse(
        await this.http.getJson({ url: searchUrl, signal }),
      );
      const summary = search.results.find(
        (taxon) => taxon.name.toLowerCase() === scientificName.toLowerCase(),
      );
      if (!summary) return err(domainError("not-found", `${SOURCE}: no taxon named ${scientificName}`));

      const detailUrl = `${INAT_BASE_URL}/taxa/${summary.id}?${new URLSearchParams({ locale })}`;
      const detail = iNatPageSchema(iNatTaxonDetailSchema).parse(
        await this.http.getJson({ url: detailUrl, signal }),
      );
      return ok(toTaxonProfile(summary, detail.results[0] ?? null));
    } catch (error) {
      return err(toDomainError(error, SOURCE));
    }
  }
}
