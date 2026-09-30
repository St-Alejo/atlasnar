export interface MapPoint {
  readonly id: string;
  readonly lat: number;
  readonly lng: number;
  readonly label: string;
}

export interface PointsMapProps {
  readonly points: readonly MapPoint[];
  readonly center: { readonly lat: number; readonly lng: number };
  readonly zoom: number;
  readonly ariaLabel: string;
  readonly height?: number;
  readonly selectedId?: string | null;
  readonly onSelect?: (id: string) => void;
}
