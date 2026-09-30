/** Named timing constants: no magic numbers in pages or services. */

// Route segment `revalidate` must be a literal, so pages repeat the number
// and a unit test checks both values stay in sync.
export const LOGBOOK_REVALIDATE_SECONDS = 60;

export const HTTP_TIMEOUT_MS = 8_000;
export const HTTP_RETRIES = 2;

/** iNaturalist asks clients to stay around one request per second. */
export const INAT_QUEUE = { concurrency: 1, minIntervalMs: 1_000 } as const;
/** GBIF rate-limits bursts aggressively (HTTP 429), so it gets its own lane. */
export const GBIF_QUEUE = { concurrency: 1, minIntervalMs: 700 } as const;
/** Browser-side queue for the Field Lab. */
export const LAB_QUEUE = { concurrency: 1, minIntervalMs: 1_000 } as const;

/** Taxonomy and profiles barely change: cache them in memory for an hour. */
export const TAXONOMY_CACHE_TTL_MS = 60 * 60 * 1_000;

/** Field Lab filter debounce. */
export const FILTER_DEBOUNCE_MS = 400;

/**
 * Multipliers applied to DEMO_LATENCY_MS for each dossier panel, so the
 * panels resolve at clearly different times (2000 ms → 800 / 1600 / 2600 ms).
 */
export const DOSSIER_PANEL_LATENCY_FACTORS = {
  photos: 0.4,
  map: 0.8,
  sightings: 1.3,
} as const;
