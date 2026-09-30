import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { RenderTelemetry } from "@/components/telemetry/RenderTelemetry";
import { StationHero } from "@/components/layout/StationHero";
import { PhotosPanel, PhotosSkeleton } from "@/features/dossier/PhotosPanel";
import { OccurrenceMapPanel, MapPanelSkeleton } from "@/features/dossier/OccurrenceMapPanel";
import { RecentSightingsPanel, SightingsSkeleton } from "@/features/dossier/RecentSightingsPanel";
import { getCuratedSpecies } from "@/services/species.service";
import { formatCatalogNumber } from "@/lib/formatters";

// Rendered on every request: a prerendered page has complete HTML and
// could not stream for real.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const species = getCuratedSpecies(slug);
  if (!species) return {};
  return {
    title: `${species.commonName} · Dossier`,
    description: `Expediente con streaming SSR de ${species.scientificName} en Nariño.`,
  };
}

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ stream?: string }>;
}

export default async function DossierPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { stream } = await searchParams;
  const streamingOn = stream !== "off";

  // The shell uses curated data only (no network), so it is sent at once.
  const species = getCuratedSpecies(slug);
  if (!species) notFound();

  const generatedAt = new Date().toISOString();
  const toggleStyle = (active: boolean) => ({
    padding: "0.3rem 0.9rem",
    borderRadius: "var(--radius-full)",
    fontSize: "0.78rem",
    fontWeight: 600,
    textDecoration: "none",
    background: active ? "#F1EAD8" : "rgba(241,234,216,0.15)",
    color: active ? "#A93A24" : "#F1EAD8",
    border: "1px solid rgba(241,234,216,0.5)",
  });

  return (
    <>
      <Header />
      <main id="main-content">
        <StationHero
          tone="cinnabar"
          eyebrow={`🗂️ Estación · Streaming SSR · ${formatCatalogNumber(species.catalogNumber)}`}
          title={species.commonName}
        >
          <p style={{ fontStyle: "italic", fontSize: "1.1rem", opacity: 0.9, margin: "0 0 1rem" }}>
            {species.scientificName}
          </p>

          {/* Streaming toggle: plain links force a full document request, */}
          {/* so the difference is visible on every click. */}
          <nav aria-label="Modo de streaming" style={{ display: "flex", gap: "0.5rem" }}>
            <a
              href={`/dossier/${slug}`}
              aria-current={streamingOn ? "page" : undefined}
              style={toggleStyle(streamingOn)}
            >
              ⚡ Streaming ON
            </a>
            <a
              href={`/dossier/${slug}?stream=off`}
              aria-current={!streamingOn ? "page" : undefined}
              style={toggleStyle(!streamingOn)}
            >
              ⏸️ Streaming OFF
            </a>
          </nav>
        </StationHero>

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
          className="dossier-layout"
        >
          <article style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            {/* Photos panel */}
            <section>
              <SectionTitle emoji="📸" title="Fotografías" />
              {streamingOn ? (
                <Suspense fallback={<PhotosSkeleton />}>
                  <PhotosPanel scientificName={species.scientificName} />
                </Suspense>
              ) : (
                <PhotosPanel scientificName={species.scientificName} />
              )}
            </section>

            {/* Distribution map panel */}
            <section>
              <SectionTitle
                emoji="🗺️"
                title="Distribución en Nariño"
                subtitle="GBIF · Puntos de ocurrencia"
              />
              {streamingOn ? (
                <Suspense fallback={<MapPanelSkeleton />}>
                  <OccurrenceMapPanel scientificName={species.scientificName} />
                </Suspense>
              ) : (
                <OccurrenceMapPanel scientificName={species.scientificName} />
              )}
            </section>

            {/* Recent sightings panel */}
            <section>
              <SectionTitle emoji="👁️" title="Avistamientos recientes" subtitle="iNaturalist" />
              {streamingOn ? (
                <Suspense fallback={<SightingsSkeleton />}>
                  <RecentSightingsPanel scientificName={species.scientificName} />
                </Suspense>
              ) : (
                <RecentSightingsPanel scientificName={species.scientificName} />
              )}
            </section>

            {/* Link to static version */}
            <div
              style={{
                padding: "0.75rem 1rem",
                background: "var(--color-paper-deep)",
                borderRadius: "var(--radius-md)",
                fontSize: "0.8rem",
                color: "var(--color-ink-muted)",
              }}
            >
              Ver la misma especie como página estática:{" "}
              <Link
                href={`/herbarium/${species.slug}`}
                style={{ color: "var(--color-moss)", fontWeight: 600 }}
              >
                🌿 Herbarium · {species.commonName}
              </Link>
            </div>
          </article>

          <div>
            <RenderTelemetry pattern={streamingOn ? "STREAMING" : "SSR"} generatedAt={generatedAt} />
            {!streamingOn && (
              <p style={{ fontSize: "0.78rem", color: "var(--color-ink-muted)", marginTop: "0.75rem" }}>
                Modo comparación: sin fronteras de <code>Suspense</code>, el servidor espera a los tres
                paneles antes de enviar el primer byte de la página.
              </p>
            )}
          </div>
        </div>
      </main>
      <Footer />

      <style>{`
        @media (max-width: 720px) {
          .dossier-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}

function SectionTitle({ emoji, title, subtitle }: { emoji: string; title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <h2
        style={{
          fontFamily: "var(--font-display, Georgia, serif)",
          fontSize: "1.25rem",
          fontWeight: 700,
          margin: "0 0 0.2rem",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        <span>{emoji}</span> {title}
      </h2>
      {subtitle && (
        <p
          style={{
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "0.65rem",
            letterSpacing: "0.08em",
            color: "var(--color-ink-muted)",
            margin: 0,
            textTransform: "uppercase",
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
