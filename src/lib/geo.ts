import type { GeoPoint } from "@/domain/models";

export function isValidLatLng(lat: number, lng: number): boolean {
  return Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

/** Parses iNaturalist's "lat,lng" string. Returns null for missing or malformed values. */
export function parseLatLng(value: string | null | undefined): GeoPoint | null {
  if (!value) return null;
  const parts = value.split(",");
  if (parts.length !== 2) return null;
  const lat = Number(parts[0]);
  const lng = Number(parts[1]);
  if (parts.some((part) => part.trim() === "") || !isValidLatLng(lat, lng)) return null;
  return { lat, lng };
}

const EARTH_RADIUS_KM = 6371;
const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

/** Great-circle distance in kilometres (haversine). */
export function distanceKm(a: GeoPoint, b: GeoPoint): number {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(a.lat)) * Math.cos(toRadians(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}
