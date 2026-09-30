import { getDossierOccurrences } from "@/services/dossier.service";
import { formatCoords } from "@/lib/formatters";

export async function OccurrenceMapPanel({ scientificName }: { scientificName: string }) {
  const points = await getDossierOccurrences(scientificName);

  if (points.length === 0) {
    return (
      <p style={{ color: "var(--color-ink-muted)", fontStyle: "italic", padding: "1rem 0" }}>
        No se encontraron registros georreferenciados en Nariño (GBIF).
      </p>
    );
  }

  return (
    <div style={{ animation: "reveal 0.5s ease-out both" }}>
      {/* Simple visual: coloured dots summary + coordinate table */}
      <p
        style={{
          fontFamily: "var(--font-mono, monospace)",
          fontSize: "0.78rem",
          color: "var(--color-ink-muted)",
          marginBottom: "1rem",
        }}
      >
        {points.length} registro{points.length !== 1 ? "s" : ""} en GBIF · Nariño, Colombia
      </p>

      {/* Dot cluster visualisation */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.3rem",
          marginBottom: "1.5rem",
        }}
        aria-label={`${points.length} puntos de ocurrencia`}
      >
        {points.slice(0, 60).map((p) => (
          <div
            key={p.id}
            title={`${formatCoords(p.location.lat, p.location.lng)}${p.year ? ` · ${p.year}` : ""}`}
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "var(--color-moss)",
              opacity: 0.7,
            }}
          />
        ))}
        {points.length > 60 && (
          <span style={{ fontSize: "0.75rem", alignSelf: "center", color: "var(--color-ink-muted)" }}>
            +{points.length - 60} más
          </span>
        )}
      </div>

      {/* Table of recent records */}
      <div style={{ overflowX: "auto" }}>
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
              {["Coordenadas", "Año", "Fuente"].map((h) => (
                <th
                  key={h}
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
            {points.slice(0, 10).map((p) => (
              <tr
                key={p.id}
                style={{ borderBottom: "1px solid color-mix(in srgb, var(--color-paper-deep) 60%, transparent)" }}
              >
                <td style={{ padding: "0.3rem 0.5rem" }}>
                  {formatCoords(p.location.lat, p.location.lng)}
                </td>
                <td style={{ padding: "0.3rem 0.5rem" }}>{p.year ?? "—"}</td>
                <td style={{ padding: "0.3rem 0.5rem", color: "var(--color-ink-muted)" }}>
                  {p.basisOfRecord ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function MapSkeleton() {
  return (
    <div
      style={{
        height: 200,
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
