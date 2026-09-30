"use client";

import { useEffect, useState } from "react";
import { getBrowserObservationProvider } from "@/adapters/browser.factory";
import { findMunicipality, NARINO_INAT_PLACE_ID, NARINO_REGION } from "@/config/municipalities";
import type { DomainError } from "@/domain/errors";
import type { Observation, ObservationQuery } from "@/domain/models";
import type { LabFilters } from "../filters";

const RESULT_LIMIT = 30;

export type ObservationsState =
  | { readonly status: "loading" }
  | { readonly status: "success"; readonly data: Observation[]; readonly fetchedAt: string }
  | { readonly status: "error"; readonly error: DomainError };

export function toObservationQuery(filters: LabFilters): ObservationQuery {
  const municipality = filters.municipality ? findMunicipality(filters.municipality) : undefined;
  const area = municipality ?? NARINO_REGION;
  return {
    center: area.center,
    radiusKm: area.radiusKm,
    placeId: NARINO_INAT_PLACE_ID,
    group: filters.group || undefined,
    taxonName: filters.taxonName.trim() || undefined,
    from: filters.from || undefined,
    limit: RESULT_LIMIT,
    locale: "es",
  };
}

/**
 * Fetches observations from the browser. Every new set of filters aborts
 * the previous request ("latest wins"), and requests go through the
 * client-side rate-limited queue of the browser provider.
 */
export function useObservations(filters: LabFilters): ObservationsState {
  const key = JSON.stringify(filters);
  // The settled response is stored with the key it belongs to; while the
  // current key has no response yet, the state is derived as "loading".
  const [settled, setSettled] = useState<{ key: string; state: ObservationsState } | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const query = toObservationQuery(JSON.parse(key) as LabFilters);

    getBrowserObservationProvider()
      .getObservations(query, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return;
        setSettled({
          key,
          state: result.ok
            ? { status: "success", data: result.value, fetchedAt: new Date().toISOString() }
            : { status: "error", error: result.error },
        });
      })
      .catch((error: unknown) => {
        // Adapters return expected failures as values; only aborts (stale
        // requests, ignored) or programming errors end up here.
        if (controller.signal.aborted) return;
        setSettled({
          key,
          state: {
            status: "error",
            error: { kind: "upstream", message: error instanceof Error ? error.message : String(error) },
          },
        });
      });

    return () => controller.abort();
  }, [key]);

  return settled?.key === key ? settled.state : { status: "loading" };
}
