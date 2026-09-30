import { describe, expect, it } from "vitest";
import { buildObservationsUrl, INaturalistProvider } from "@/adapters/inaturalist/INaturalistProvider";
import { toObservation, toPhoto, toTaxonProfile } from "@/adapters/inaturalist/observation.mapper";
import { HttpError, type HttpClient } from "@/infrastructure/http";

const photo = {
  id: 7,
  url: "https://inaturalist-open-data.s3.amazonaws.com/photos/7/square.jpg",
  license_code: "cc-by-nc",
  attribution: "(c) Someone, some rights reserved (CC BY-NC)",
  original_dimensions: { width: 2048, height: 1366 },
};

describe("iNaturalist mappers", () => {
  it("maps a complete observation", () => {
    const observation = toObservation({
      id: 1,
      observed_on: "2026-08-15",
      location: "1.2136,-77.2811",
      place_guess: "Pasto, Nariño",
      uri: "https://www.inaturalist.org/observations/1",
      user: { login: "naturalist", name: "Ana" },
      taxon: {
        name: "Tremarctos ornatus",
        preferred_common_name: "Oso de anteojos",
        iconic_taxon_name: "Mammalia",
      },
      photos: [photo],
    });

    expect(observation).toMatchObject({
      id: "1",
      observedAt: "2026-08-15",
      location: { lat: 1.2136, lng: -77.2811 },
      observer: "Ana",
      species: { scientificName: "Tremarctos ornatus", commonName: "Oso de anteojos", group: "Mammalia" },
    });
    expect(observation.photo?.url).toMatch(/\/medium\.jpg$/);
    expect(observation.photo?.thumbUrl).toMatch(/\/square\.jpg$/);
  });

  it("tolerates missing fields", () => {
    const observation = toObservation({ id: 2 });
    expect(observation).toEqual({
      id: "2",
      observedAt: null,
      location: null,
      placeGuess: null,
      photo: null,
      uri: null,
      observer: null,
      species: { scientificName: "Unknown", commonName: null, group: null },
    });
  });

  it("drops photos without an open license", () => {
    expect(toPhoto({ ...photo, license_code: null })).toBeNull();
    expect(toPhoto({ ...photo, url: null })).toBeNull();
    expect(toPhoto(undefined)).toBeNull();
    expect(toPhoto(photo)?.license).toBe("CC-BY-NC");
  });

  it("builds a profile with a de-duplicated gallery and plain-text summary", () => {
    const summary = { id: 41657, name: "Tremarctos ornatus", default_photo: photo };
    const profile = toTaxonProfile(summary, {
      ...summary,
      preferred_common_name: "Oso de anteojos",
      wikipedia_summary: "El <b>oso de anteojos</b> &amp; su h&aacute;bitat",
      conservation_status: { status: "vu" },
      taxon_photos: [{ photo }, { photo: { ...photo, id: 8 } }],
    });

    expect(profile.photos.map((p) => p.id)).toEqual(["7", "8"]);
    expect(profile.summary).toBe("El oso de anteojos & su h&aacute;bitat");
    expect(profile.conservationStatus).toBe("VU");
    expect(profile.commonName).toBe("Oso de anteojos");
  });
});

describe("buildObservationsUrl", () => {
  it("includes only the filters that are set", () => {
    const url = new URL(
      buildObservationsUrl({
        center: { lat: 1, lng: -77 },
        radiusKm: 10,
        limit: 5,
        group: "Aves",
        from: "2025-01-01",
      }),
    );
    expect(url.searchParams.get("iconic_taxa")).toBe("Aves");
    expect(url.searchParams.get("d1")).toBe("2025-01-01");
    expect(url.searchParams.get("radius")).toBe("10");
    expect(url.searchParams.has("taxon_name")).toBe(false);
    expect(url.searchParams.has("place_id")).toBe(false);
  });

  it("restricts the circle to an administrative place when given", () => {
    const url = new URL(
      buildObservationsUrl({ center: { lat: 1, lng: -77 }, radiusKm: 130, placeId: 12737, limit: 5 }),
    );
    expect(url.searchParams.get("place_id")).toBe("12737");
  });
});

describe("INaturalistProvider", () => {
  const stub = (impl: HttpClient["getJson"]): HttpClient => ({ getJson: impl });

  it("returns typed errors instead of throwing", async () => {
    const provider = new INaturalistProvider(
      stub(async ({ url }) => {
        throw new HttpError(429, url);
      }),
    );
    const result = await provider.getObservations({ center: { lat: 0, lng: 0 }, radiusKm: 1, limit: 1 });
    expect(result).toEqual({ ok: false, error: expect.objectContaining({ kind: "rate-limited" }) });
  });

  it("reports an unexpected response shape as invalid-data", async () => {
    const provider = new INaturalistProvider(stub(async () => ({ results: "nope" })));
    const result = await provider.getObservations({ center: { lat: 0, lng: 0 }, radiusKm: 1, limit: 1 });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.kind).toBe("invalid-data");
  });

  it("resolves a profile through the exact scientific-name match", async () => {
    const provider = new INaturalistProvider(
      stub(async ({ url }) =>
        url.includes("/taxa?")
          ? {
              results: [
                { id: 1, name: "Tremarctos" },
                { id: 41657, name: "Tremarctos ornatus" },
              ],
            }
          : {
              results: [{ id: 41657, name: "Tremarctos ornatus", preferred_common_name: "Oso de anteojos" }],
            },
      ),
    );
    const result = await provider.getTaxonProfile("Tremarctos ornatus", "es");
    expect(result.ok && result.value.id).toBe(41657);
    expect(result.ok && result.value.commonName).toBe("Oso de anteojos");
  });

  it("returns not-found when no taxon matches exactly", async () => {
    const provider = new INaturalistProvider(stub(async () => ({ results: [{ id: 1, name: "Other" }] })));
    const result = await provider.getTaxonProfile("Tremarctos ornatus", "es");
    expect(!result.ok && result.error.kind).toBe("not-found");
  });
});
