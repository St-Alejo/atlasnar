import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { MUNICIPALITIES, PREBUILT_MUNICIPALITY_COUNT } from "@/config/municipalities";
import { catalogNumberOf, CURATED_SPECIES } from "@/config/species";
import { LOGBOOK_REVALIDATE_SECONDS } from "@/config/timing";

describe("curated configuration", () => {
  it("has unique slugs and scientific names", () => {
    const slugs = CURATED_SPECIES.map((s) => s.slug);
    const names = CURATED_SPECIES.map((s) => s.scientificName);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(new Set(names).size).toBe(names.length);
    expect(new Set(MUNICIPALITIES.map((m) => m.slug)).size).toBe(MUNICIPALITIES.length);
  });

  it("assigns catalogue numbers starting at 1", () => {
    expect(catalogNumberOf(CURATED_SPECIES[0]!.slug)).toBe(1);
  });

  it("prebuilds fewer municipalities than it knows (the rest are lazy ISR)", () => {
    expect(PREBUILT_MUNICIPALITY_COUNT).toBeLessThan(MUNICIPALITIES.length);
  });

  it("keeps the Logbook `revalidate` literal in sync with the named constant", () => {
    // Route segment config must be a literal, so the value is duplicated on purpose.
    const page = readFileSync(join(process.cwd(), "src/app/logbook/[municipality]/page.tsx"), "utf8");
    const match = page.match(/export const revalidate = (\d+);/);
    expect(Number(match?.[1])).toBe(LOGBOOK_REVALIDATE_SECONDS);
  });
});
