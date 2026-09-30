import type { OccurrencePoint, TaxonomyMatch } from "@/domain/models";
import { isValidLatLng } from "@/lib/geo";
import type { GbifMatchDto, GbifOccurrenceDto } from "./schemas";

/** Returns null when GBIF could not match the name to its backbone. */
export function toTaxonomyMatch(raw: GbifMatchDto): TaxonomyMatch | null {
  if (raw.matchType === "NONE" || raw.usageKey == null) return null;
  return {
    key: raw.usageKey,
    scientificName: raw.scientificName ?? raw.canonicalName ?? "",
    canonicalName: raw.canonicalName ?? raw.scientificName ?? "",
    kingdom: raw.kingdom ?? null,
    order: raw.order ?? null,
    family: raw.family ?? null,
    status: raw.status ?? null,
  };
}

export function toOccurrencePoint(raw: GbifOccurrenceDto): OccurrencePoint | null {
  const lat = raw.decimalLatitude;
  const lng = raw.decimalLongitude;
  if (lat == null || lng == null || !isValidLatLng(lat, lng)) return null;
  return {
    id: String(raw.key),
    location: { lat, lng },
    year: raw.year ?? null,
    basisOfRecord: raw.basisOfRecord ?? null,
  };
}
