import type { GeoPoint } from "./geo";
import type { Photo } from "./photo";

export type IconicGroup =
  | "Aves"
  | "Mammalia"
  | "Plantae"
  | "Insecta"
  | "Amphibia"
  | "Reptilia"
  | "Fungi";

export interface Observation {
  readonly id: string;
  readonly observedAt: string | null;
  readonly location: GeoPoint | null;
  readonly placeGuess: string | null;
  readonly photo: Photo | null;
  readonly uri: string | null;
  readonly observer: string | null;
  readonly species: {
    readonly scientificName: string;
    readonly commonName: string | null;
    readonly group: string | null;
  };
}

export interface ObservationQuery {
  readonly center: GeoPoint;
  readonly radiusKm: number;
  readonly taxonName?: string;
  readonly group?: IconicGroup;
  /** ISO date (YYYY-MM-DD): only observations on or after this day. */
  readonly from?: string;
  readonly limit: number;
  readonly locale?: string;
}

/** A georeferenced record from GBIF, used to draw distribution maps. */
export interface OccurrencePoint {
  readonly id: string;
  readonly location: GeoPoint;
  readonly year: number | null;
  readonly basisOfRecord: string | null;
}

export interface OccurrenceQuery {
  readonly taxonKey: number;
  readonly countryCode: string;
  readonly stateProvince: string;
  readonly limit: number;
}
