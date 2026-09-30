import { SpecimenCard } from "@/features/herbarium/SpecimenCard";
import { RenderTelemetry } from "@/components/telemetry/RenderTelemetry";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ContourBackground } from "@/components/ui/ContourBackground";
import { getAllSpeciesForList } from "@/services/species.service";

export const dynamic = "force-static";

export const metadata = {
  title: "Herbarium · Especies de Nariño",
  description:
    "Fichas estáticas de las especies emblemáticas de Nariño, Colombia. Generadas en build con SSG.",
};

export default async function HerbariumPage() {
  const species = await getAllSpeciesForList();
  const generatedAt = new Date().toISOString();

  return (
    <>
      <Header />
      <main id="main-content">
        {/* Page header */}
        <div
          style={{
            position: "relative",
            background: "var(--color-moss)",
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
              🌿 Estación · SSG
            </p>
            <h1
              style={{
                fontFamily: "var(--font-display, Georgia, serif)",
                fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
                fontWeight: 800,
                margin: "0 0 0.75rem",
              }}
            >
              Herbarium
            </h1>
            <p style={{ opacity: 0.85, maxWidth: "55ch", lineHeight: 1.6 }}>
              Especímenes prensados: fichas generadas en build y conservadas para siempre.
              Cada tarjeta es una lámina de herbario real.
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
          className="herbarium-layout"
        >
          {/* Species grid */}
          <section>
            <p
              style={{
                fontFamily: "var(--font-mono, monospace)",
                fontSize: "0.65rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--color-ink-muted)",
                marginBottom: "1rem",
              }}
            >
              Catálogo · {species.length} especies
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: "1rem",
              }}
            >
              {species.map((s) => (
                <SpecimenCard
                  key={s.slug}
                  slug={s.slug}
                  scientificName={s.scientificName}
                  commonName={s.commonName}
                  emblem={s.emblem as "mammal" | "bird" | "plant"}
                  thermalFloor={s.thermalFloor as "coast" | "cloud-forest" | "paramo"}
                  catalogNumber={s.catalogNumber}
                />
              ))}
            </div>
          </section>

          {/* Telemetry */}
          <div>
            <RenderTelemetry pattern="SSG" generatedAt={generatedAt} />
          </div>
        </div>
      </main>
      <Footer />

      <style>{`
        @media (max-width: 720px) {
          .herbarium-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}
