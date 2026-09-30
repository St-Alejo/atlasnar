import { describe, expect, it } from "vitest";
import { toOccurrencePoint, toTaxonomyMatch } from "@/adapters/gbif/gbif.mapper";
import { GbifProvider } from "@/adapters/gbif/GbifProvider";

describe("GBIF mappers", () => {
  it("maps an exact backbone match", () => {
    expect(
      toTaxonomyMatch({
        usageKey: 2433401,
        scientificName: "Tremarctos ornatus (F.G.Cuvier, 1825)",
        canonicalName: "Tremarctos ornatus",
        matchType: "EXACT",
        status: "ACCEPTED",
        kingdom: "Animalia",
        family: "Ursidae",
      }),
    ).toMatchObject({ key: 2433401, canonicalName: "Tremarctos ornatus", family: "Ursidae", order: null });
  });

  it("treats NONE matches or missing keys as no match", () => {
    expect(toTaxonomyMatch({ matchType: "NONE" })).toBeNull();
    expect(toTaxonomyMatch({ matchType: "FUZZY", usageKey: null })).toBeNull();
  });

  it("drops occurrences without valid coordinates", () => {
    expect(toOccurrencePoint({ key: 1 })).toBeNull();
    expect(toOccurrencePoint({ key: 2, decimalLatitude: 95, decimalLongitude: 0 })).toBeNull();
    expect(toOccurrencePoint({ key: 3, decimalLatitude: 1.2, decimalLongitude: -77.3, year: 2020 })).toEqual({
      id: "3",
      location: { lat: 1.2, lng: -77.3 },
      year: 2020,
      basisOfRecord: null,
    });
  });
});

describe("GbifProvider", () => {
  it("filters invalid points out of an occurrence page", async () => {
    const provider = new GbifProvider({
      getJson: async () => ({
        count: 2,
        results: [{ key: 1, decimalLatitude: 1, decimalLongitude: -77 }, { key: 2 }],
      }),
    });
    const result = await provider.getOccurrencePoints({
      taxonKey: 1,
      countryCode: "CO",
      stateProvince: "Nariño",
      limit: 10,
    });
    expect(result.ok && result.value.map((p) => p.id)).toEqual(["1"]);
  });

  it("returns not-found for an unknown name", async () => {
    const provider = new GbifProvider({ getJson: async () => ({ matchType: "NONE" }) });
    const result = await provider.matchSpecies("Nonexistent species");
    expect(!result.ok && result.error.kind).toBe("not-found");
  });
});
