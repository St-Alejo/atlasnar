import { LazyPointsMap } from "@/components/map/LazyPointsMap";
import type { MapPoint } from "@/components/map/types";
import { ErrorNotice } from "@/components/ui/ErrorNotice";
import { NARINO_REGION } from "@/config/municipalities";
import { formatCoords } from "@/lib/formatters";
import { getDossierOccurrences } from "@/services/dossier.service";

const MAP_HEIGHT = 340;
const NARINO_ZOOM = 8;
const TABLE_ROWS = 10;

export async function OccurrenceMapPanel({ scientificName }: { scientificName: string }) {
  const result = await getDossierOccurrences(scientificName);
  if (!result.ok) return <ErrorNotice error={result.error} />;

  const points = result.value;
  if (points.length === 0) {
    return (
      <p style={{ color: "var(--color-ink-muted)", fontStyle: "italic", padding: "1rem 0" }}>
        No se encontraron registros georreferenciados en Nariño (GBIF).
      </p>
    );
  }

  const mapPoints: MapPoint[] = points.map((p) => ({
    id: p.id,
    lat: p.location.lat,
    lng: p.location.lng,
    label: `${formatCoords(p.location.lat, p.location.lng)}${p.year ? ` · ${p.year}` : ""}`,
  }));

  return (
    <div data-testid="panel-map" className="animate-reveal">
      <p
        style={{
          fontFamily: "var(--font-mono, monospace)",
          fontSize: "0.78rem",
          color: "var(--color-ink-muted)",
          marginBottom: "0.75rem",
        }}
      >
        {points.length} registro{points.length !== 1 ? "s" : ""} en GBIF · Nariño, Colombia
      </p>

      <LazyPointsMap
        points={mapPoints}
        center={NARINO_REGION.center}
        zoom={NARINO_ZOOM}
        height={MAP_HEIGHT}
        ariaLabel={`Mapa con ${points.length} registros de ${scientificName} en Nariño`}
      />

      {/* Text alternative to the map */}
      <details style={{ marginTop: "1rem" }}>
        <summary style={{ cursor: "pointer", fontSize: "0.8rem", color: "var(--color-ink-muted)" }}>
          Ver registros como tabla ({Math.min(points.length, TABLE_ROWS)} de {points.length})
        </summary>
        <div style={{ overflowX: "auto", marginTop: "0.5rem" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "0.78rem",
              fontFamily: "var(--font-mono, monospace)",
            }}
          >
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-paper-deep)" }}>
                {["Coordenadas", "Año", "Tipo de registro"].map((h) => (
                  <th
                    key={h}
                    scope="col"
                    style={{
                      textAlign: "left",
                      padding: "0.3rem 0.5rem",
                      color: "var(--color-ink-muted)",
                      fontWeight: 600,
                      fontSize: "0.65rem",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {points.slice(0, TABLE_ROWS).map((p) => (
                <tr key={p.id} style={{ borderBottom: "1px solid var(--color-paper-deep)" }}>
                  <td style={{ padding: "0.3rem 0.5rem" }}>{formatCoords(p.location.lat, p.location.lng)}</td>
                  <td style={{ padding: "0.3rem 0.5rem" }}>{p.year ?? "—"}</td>
                  <td style={{ padding: "0.3rem 0.5rem", color: "var(--color-ink-muted)" }}>
                    {p.basisOfRecord ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}

export function MapPanelSkeleton() {
  return (
    <div
      data-testid="skeleton-map"
      aria-hidden="true"
      style={{
        height: MAP_HEIGHT + 30,
        borderRadius: "var(--radius-lg)",
        background: "var(--color-paper-deep)",
        animation: "pulse-gentle 1.8s ease-in-out infinite",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--color-ink-muted)",
        fontSize: "0.85rem",
      }}
    >
      🗺️ Cargando distribución…
    </div>
  );
}
