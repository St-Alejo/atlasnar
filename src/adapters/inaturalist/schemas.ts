import { z } from "zod";

// Only the fields the app reads. Everything optional-ish is `.nullish()`:
// external data is never trusted to be complete.

export const iNatPhotoSchema = z.object({
  id: z.number(),
  url: z.string().nullish(),
  license_code: z.string().nullish(),
  attribution: z.string().nullish(),
  original_dimensions: z.object({ width: z.number(), height: z.number() }).nullish(),
});

export const iNatTaxonSummarySchema = z.object({
  id: z.number(),
  name: z.string(),
  rank: z.string().nullish(),
  preferred_common_name: z.string().nullish(),
  iconic_taxon_name: z.string().nullish(),
  observations_count: z.number().nullish(),
  wikipedia_url: z.string().nullish(),
  default_photo: iNatPhotoSchema.nullish(),
  conservation_status: z.object({ status: z.string().nullish() }).nullish(),
});

export const iNatTaxonDetailSchema = iNatTaxonSummarySchema.extend({
  wikipedia_summary: z.string().nullish(),
  taxon_photos: z.array(z.object({ photo: iNatPhotoSchema })).nullish(),
});

export const iNatObservationSchema = z.object({
  id: z.number(),
  observed_on: z.string().nullish(),
  location: z.string().nullish(),
  place_guess: z.string().nullish(),
  uri: z.string().nullish(),
  user: z.object({ login: z.string().nullish(), name: z.string().nullish() }).nullish(),
  taxon: iNatTaxonSummarySchema
    .pick({
      name: true,
      preferred_common_name: true,
      iconic_taxon_name: true,
    })
    .nullish(),
  photos: z.array(iNatPhotoSchema).nullish(),
});

export const iNatPageSchema = <T extends z.ZodType>(item: T) =>
  z.object({
    total_results: z.number().nullish(),
    results: z.array(item),
  });

export type INatPhotoDto = z.infer<typeof iNatPhotoSchema>;
export type INatTaxonSummaryDto = z.infer<typeof iNatTaxonSummarySchema>;
export type INatTaxonDetailDto = z.infer<typeof iNatTaxonDetailSchema>;
export type INatObservationDto = z.infer<typeof iNatObservationSchema>;
