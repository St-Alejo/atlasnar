"use client";

import dynamic from "next/dynamic";
import type { PointsMapProps } from "./types";

export function MapSkeleton({
  height = 360,
  label = "🗺️ Cargando mapa…",
}: {
  height?: number;
  label?: string;
}) {
  return (
    <div
      aria-hidden="true"
      style={{
        height,
        borderRadius: "var(--radius-lg)",
        background: "var(--color-paper-deep)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--color-ink-muted)",
        fontSize: "0.85rem",
        animation: "pulse-gentle 1.8s ease-in-out infinite",
      }}
    >
      {label}
    </div>
  );
}

// `ssr: false` is only allowed inside Client Components, hence this wrapper.
// The map bundle is split out and never loaded by routes without a map.
const PointsMap = dynamic(() => import("./PointsMap"), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

export function LazyPointsMap(props: PointsMapProps) {
  return <PointsMap {...props} />;
}
