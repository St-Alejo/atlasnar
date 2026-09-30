import { SpecimenCard } from "@/features/herbarium/SpecimenCard";
import { RenderTelemetry } from "@/components/telemetry/RenderTelemetry";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StationHero } from "@/components/layout/StationHero";
import { getAllSpeciesForList } from "@/services/species.service";

export const dynamic = "force-static";

export const metadata = {
  title: "Herbarium · Especies de Nariño",
  description:
    "Fichas estáticas de las especies emblemáticas de Nariño, Colombia. Generadas en build con SSG.",
};

export default function HerbariumPage() {
  const species = getAllSpeciesForList();
  const generatedAt = new Date().toISOString();

  return (
    <>
      <Header />
      <main id="main-content">
        <StationHero tone="moss" eyebrow="🌿 Estación · SSG" title="Herbarium">
          <p style={{ opacity: 0.9, maxWidth: "55ch", lineHeight: 1.6 }}>
            Especímenes prensados: fichas generadas en build y conservadas para siempre. Cada tarjeta es una
            lámina de herbario real.
          </p>
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
                  emblem={s.emblem}
                  thermalFloor={s.thermalFloor}
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
