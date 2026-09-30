import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { RenderTelemetry } from "@/components/telemetry/RenderTelemetry";
import { ObservationList } from "@/features/logbook/ObservationList";
import { PHASE_PRODUCTION_BUILD } from "next/constants";
import { StationHero } from "@/components/layout/StationHero";
import { ErrorNotice } from "@/components/ui/ErrorNotice";
import { getRecentByMunicipality } from "@/services/observations.service";
import { findMunicipality, MUNICIPALITIES, PREBUILT_MUNICIPALITY_COUNT } from "@/config/municipalities";
import { LOGBOOK_REVALIDATE_SECONDS } from "@/config/timing";
import Link from "next/link";

// ISR: regenerate in the background every 60 seconds.
// Must be a literal (statically analysed); a unit test keeps it equal to
// LOGBOOK_REVALIDATE_SECONDS.
export const revalidate = 60;
// Municipalities not prebuilt are generated on first request
export const dynamicParams = true;

export function generateStaticParams() {
  // Prebuild only the most-visited; the rest are lazy on first request
  return MUNICIPALITIES.slice(0, PREBUILT_MUNICIPALITY_COUNT).map(({ slug }) => ({
    municipality: slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ municipality: string }> }) {
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

  const result = await getRecentByMunicipality(municipality);
  // A failed background regeneration must not replace the last good page:
  // throwing keeps serving the previous version and retries on the next
  // request. During `next build` there is no previous version, so the page
  // is rendered with an error notice instead of failing the whole build.
  if (!result.ok && process.env.NEXT_PHASE !== PHASE_PRODUCTION_BUILD) {
    throw new Error(`Logbook regeneration failed: ${result.error.message}`);
  }
  const generatedAt = new Date().toISOString();

  return (
    <>
      <Header />
      <main id="main-content">
        <StationHero tone="ochre" eyebrow="📓 Estación · ISR" title={`Logbook · ${muni.name}`}>
          <p style={{ opacity: 0.85, maxWidth: "50ch", lineHeight: 1.6 }}>
            Observaciones recientes de biodiversidad. Revalida automáticamente cada{" "}
            {LOGBOOK_REVALIDATE_SECONDS} s en segundo plano.
          </p>
        </StationHero>

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
            {result.ok ? (
              <ObservationList observations={result.value} />
            ) : (
              <ErrorNotice error={result.error} />
            )}
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
