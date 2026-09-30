import { z } from "zod";

export const gbifMatchSchema = z.object({
  usageKey: z.number().nullish(),
  scientificName: z.string().nullish(),
  canonicalName: z.string().nullish(),
  matchType: z.string(),
  status: z.string().nullish(),
  kingdom: z.string().nullish(),
  order: z.string().nullish(),
  family: z.string().nullish(),
});

export const gbifOccurrenceSchema = z.object({
  key: z.number(),
  decimalLatitude: z.number().nullish(),
  decimalLongitude: z.number().nullish(),
  year: z.number().nullish(),
  basisOfRecord: z.string().nullish(),
});

export const gbifOccurrencePageSchema = z.object({
  count: z.number().nullish(),
  results: z.array(gbifOccurrenceSchema),
});

export type GbifMatchDto = z.infer<typeof gbifMatchSchema>;
export type GbifOccurrenceDto = z.infer<typeof gbifOccurrenceSchema>;
