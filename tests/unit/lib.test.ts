import { describe, expect, it } from "vitest";
import { err, mapResult, ok, unwrapOr } from "@/domain/result";
import { altitudeAtProgress, MAX_ALTITUDE_M } from "@/lib/altitude";
import {
  formatCatalogNumber,
  formatCoords,
  formatDate,
  formatDateTime,
  formatRelativeTime,
} from "@/lib/formatters";
import { distanceKm, isValidLatLng, parseLatLng } from "@/lib/geo";
import { stripHtml, truncate } from "@/lib/text";

describe("Result", () => {
  it("unwraps and maps", () => {
    expect(unwrapOr(ok(1), 0)).toBe(1);
    expect(unwrapOr(err("x"), 0)).toBe(0);
    expect(mapResult(ok(2), (n) => n * 2)).toEqual(ok(4));
    expect(mapResult(err("x"), (n: number) => n * 2)).toEqual(err("x"));
  });
});

describe("geo", () => {
  it("parses iNaturalist locations", () => {
    expect(parseLatLng("1.2136,-77.2811")).toEqual({ lat: 1.2136, lng: -77.2811 });
    expect(parseLatLng(null)).toBeNull();
    expect(parseLatLng("abc")).toBeNull();
    expect(parseLatLng("1,")).toBeNull();
    expect(parseLatLng("100,0")).toBeNull();
  });

  it("validates coordinates", () => {
    expect(isValidLatLng(0, 0)).toBe(true);
    expect(isValidLatLng(Number.NaN, 0)).toBe(false);
    expect(isValidLatLng(0, 181)).toBe(false);
  });

  it("measures distance between Pasto and Ipiales (~50 km)", () => {
    const km = distanceKm({ lat: 1.2136, lng: -77.2811 }, { lat: 0.8303, lng: -77.6444 });
    expect(km).toBeGreaterThan(55);
    expect(km).toBeLessThan(65);
  });
});

describe("formatters", () => {
  it("does not shift date-only values to the previous day", () => {
    expect(formatDate("2026-08-15")).toContain("15");
  });

  it("formats datetimes in Colombian time, identically everywhere", () => {
    // 17:00 UTC is 12:00 in Bogotá (UTC-5).
    expect(formatDateTime("2026-09-29T17:00:00.000Z")).toMatch(/12:00:00/);
  });

  it("formats relative time against an injected clock", () => {
    const now = Date.parse("2026-09-29T12:00:00Z");
    expect(formatRelativeTime("2026-09-29T11:59:30Z", now)).toMatch(/30 segundos/);
    expect(formatRelativeTime("2026-09-29T09:00:00Z", now)).toMatch(/3 horas/);
  });

  it("formats catalogue numbers and coordinates", () => {
    expect(formatCatalogNumber(7)).toBe("N.º 0007");
    expect(formatCoords(1.2136, -77.2811)).toBe("1°12'49\"N 77°16'52\"W");
  });
});

describe("text", () => {
  it("strips tags and decodes entities", () => {
    expect(stripHtml("<p>El <b>oso</b>&nbsp;de&#32;anteojos &amp; más</p>")).toBe("El oso de anteojos & más");
  });

  it("truncates on word boundaries", () => {
    expect(truncate("oso de anteojos", 50)).toBe("oso de anteojos");
    expect(truncate("oso de anteojos andino", 12)).toBe("oso de…");
  });
});

describe("altitude gauge", () => {
  it("descends from the top of Nariño to sea level", () => {
    expect(altitudeAtProgress(0)).toBe(MAX_ALTITUDE_M);
    expect(altitudeAtProgress(1)).toBe(0);
    expect(altitudeAtProgress(0.5)).toBe(MAX_ALTITUDE_M / 2);
    expect(altitudeAtProgress(2)).toBe(0);
  });
});
