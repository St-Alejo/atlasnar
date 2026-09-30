/** Highest point in Nariño (Cumbal volcano is ~4,764 m); the gauge starts just above. */
export const MAX_ALTITUDE_M = 4800;
export const MIN_ALTITUDE_M = 0;

/** Maps scroll progress (0 = top, 1 = bottom) to an altitude, rounded to 10 m. */
export function altitudeAtProgress(progress: number): number {
  const clamped = Math.min(Math.max(progress, 0), 1);
  const altitude = MAX_ALTITUDE_M - clamped * (MAX_ALTITUDE_M - MIN_ALTITUDE_M);
  return Math.round(altitude / 10) * 10;
}
