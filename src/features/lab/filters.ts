import { z } from "zod";
import type { IconicGroup } from "@/domain/models";

export const ICONIC_GROUPS = [
  "Aves",
  "Mammalia",
  "Plantae",
  "Insecta",
  "Amphibia",
  "Reptilia",
  "Fungi",
] as const satisfies readonly IconicGroup[];

export interface LabFilters {
  readonly group: IconicGroup | "";
  readonly municipality: string;
  readonly taxonName: string;
  /** YYYY-MM-DD, or "" for no lower bound. */
  readonly from: string;
}

export const EMPTY_FILTERS: LabFilters = { group: "", municipality: "", taxonName: "", from: "" };

const MAX_TAXON_LENGTH = 80;

// Anything invalid in the URL falls back to "no filter" instead of failing.
const filtersSchema = z.object({
  group: z.enum(ICONIC_GROUPS).optional().catch(undefined),
  municipality: z
    .string()
    .regex(/^[a-z-]+$/)
    .optional()
    .catch(undefined),
  taxon: z.string().trim().max(MAX_TAXON_LENGTH).optional().catch(undefined),
  from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .catch(undefined),
});

/** Reads filters from a query string such as `?group=Aves&from=2025-01-01`. */
export function parseFilters(search: string): LabFilters {
  const raw = Object.fromEntries(new URLSearchParams(search));
  const parsed = filtersSchema.parse(raw);
  return {
    group: parsed.group ?? "",
    municipality: parsed.municipality ?? "",
    taxonName: parsed.taxon ?? "",
    from: parsed.from ?? "",
  };
}

/** Serialises filters back to a query string, omitting empty values. */
export function toSearch(filters: LabFilters): string {
  const params = new URLSearchParams();
  if (filters.group) params.set("group", filters.group);
  if (filters.municipality) params.set("municipality", filters.municipality);
  if (filters.taxonName.trim()) params.set("taxon", filters.taxonName.trim());
  if (filters.from) params.set("from", filters.from);
  const search = params.toString();
  return search ? `?${search}` : "";
}
