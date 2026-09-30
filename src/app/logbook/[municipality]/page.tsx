import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { RenderTelemetry } from "@/components/telemetry/RenderTelemetry";
import { ObservationList } from "@/features/logbook/ObservationList";
import { ContourBackground } from "@/components/ui/ContourBackground";
import { getRecentByMunicipality } from "@/services/observations.service";
import { findMunicipality, MUNICIPALITIES } from "@/config/municipalities";
import { LOGBOOK_REVALIDATE_SECONDS } from "@/config/timing";
import Link from "next/link";

// ISR: regenerate in the background every 60 seconds
export const revalidate = 60;
// Municipalities not prebuilt are generated on first request
export const dynamicParams = true;

export function generateStaticParams() {
  // Prebuild only the most-visited; the rest are lazy on first request
  return MUNICIPALITIES.slice(0, 2).map(({ slug }) => ({ municipality: slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ municipality: string }>;
}) {
  const { municipality } = await params;
  const muni = findMunicipality(municipality);
  if (!muni) return {};
  return {
    title: `${muni.name} · Logbook`,
    description: `Observaciones recientes de biodiversidad en ${muni.name}, Nariño. Actualizado automáticamente con ISR.`,
  };
}

interface PageProps {
  params: Promise<{ municipality: string }>;
}

export default async function LogbookPage({ params }: PageProps) {
  const { municipality } = await params;
  const muni = findMunicipality(municipality);
  if (!muni) notFound();

  const observations = await getRecentByMunicipality(municipality);
  const generatedAt = new Date().toISOString();

  return (
    <>
      <Header />
      <main id="main-content">
        {/* Header */}
        <div
          style={{
            position: "relative",
            background: "var(--color-ochre)",
            color: "var(--color-ink)",
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
                color: "var(--color-ink)",
                opacity: 0.65,
                marginBottom: "0.5rem",
              }}
            >
              📓 Estación · ISR
            </p>
            <h1
              style={{
                fontFamily: "var(--font-display, Georgia, serif)",
                fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
                fontWeight: 800,
                margin: "0 0 0.5rem",
              }}
            >
              Logbook · {muni.name}
            </h1>
            <p style={{ opacity: 0.75, maxWidth: "50ch", lineHeight: 1.6 }}>
              Observaciones recientes de biodiversidad. Revalida automáticamente cada{" "}
              {LOGBOOK_REVALIDATE_SECONDS} s en segundo plano.
            </p>
          </div>
        </div>

        {/* Municipality selector */}
        <nav
          aria-label="Cambiar municipio"
          style={{
            background: "var(--color-paper-deep)",
            borderBottom: "1px solid color-mix(in srgb, var(--color-ink) 10%, transparent)",
          }}
        >
          <div
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              padding: "0.6rem 1.5rem",
              display: "flex",
              gap: "0.5rem",
              flexWrap: "wrap",
            }}
          >
            {MUNICIPALITIES.map((m) => (
              <Link
                key={m.slug}
                href={`/logbook/${m.slug}`}
                style={{
                  padding: "0.25rem 0.75rem",
                  borderRadius: "var(--radius-full)",
                  fontSize: "0.78rem",
                  textDecoration: "none",
                  background: m.slug === municipality ? "var(--color-ink)" : "transparent",
                  color: m.slug === municipality ? "var(--color-paper)" : "var(--color-ink)",
                  border: "1px solid color-mix(in srgb, var(--color-ink) 20%, transparent)",
                  fontFamily: "var(--font-mono, monospace)",
                  transition: "background 0.15s",
                }}
              >
                {m.name}
              </Link>
            ))}
          </div>
        </nav>

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
          className="logbook-layout"
        >
          <section>
            <ObservationList observations={observations} />
          </section>
          <div>
            <RenderTelemetry
              pattern="ISR"
              generatedAt={generatedAt}
              revalidateSeconds={LOGBOOK_REVALIDATE_SECONDS}
            />
          </div>
        </div>
      </main>
      <Footer />

      <style>{`
        @media (max-width: 720px) {
          .logbook-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
