import { z } from "zod";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { RenderTelemetry } from "@/components/telemetry/RenderTelemetry";
import { ObservationList } from "@/features/logbook/ObservationList";
import { LocateMeButton } from "@/features/radar/LocateMeButton";
import { ContourBackground } from "@/components/ui/ContourBackground";
import { getNearbyObservations } from "@/services/observations.service";
import { formatCoords } from "@/lib/formatters";

// Every request gets fresh data — no caching
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Field Radar · Búsqueda por ubicación",
  description:
    "Observaciones de biodiversidad cerca de ti, generadas en el servidor en cada petición (SSR).",
};

const searchSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().min(1).max(50).default(15),
});

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function RadarPage({ searchParams }: PageProps) {
  const parsed = searchSchema.safeParse(await searchParams);
  const generatedAt = new Date().toISOString();

  return (
    <>
      <Header />
      <main id="main-content">
        {/* Header */}
        <div
          style={{
            position: "relative",
            background: "var(--color-slate)",
            color: "var(--color-paper)",
            padding: "3rem 1.5rem 2.5rem",
            overflow: "hidden",
          }}
        >
          <ContourBackground />
          <div style={{ position: "relative", zIndex: 1, maxWidth: "1200px", margin: "0 auto" }}>
            <p
              style={{
                fontFamily: "var(--font-mono, monospace)",
                fontSize: "0.65rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "var(--color-ochre)",
                marginBottom: "0.5rem",
              }}
            >
              📡 Estación · SSR
            </p>
            <h1
              style={{
                fontFamily: "var(--font-display, Georgia, serif)",
                fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
                fontWeight: 800,
                margin: "0 0 0.75rem",
              }}
            >
              Field Radar
            </h1>
            <p style={{ opacity: 0.8, maxWidth: "55ch", lineHeight: 1.6 }}>
              Sondeo hecho <em>ahora</em>: el servidor consulta iNaturalist con los parámetros de esta petición
              y devuelve el HTML completo. La hora cambia en cada recarga.
            </p>
          </div>
        </div>

        {/* Content */}
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "2rem 1.5rem",
            display: "grid",
            gridTemplateColumns: "1fr min(300px, 30%)",
            gap: "2rem",
            alignItems: "start",
          }}
          className="radar-layout"
        >
          <section>
            {/* Search form */}
            <form
              action="/radar"
              method="get"
              style={{
                background: "var(--color-paper-deep)",
                border: "1px solid color-mix(in srgb, var(--color-ink) 12%, transparent)",
                borderRadius: "var(--radius-lg)",
                padding: "1.25rem",
                display: "flex",
                gap: "1rem",
                flexWrap: "wrap",
                alignItems: "flex-end",
                marginBottom: "1.5rem",
              }}
            >
              {[
                { name: "lat", label: "Latitud", placeholder: "1.2136", defaultValue: parsed.success ? String(parsed.data.lat) : "" },
                { name: "lng", label: "Longitud", placeholder: "-77.2811", defaultValue: parsed.success ? String(parsed.data.lng) : "" },
                { name: "radius", label: "Radio (km)", placeholder: "15", defaultValue: parsed.success ? String(parsed.data.radius) : "15" },
              ].map((field) => (
                <div key={field.name} style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                  <label
                    htmlFor={`radar-${field.name}`}
                    style={{
                      fontFamily: "var(--font-mono, monospace)",
                      fontSize: "0.6rem",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "var(--color-ink-muted)",
                    }}
                  >
                    {field.label}
                  </label>
                  <input
                    id={`radar-${field.name}`}
                    name={field.name}
                    type="number"
                    step="any"
                    placeholder={field.placeholder}
                    defaultValue={field.defaultValue}
                    style={{
                      padding: "0.4rem 0.7rem",
                      border: "1px solid var(--color-paper-deep)",
                      borderRadius: "var(--radius-md)",
                      fontSize: "0.85rem",
                      background: "var(--color-paper-light, #FAF6EE)",
                      color: "var(--color-ink)",
                      width: "140px",
                    }}
                  />
                </div>
              ))}

              <button
                id="btn-search-radar"
                type="submit"
                style={{
                  padding: "0.45rem 1.2rem",
                  background: "var(--color-slate)",
                  color: "var(--color-paper)",
                  border: "none",
                  borderRadius: "var(--radius-full)",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                🔍 Buscar
              </button>
            </form>

            {/* Locate me button (client island) */}
            <div style={{ marginBottom: "1.5rem" }}>
              <LocateMeButton />
            </div>

            {/* Results */}
            {!parsed.success ? (
              <div
                style={{
                  background: "color-mix(in srgb, var(--color-ochre) 15%, transparent)",
                  border: "1px solid color-mix(in srgb, var(--color-ochre) 30%, transparent)",
                  borderRadius: "var(--radius-lg)",
                  padding: "1.5rem",
                  textAlign: "center",
                }}
              >
                <p
                  style={{
                    fontFamily: "var(--font-display, Georgia, serif)",
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    marginBottom: "0.5rem",
                  }}
                >
                  📡 Ingresa coordenadas o usa tu ubicación
                </p>
                <p style={{ color: "var(--color-ink-muted)", fontSize: "0.85rem" }}>
                  El radar buscará observaciones dentro del radio indicado.
                  <br />
                  Pasto: lat 1.2136, lng -77.2811
                </p>
              </div>
            ) : (
              <>
                <p
                  style={{
                    fontFamily: "var(--font-mono, monospace)",
                    fontSize: "0.72rem",
                    color: "var(--color-ink-muted)",
                    marginBottom: "1rem",
                  }}
                >
                  📍 {formatCoords(parsed.data.lat, parsed.data.lng)} · Radio: {parsed.data.radius} km
                </p>
                <ObservationResults lat={parsed.data.lat} lng={parsed.data.lng} radius={parsed.data.radius} />
              </>
            )}
          </section>

          <div>
            <RenderTelemetry pattern="SSR" generatedAt={generatedAt} />
          </div>
        </div>
      </main>
      <Footer />

      <style>{`
        @media (max-width: 720px) {
          .radar-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}

async function ObservationResults({
  lat,
  lng,
  radius,
}: {
  lat: number;
  lng: number;
  radius: number;
}) {
  const observations = await getNearbyObservations({ lat, lng, radius });
  return <ObservationList observations={observations} emptyMessage="No se encontraron observaciones en ese radio." />;
}
