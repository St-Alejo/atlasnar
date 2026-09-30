import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { RenderTelemetry } from "@/components/telemetry/RenderTelemetry";
import { ContourBackground } from "@/components/ui/ContourBackground";
import { PhotosPanel, PhotosSkeleton } from "@/features/dossier/PhotosPanel";
import { OccurrenceMapPanel, MapSkeleton } from "@/features/dossier/OccurrenceMapPanel";
import { RecentSightingsPanel, SightingsSkeleton } from "@/features/dossier/RecentSightingsPanel";
import { getSpeciesBySlug } from "@/services/species.service";
import { formatCatalogNumber } from "@/lib/formatters";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const species = await getSpeciesBySlug(slug);
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

  const species = await getSpeciesBySlug(slug);
  if (!species) notFound();

  const generatedAt = new Date().toISOString();

  return (
    <>
      <Header />
      <main id="main-content">
        {/* Page header */}
        <div
          style={{
            position: "relative",
            background: "var(--color-cinnabar)",
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
              🗂️ Estación · Streaming SSR
            </p>
            <p
              style={{
                fontFamily: "var(--font-mono, monospace)",
                fontSize: "0.72rem",
                opacity: 0.75,
                marginBottom: "0.25rem",
              }}
            >
              {formatCatalogNumber(species.catalogNumber)}
            </p>
            <h1
              style={{
                fontFamily: "var(--font-display, Georgia, serif)",
                fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
                fontWeight: 800,
                margin: "0 0 0.2rem",
              }}
            >
              {species.commonName}
            </h1>
            <p style={{ fontStyle: "italic", fontSize: "1.1rem", opacity: 0.8, margin: "0 0 1rem" }}>
              {species.scientificName}
            </p>

            {/* Streaming toggle */}
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <Link
                href={`/dossier/${slug}`}
                style={{
                  padding: "0.3rem 0.9rem",
                  borderRadius: "var(--radius-full)",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  textDecoration: "none",
                  background: streamingOn ? "var(--color-paper)" : "rgba(241,234,216,0.2)",
                  color: streamingOn ? "var(--color-cinnabar)" : "var(--color-paper)",
                  border: "1px solid rgba(241,234,216,0.4)",
                }}
              >
                ⚡ Streaming ON
              </Link>
              <Link
                href={`/dossier/${slug}?stream=off`}
                style={{
                  padding: "0.3rem 0.9rem",
                  borderRadius: "var(--radius-full)",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  textDecoration: "none",
                  background: !streamingOn ? "var(--color-paper)" : "rgba(241,234,216,0.2)",
                  color: !streamingOn ? "var(--color-cinnabar)" : "var(--color-paper)",
                  border: "1px solid rgba(241,234,216,0.4)",
                }}
              >
                ⏸️ Streaming OFF
              </Link>
            </div>
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
              <SectionTitle emoji="🗺️" title="Distribución en Nariño" subtitle="GBIF · Puntos de ocurrencia" />
              {streamingOn ? (
                <Suspense fallback={<MapSkeleton />}>
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
            <RenderTelemetry pattern="STREAMING" generatedAt={generatedAt} />
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

function SectionTitle({
  emoji,
  title,
  subtitle,
}: {
  emoji: string;
  title: string;
  subtitle?: string;
}) {
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
