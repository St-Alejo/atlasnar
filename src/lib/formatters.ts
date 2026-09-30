/** Pure formatting utilities — no framework imports. */

/**
 * A fixed time zone keeps server and browser output identical (no hydration
 * mismatch) and shows times as they are in Nariño.
 */
export const DISPLAY_TIME_ZONE = "America/Bogota";

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/** Format an ISO date string into a Spanish locale date. */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "Fecha desconocida";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    // "2026-08-15" is parsed as UTC midnight: format it in UTC so the day does not shift.
    timeZone: DATE_ONLY.test(iso) ? "UTC" : DISPLAY_TIME_ZONE,
  }).format(date);
}

/** Format an ISO datetime showing date + time (with seconds) in 24-h format. */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: DISPLAY_TIME_ZONE,
  }).format(date);
}

/** "hace 5 minutos", "hace 3 horas", etc. `now` is injectable for tests. */
export function formatRelativeTime(iso: string | null | undefined, now: number = Date.now()): string {
  if (!iso) return "";
  const diff = now - new Date(iso).getTime();
  const rtf = new Intl.RelativeTimeFormat("es", { numeric: "auto" });
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 365 * 24 * 60 * 60 * 1000],
    ["month", 30 * 24 * 60 * 60 * 1000],
    ["day", 24 * 60 * 60 * 1000],
    ["hour", 60 * 60 * 1000],
    ["minute", 60 * 1000],
    ["second", 1000],
  ];
  for (const [unit, ms] of units) {
    if (Math.abs(diff) >= ms) return rtf.format(-Math.round(diff / ms), unit);
  }
  return rtf.format(0, "second");
}

/** Format decimal coordinates as DMS string: 1°12'49"N 77°16'52"W */
export function formatCoords(lat: number, lng: number): string {
  const fmt = (deg: number, pos: string, neg: string) => {
    const abs = Math.abs(deg);
    const d = Math.floor(abs);
    const m = Math.floor((abs - d) * 60);
    const s = Math.round(((abs - d) * 60 - m) * 60);
    return `${d}°${m}'${s}"${deg >= 0 ? pos : neg}`;
  };
  return `${fmt(lat, "N", "S")} ${fmt(lng, "E", "W")}`;
}

/** Altitude in metres formatted with unit. */
export function formatAltitude(metres: number): string {
  return `${metres.toLocaleString("es-CO")} m s.n.m.`;
}

/** Capitalise every word of a scientific name: "tremarctos ornatus" → "Tremarctos ornatus" */
export function capitaliseScientific(name: string): string {
  if (!name) return name;
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

/** Museum-style catalogue number: 7 → "N.º 0007" */
export function formatCatalogNumber(n: number): string {
  return `N.º ${String(n).padStart(4, "0")}`;
}

/** Clamp a number between min and max. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
