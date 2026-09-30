import type { LabFilters } from "./filters";

export interface LabState {
  readonly filters: LabFilters;
  readonly selectedId: string | null;
}

type Listener = () => void;

export interface LabStore {
  getState(): LabState;
  subscribe(listener: Listener): () => void;
  setFilters(patch: Partial<LabFilters>): void;
  select(id: string | null): void;
}

/**
 * Observer: filters, map and list all subscribe to one state object and
 * react to the same changes, without prop-drilling callbacks between them.
 */
export function createLabStore(initialFilters: LabFilters): LabStore {
  let state: LabState = { filters: initialFilters, selectedId: null };
  const listeners = new Set<Listener>();

  const setState = (next: LabState) => {
    state = next;
    listeners.forEach((listener) => listener());
  };

  return {
    getState: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    setFilters(patch) {
      // Changing filters clears the selection: it may no longer be in the results.
      setState({ filters: { ...state.filters, ...patch }, selectedId: null });
    },
    select(id) {
      if (id !== state.selectedId) setState({ ...state, selectedId: id });
    },
  };
}
