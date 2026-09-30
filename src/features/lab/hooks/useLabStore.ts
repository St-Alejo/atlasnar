"use client";

import { useSyncExternalStore } from "react";
import type { LabState, LabStore } from "../labStore";

/** Subscribes a component to a slice of the lab store. */
export function useLabStore<T>(store: LabStore, selector: (state: LabState) => T): T {
  return useSyncExternalStore(
    store.subscribe,
    () => selector(store.getState()),
    () => selector(store.getState()),
  );
}
