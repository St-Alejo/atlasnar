import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { StationHero } from "@/components/layout/StationHero";
import { RenderTelemetry } from "@/components/telemetry/RenderTelemetry";
import { LabLoader } from "@/features/lab/LabLoader";

export const metadata: Metadata = {
  title: "Field Lab · Explorador interactivo",
  description: "Filtros y mapa interactivos: todo ocurre en el navegador (CSR).",
};

/** Thin server shell: no data here. Everything below is rendered by the browser. */
export default function LabPage() {
  const generatedAt = new Date().toISOString();

  return (
    <>
      <Header />
      <main id="main-content">
        <StationHero tone="slate" eyebrow="🔬 Estación · CSR" title="Field Lab">
          <p style={{ opacity: 0.9, maxWidth: "60ch", lineHeight: 1.6 }}>
            Instrumentos en tu mano: el servidor entrega un marco vacío y el navegador consulta
            iNaturalist directamente. Abre la pestaña <strong>Network</strong> de DevTools para ver
            cada petición.
          </p>
        </StationHero>

        <div
          style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem 1.5rem", display: "grid", gap: "2rem" }}
        >
          <noscript>
            <p
              role="alert"
              style={{
                padding: "1rem",
                border: "1px solid var(--color-cinnabar)",
                borderRadius: "var(--radius-md)",
                color: "var(--color-cinnabar)",
              }}
            >
              El Field Lab necesita JavaScript: es el trade-off del renderizado en el cliente.
            </p>
          </noscript>

          <LabLoader />

          <div style={{ maxWidth: 420 }}>
            <RenderTelemetry
              pattern="CSR"
              generatedAt={generatedAt}
              generatedLabel="Marco HTML generado"
            />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
