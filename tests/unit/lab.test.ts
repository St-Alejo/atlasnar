import { describe, expect, it, vi } from "vitest";
import { EMPTY_FILTERS, parseFilters, toSearch } from "@/features/lab/filters";
import { createLabStore } from "@/features/lab/labStore";

describe("lab filters in the URL", () => {
  it("round-trips valid filters", () => {
    const filters = {
      group: "Aves",
      municipality: "pasto",
      taxonName: "Vultur gryphus",
      from: "2025-01-01",
    } as const;
    expect(parseFilters(toSearch(filters))).toEqual(filters);
  });

  it("ignores invalid values instead of failing", () => {
    expect(parseFilters("?group=Dragons&from=yesterday&municipality=Pasto!")).toEqual(EMPTY_FILTERS);
  });

  it("omits empty values", () => {
    expect(toSearch(EMPTY_FILTERS)).toBe("");
    expect(toSearch({ ...EMPTY_FILTERS, taxonName: "  " })).toBe("");
  });
});

describe("lab store (Observer)", () => {
  it("notifies subscribers and clears the selection when filters change", () => {
    const store = createLabStore(EMPTY_FILTERS);
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);

    store.select("42");
    expect(store.getState().selectedId).toBe("42");

    store.setFilters({ group: "Plantae" });
    expect(store.getState()).toEqual({ filters: { ...EMPTY_FILTERS, group: "Plantae" }, selectedId: null });
    expect(listener).toHaveBeenCalledTimes(2);

    unsubscribe();
    store.select("7");
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it("does not notify when selecting the already selected item", () => {
    const store = createLabStore(EMPTY_FILTERS);
    const listener = vi.fn();
    store.subscribe(listener);
    store.select(null);
    expect(listener).not.toHaveBeenCalled();
  });
});
