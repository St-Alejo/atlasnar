"use client";

import "leaflet/dist/leaflet.css";
import { CircleMarker, MapContainer, TileLayer, Tooltip } from "react-leaflet";
import type { PointsMapProps } from "./types";

const DEFAULT_HEIGHT = 360;
const OSM_TILES = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const OSM_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

const MARKER_STYLE = { color: "#1B2A22", weight: 1, fillColor: "#3E5C3A", fillOpacity: 0.75 };
const SELECTED_STYLE = { color: "#1B2A22", weight: 2, fillColor: "#A93A24", fillOpacity: 0.95 };

/**
 * Leaflet map. Needs `window`, so it is only ever loaded through
 * LazyPointsMap (dynamic import with ssr: false). The same data is always
 * rendered as a list next to it, as the text alternative.
 */
export default function PointsMap({
  points,
  center,
  zoom,
  ariaLabel,
  height = DEFAULT_HEIGHT,
  selectedId,
  onSelect,
}: PointsMapProps) {
  return (
    <div role="region" aria-label={ariaLabel} style={{ height }}>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={zoom}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url={OSM_TILES} attribution={OSM_ATTRIBUTION} />
        {points.map((point) => {
          const selected = point.id === selectedId;
          return (
            <CircleMarker
              key={point.id}
              center={[point.lat, point.lng]}
              radius={selected ? 9 : 6}
              pathOptions={selected ? SELECTED_STYLE : MARKER_STYLE}
              eventHandlers={onSelect ? { click: () => onSelect(point.id) } : undefined}
            >
              <Tooltip>{point.label}</Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
