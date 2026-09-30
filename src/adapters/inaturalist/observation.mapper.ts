import type { Observation, Photo, TaxonProfile } from "@/domain/models";
import { parseLatLng } from "@/lib/geo";
import { stripHtml } from "@/lib/text";
import type {
  INatObservationDto,
  INatPhotoDto,
  INatTaxonDetailDto,
  INatTaxonSummaryDto,
} from "./schemas";

const PHOTO_SIZE_PATTERN = /\/(square|thumb|small|medium|large|original)\.(\w+)(\?.*)?$/;

function resizePhotoUrl(url: string, size: "square" | "medium" | "large"): string {
  return url.replace(PHOTO_SIZE_PATTERN, `/${size}.$2$3`);
}

/**
 * Only openly licensed photos are shown. iNaturalist reports
 * "all rights reserved" photos with a null license code.
 */
export function toPhoto(raw: INatPhotoDto | null | undefined): Photo | null {
  if (!raw?.url || !raw.license_code) return null;
  return {
    id: String(raw.id),
    thumbUrl: resizePhotoUrl(raw.url, "square"),
    url: resizePhotoUrl(raw.url, "medium"),
    largeUrl: resizePhotoUrl(raw.url, "large"),
    width: raw.original_dimensions?.width ?? null,
    height: raw.original_dimensions?.height ?? null,
    license: raw.license_code.toUpperCase(),
    attribution: raw.attribution ?? "iNaturalist",
  };
}

export function toObservation(raw: INatObservationDto): Observation {
  const photo = (raw.photos ?? []).map(toPhoto).find((candidate) => candidate !== null) ?? null;
  return {
    id: String(raw.id),
    observedAt: raw.observed_on ?? null,
    location: parseLatLng(raw.location),
    placeGuess: raw.place_guess ?? null,
    photo,
    uri: raw.uri ?? null,
    observer: raw.user?.name || raw.user?.login || null,
    species: {
      scientificName: raw.taxon?.name ?? "Unknown",
      commonName: raw.taxon?.preferred_common_name ?? null,
      group: raw.taxon?.iconic_taxon_name ?? null,
    },
  };
}

const MAX_PROFILE_PHOTOS = 6;

export function toTaxonProfile(
  summary: INatTaxonSummaryDto,
  detail: INatTaxonDetailDto | null,
): TaxonProfile {
  const source = detail ?? summary;
  const gallery = (detail?.taxon_photos ?? []).map(({ photo }) => toPhoto(photo));
  const photos = [toPhoto(source.default_photo), ...gallery]
    .filter((photo): photo is Photo => photo !== null)
    .filter((photo, index, all) => all.findIndex((other) => other.id === photo.id) === index)
    .slice(0, MAX_PROFILE_PHOTOS);

  return {
    id: source.id,
    scientificName: source.name,
    commonName: source.preferred_common_name ?? null,
    summary: detail?.wikipedia_summary ? stripHtml(detail.wikipedia_summary) : null,
    conservationStatus: source.conservation_status?.status?.toUpperCase() ?? null,
    observationsCount: source.observations_count ?? null,
    wikipediaUrl: source.wikipedia_url ?? null,
    photos,
  };
}
