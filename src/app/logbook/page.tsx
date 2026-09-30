import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { StationHero } from "@/components/layout/StationHero";
import { MUNICIPALITIES, PREBUILT_MUNICIPALITY_COUNT } from "@/config/municipalities";
import { formatAltitude } from "@/lib/formatters";

export const metadata: Metadata = {
  title: "Logbook · Municipios",
  description: "Elige un municipio de Nariño para ver sus observaciones recientes (ISR).",
};

/** Static index of the Logbook: only links, the ISR pages live under /logbook/[municipality]. */
export default function LogbookIndexPage() {
  return (
    <>
      <Header />
      <main id="main-content">
        <StationHero tone="ochre" eyebrow="📓 Estación · ISR" title="Logbook">
          <p style={{ opacity: 0.85, maxWidth: "55ch", lineHeight: 1.6 }}>
            Un diario que se reescribe cada cierto tiempo sin detener la expedición. Los primeros{" "}
            {PREBUILT_MUNICIPALITY_COUNT} municipios se generan en el build; el resto, en su primera visita.
          </p>
        </StationHero>

        <ul
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "2rem 1.5rem",
            listStyle: "none",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "1rem",
          }}
        >
          {MUNICIPALITIES.map((m, index) => (
            <li key={m.slug}>
              <Link
                href={`/logbook/${m.slug}`}
                style={{
                  display: "block",
                  padding: "1.25rem",
                  background: "var(--color-paper-light)",
                  border: "1px solid var(--color-paper-deep)",
                  borderRadius: "var(--radius-lg)",
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <span style={{ fontFamily: "var(--font-display, Georgia, serif)", fontSize: "1.2rem", fontWeight: 700 }}>
                  {m.name}
                </span>
                <span
                  style={{
                    display: "block",
                    fontFamily: "var(--font-mono, monospace)",
                    fontSize: "0.7rem",
                    color: "var(--color-ink-muted)",
                    marginTop: "0.3rem",
                  }}
                >
                  {formatAltitude(m.altitudeM)} · radio {m.radiusKm} km ·{" "}
                  {index < PREBUILT_MUNICIPALITY_COUNT ? "prebuild" : "bajo demanda"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </main>
      <Footer />
    </>
  );
}
