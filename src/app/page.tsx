import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AltitudeGauge } from "@/components/layout/AltitudeGauge";
import { RenderTelemetry } from "@/components/telemetry/RenderTelemetry";
import { ContourBackground } from "@/components/ui/ContourBackground";
import { Stamp } from "@/components/ui/Stamp";

// This page is SSG — generated once at build time.
export const dynamic = "force-static";

export const metadata = {
  title: "Atlas de Biodiversidad de Nariño",
  description:
    "Cuaderno de campo digital sobre la biodiversidad de Nariño. Demuestra SSG, ISR, SSR, Streaming SSR y CSR en una sola aplicación.",
};

const STATIONS = [
  {
    href: "/herbarium",
    emoji: "🌿",
    name: "Herbarium",
    pattern: "SSG" as const,
    description:
      "Fichas de especies emblemáticas de Nariño. Generadas una vez en build y servidas desde CDN. Rápidas, seguras y sin carga en el servidor.",
    detail: "Lista curada · 10 especies",
  },
  {
    href: "/logbook/pasto",
    emoji: "📓",
    name: "Logbook",
    pattern: "ISR" as const,
    description:
      "Observaciones recientes en cada municipio. Se actualizan automáticamente en segundo plano cada 60 s, sin bloquear al usuario.",
    detail: "Municipios de Nariño",
  },
  {
    href: "/radar",
    emoji: "📡",
    name: "Field Radar",
    pattern: "SSR" as const,
    description:
      "Búsqueda por coordenadas: el servidor consulta iNaturalist en cada petición y devuelve resultados frescos según tu ubicación.",
    detail: "Dinámica · por petición",
  },
  {
    href: "/dossier/andean-cock-of-the-rock",
    emoji: "🗂️",
    name: "Specimen Dossier",
    pattern: "STREAMING" as const,
    description:
      "Expediente con tres paneles independientes. Cada uno se revela cuando su fetch termina, sin esperar al más lento.",
    detail: "Suspense · streaming",
  },
  {
    href: "/lab",
    emoji: "🔬",
    name: "Field Lab",
    pattern: "CSR" as const,
    description:
      "Filtros y cuadrícula de observaciones completamente interactivos. El HTML llega vacío; todo ocurre en el navegador.",
    detail: "Cliente · React hooks",
  },
] as const;

const COMPARISON_ROWS = [
  {
    label: "TTFB",
    ssg: "< 50 ms",
    isr: "< 50 ms",
    ssr: "200-800 ms",
    streaming: "< 100 ms",
    csr: "< 100 ms",
  },
  {
    label: "FCP",
    ssg: "Muy rápido",
    isr: "Muy rápido",
    ssr: "Más lento",
    streaming: "Rápido",
    csr: "Más lento",
  },
  {
    label: "SEO",
    ssg: "✅ Óptimo",
    isr: "✅ Óptimo",
    ssr: "✅ Óptimo",
    streaming: "✅ Parcial",
    csr: "⚠️ Limitado",
  },
  {
    label: "Datos frescos",
    ssg: "Al build",
    isr: "Cada 60 s",
    ssr: "En c/petición",
    streaming: "En c/petición",
    csr: "En c/petición",
  },
  { label: "Coste servidor", ssg: "0", isr: "Mínimo", ssr: "Alto", streaming: "Alto", csr: "0" },
  { label: "JS requerido", ssg: "No", isr: "No", ssr: "No", streaming: "No", csr: "Sí" },
] as const;

const THERMAL_FLOORS = [
  {
    name: "Páramo",
    range: "3.000 – 4.800 m s.n.m.",
    color: "#D9A441",
    text: "Frailejones, puyas y el oso de anteojos. Fábrica de agua a los pies de los volcanes Galeras, Azufral y Cumbal.",
  },
  {
    name: "Bosque de niebla",
    range: "1.000 – 3.000 m s.n.m.",
    color: "#3E5C3A",
    text: "Colibríes, quetzales y gallitos de las rocas entre musgos, bromelias y orquídeas.",
  },
  {
    name: "Costa Pacífica",
    range: "0 – 1.000 m s.n.m.",
    color: "#6B9BA8",
    text: "Manglares y selva húmeda del Chocó biogeográfico, de Tumaco a Barbacoas.",
  },
] as const;

export default function HomePage() {
  const buildTime = new Date().toISOString();

  return (
    <>
      <AltitudeGauge />
      <Header />
      <main id="main-content">
        {/* Hero */}
        <section
          style={{
            position: "relative",
            background: "var(--color-chrome)",
            color: "var(--color-chrome-text)",
            padding: "5rem 1.5rem 4rem",
            overflow: "hidden",
            textAlign: "center",
          }}
        >
          <ContourBackground />
          <div style={{ position: "relative", zIndex: 1, maxWidth: "700px", margin: "0 auto" }}>
            <p
              style={{
                fontFamily: "var(--font-mono, monospace)",
                fontSize: "0.7rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "var(--color-ochre)",
                marginBottom: "1rem",
              }}
            >
              Programación Orientada a la Web · Taller de Rendering
            </p>
            <h1
              style={{
                fontFamily: "var(--font-display, Georgia, serif)",
                fontSize: "clamp(2.4rem, 6vw, 4rem)",
                fontWeight: 800,
                lineHeight: 1.05,
                marginBottom: "1.25rem",
                letterSpacing: "-0.02em",
              }}
            >
              🦜 Andean Field Atlas
            </h1>
            <p
              style={{
                fontSize: "1.1rem",
                lineHeight: 1.65,
                color: "color-mix(in srgb, var(--color-chrome-text) 85%, transparent)",
                maxWidth: "55ch",
                margin: "0 auto 2rem",
              }}
            >
              Cuaderno de campo digital sobre la biodiversidad de Nariño, Colombia. Cada estación demuestra un
              patrón de rendering distinto: <strong>SSG, ISR, SSR, Streaming SSR y CSR</strong>.
            </p>
            <p
              style={{
                fontFamily: "var(--font-mono, monospace)",
                fontSize: "0.7rem",
                color: "var(--color-ochre)",
                opacity: 0.8,
              }}
            >
              Generado: {buildTime.replace("T", " ").slice(0, 19)} UTC
            </p>
          </div>
        </section>

        {/* Stations grid */}
        <section
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "3rem 1.5rem",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-display, Georgia, serif)",
              fontSize: "1.6rem",
              fontWeight: 700,
              marginBottom: "0.5rem",
            }}
          >
            Las cinco estaciones
          </h2>
          <p style={{ color: "var(--color-ink-muted)", marginBottom: "2rem", maxWidth: "60ch" }}>
            Cada estación usa el patrón de rendering más adecuado para sus datos. La app se explica a sí
            misma: cada página muestra qué patrón usa y por qué.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "1.25rem",
            }}
          >
            {STATIONS.map((station) => (
              <Link
                key={station.href}
                href={station.href}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <article
                  className="station-card"
                  style={{
                    background: "var(--color-paper-light, #FAF6EE)",
                    border: "1px solid var(--color-paper-deep)",
                    borderRadius: "var(--radius-xl)",
                    padding: "1.5rem",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <span style={{ fontSize: "2rem" }}>{station.emoji}</span>
                    <Stamp label={station.pattern} size="sm" />
                  </div>
                  <div>
                    <h3
                      style={{
                        fontFamily: "var(--font-display, Georgia, serif)",
                        fontSize: "1.25rem",
                        fontWeight: 700,
                        margin: "0 0 0.3rem",
                      }}
                    >
                      {station.name}
                    </h3>
                    <p
                      style={{
                        fontFamily: "var(--font-mono, monospace)",
                        fontSize: "0.65rem",
                        letterSpacing: "0.08em",
                        color: "var(--color-ink-muted)",
                        margin: "0 0 0.75rem",
                        textTransform: "uppercase",
                      }}
                    >
                      {station.detail}
                    </p>
                    <p
                      style={{
                        fontSize: "0.85rem",
                        lineHeight: 1.6,
                        color: "var(--color-ink-muted)",
                        margin: 0,
                      }}
                    >
                      {station.description}
                    </p>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>

        {/* Thermal floors: the page "descends" from páramo to coast, as the gauge shows */}
        <section
          aria-labelledby="floors-title"
          style={{ maxWidth: "1200px", margin: "0 auto", padding: "1rem 1.5rem 3rem" }}
        >
          <h2
            id="floors-title"
            style={{
              fontFamily: "var(--font-display, Georgia, serif)",
              fontSize: "1.6rem",
              marginBottom: "1.5rem",
            }}
          >
            Pisos térmicos de Nariño
          </h2>
          <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "1rem" }}>
            {THERMAL_FLOORS.map((floor) => (
              <li
                key={floor.name}
                style={{
                  borderLeft: `6px solid ${floor.color}`,
                  background: "var(--color-paper-light)",
                  borderRadius: "var(--radius-md)",
                  padding: "1.25rem 1.5rem",
                }}
              >
                <p
                  style={{
                    fontFamily: "var(--font-mono, monospace)",
                    fontSize: "0.7rem",
                    color: "var(--color-ink-muted)",
                    margin: 0,
                  }}
                >
                  {floor.range}
                </p>
                <h3
                  style={{
                    fontFamily: "var(--font-display, Georgia, serif)",
                    fontSize: "1.25rem",
                    margin: "0.2rem 0",
                  }}
                >
                  {floor.name}
                </h3>
                <p style={{ margin: 0, color: "var(--color-ink-muted)", fontSize: "0.9rem" }}>{floor.text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Comparison table */}
        <section
          style={{
            background: "var(--color-paper-deep)",
            borderTop: "1px solid color-mix(in srgb, var(--color-ink) 10%, transparent)",
            padding: "3rem 1.5rem",
          }}
        >
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <h2
              style={{
                fontFamily: "var(--font-display, Georgia, serif)",
                fontSize: "1.5rem",
                fontWeight: 700,
                marginBottom: "0.5rem",
              }}
            >
              Comparativa de patrones
            </h2>
            <p style={{ color: "var(--color-ink-muted)", marginBottom: "1.5rem", maxWidth: "55ch" }}>
              Ningún patrón es mejor que otro en absoluto. La clave es elegir el adecuado para cada tipo de
              contenido.
            </p>
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "0.82rem",
                }}
              >
                <thead>
                  <tr>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "0.6rem 1rem",
                        color: "var(--color-ink-muted)",
                        fontFamily: "var(--font-mono, monospace)",
                        fontSize: "0.65rem",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        borderBottom: "2px solid var(--color-paper)",
                      }}
                    >
                      Métrica
                    </th>
                    {["SSG", "ISR", "SSR", "Streaming", "CSR"].map((p) => (
                      <th
                        key={p}
                        style={{
                          padding: "0.6rem 1rem",
                          fontFamily: "var(--font-mono, monospace)",
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          borderBottom: "2px solid var(--color-paper)",
                          textAlign: "center",
                        }}
                      >
                        {p}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row, i) => (
                    <tr
                      key={row.label}
                      style={{
                        background:
                          i % 2 === 0
                            ? "transparent"
                            : "color-mix(in srgb, var(--color-paper) 40%, transparent)",
                      }}
                    >
                      <td
                        style={{
                          padding: "0.6rem 1rem",
                          fontFamily: "var(--font-mono, monospace)",
                          fontSize: "0.72rem",
                          fontWeight: 600,
                          color: "var(--color-ink-muted)",
                        }}
                      >
                        {row.label}
                      </td>
                      {[row.ssg, row.isr, row.ssr, row.streaming, row.csr].map((val, j) => (
                        <td
                          key={j}
                          style={{
                            padding: "0.6rem 1rem",
                            textAlign: "center",
                            fontSize: "0.78rem",
                          }}
                        >
                          {val}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ maxWidth: 420, marginTop: "2rem" }}>
              <RenderTelemetry pattern="SSG" generatedAt={buildTime} />
            </div>
          </div>
        </section>
      </main>
      <Footer />

      <style>{`
        .station-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(27,42,34,0.1);
        }
      `}</style>
    </>
  );
}
