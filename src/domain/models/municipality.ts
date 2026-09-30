import type { GeoPoint } from "./geo";

export interface Municipality {
  readonly slug: string;
  readonly name: string;
  readonly center: GeoPoint;
  readonly radiusKm: number;
  readonly altitudeM: number;
}
