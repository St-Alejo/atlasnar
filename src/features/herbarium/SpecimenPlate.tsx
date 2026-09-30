import Image from "next/image";
import Link from "next/link";
import type { Species } from "@/domain/models";
import { RenderTelemetry } from "@/components/telemetry/RenderTelemetry";
import { formatCatalogNumber, formatDate } from "@/lib/formatters";

const FLOOR_LABEL: Record<string, string> = {
  coast: "Costa Pacífica",
  "cloud-forest": "Bosque de niebla",
  paramo: "Páramo",
};

const EMBLEM_ICON: Record<string, string> = {
  mammal: "🦣",
  bird: "🦜",
  plant: "🌿",
};

interface SpecimenPlateProps {
  species: Species;
  generatedAt: string;
}

export function SpecimenPlate({ species, generatedAt }: SpecimenPlateProps) {
  const coverPhoto = species.profile?.photos[0] ?? null;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr min(300px, 30%)",
        gap: "2rem",
        alignItems: "start",
      }}
      className="specimen-plate-grid"
    >
      {/* Main plate */}
      <article
        style={{
          background: "var(--color-paper-light, #FAF6EE)",
          border: "1px solid var(--color-paper-deep)",
          borderRadius: "var(--radius-xl)",
          overflow: "hidden",
        }}
      >
        {/* Photo */}
        {coverPhoto && (
          <figure
            style={{ margin: 0, position: "relative", aspectRatio: "16/7", overflow: "hidden" }}
          >
            <Image
              src={coverPhoto.url}
              alt={`Fotografía de ${species.scientificName}`}
              fill
              sizes="(max-width: 900px) 100vw, 70vw"
              style={{ objectFit: "cover" }}
              priority
            />
            {/* Attribution */}
            {coverPhoto.attribution && (
              <figcaption
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  background: "rgba(27,42,34,0.7)",
                  color: "#F1EAD8",
                  fontSize: "0.65rem",
                  padding: "0.2rem 0.5rem",
                  fontFamily: "var(--font-mono, monospace)",
                  borderTopLeftRadius: "var(--radius-md)",
                }}
              >
                📷 {coverPhoto.attribution}
              </figcaption>
            )}
          </figure>
        )}

        <div style={{ padding: "2rem" }}>
          {/* Header */}
          <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
            <div>
              <p
                style={{
                  fontFamily: "var(--font-mono, monospace)",
                  fontSize: "0.65rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--color-ink-muted)",
                  margin: "0 0 0.25rem",
                }}
              >
                {formatCatalogNumber(species.catalogNumber)} · {EMBLEM_ICON[species.emblem]} {FLOOR_LABEL[species.thermalFloor]}
              </p>
              <h1
                style={{
                  fontFamily: "var(--font-display, Georgia, serif)",
                  fontSize: "clamp(1.6rem, 4vw, 2.4rem)",
                  fontWeight: 800,
                  margin: "0 0 0.25rem",
                  lineHeight: 1.1,
                }}
              >
                {species.commonName}
              </h1>
              <p
                style={{
                  fontStyle: "italic",
                  fontSize: "1.1rem",
                  color: "var(--color-ink-muted)",
                  margin: 0,
                }}
              >
                {species.scientificName}
              </p>
            </div>
          </header>

          {/* Summary */}
          {species.profile?.summary && (
            <section style={{ marginBottom: "1.5rem" }}>
              <p style={{ lineHeight: 1.7, fontSize: "0.95rem" }}>
                {species.profile.summary}
              </p>
            </section>
          )}

          {/* Taxonomy table */}
          {species.taxonomy && (
            <section>
              <h2
                style={{
                  fontFamily: "var(--font-mono, monospace)",
                  fontSize: "0.65rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--color-ink-muted)",
                  marginBottom: "0.5rem",
                }}
              >
                Clasificación taxonómica
              </h2>
              <dl
                style={{
                  display: "grid",
                  gridTemplateColumns: "auto 1fr",
                  gap: "0.3rem 1rem",
                  fontSize: "0.85rem",
                }}
              >
                {[
                  ["Reino", species.taxonomy.kingdom],
                  ["Orden", species.taxonomy.order],
                  ["Familia", species.taxonomy.family],
                  ["Estado GBIF", species.taxonomy.status],
                ].map(([label, value]) =>
                  value ? (
                    <>
                      <dt key={`dt-${label}`} style={{ color: "var(--color-ink-muted)", fontFamily: "var(--font-mono, monospace)", fontSize: "0.75rem" }}>
                        {label}
                      </dt>
                      <dd key={`dd-${label}`} style={{ margin: 0, fontStyle: label === "Familia" ? "italic" : "normal" }}>
                        {value}
                      </dd>
                    </>
                  ) : null,
                )}
              </dl>
            </section>
          )}

          {/* Conservation status */}
          {species.profile?.conservationStatus && (
            <p
              style={{
                marginTop: "1rem",
                padding: "0.4rem 0.8rem",
                background: "var(--color-cinnabar)",
                color: "#F1EAD8",
                borderRadius: "var(--radius-md)",
                fontSize: "0.8rem",
                fontWeight: 600,
                display: "inline-block",
              }}
            >
              🔴 {species.profile.conservationStatus}
            </p>
          )}

          {/* Photo gallery (secondary) */}
          {species.profile && species.profile.photos.length > 1 && (
            <section style={{ marginTop: "1.5rem" }}>
              <h2
                style={{
                  fontFamily: "var(--font-mono, monospace)",
                  fontSize: "0.65rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--color-ink-muted)",
                  marginBottom: "0.75rem",
                }}
              >
                Galería
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                  gap: "0.5rem",
                }}
              >
                {species.profile.photos.slice(1, 6).map((photo) => (
                  <div
                    key={photo.url}
                    style={{
                      position: "relative",
                      aspectRatio: "1",
                      borderRadius: "var(--radius-md)",
                      overflow: "hidden",
                    }}
                  >
                    <Image
                      src={photo.url}
                      alt={photo.attribution ?? species.scientificName}
                      fill
                      sizes="120px"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* External links */}
          <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            {species.profile?.wikipediaUrl && (
              <a
                href={species.profile.wikipediaUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: "0.4rem 0.9rem",
                  border: "1px solid var(--color-ink)",
                  borderRadius: "var(--radius-full)",
                  fontSize: "0.8rem",
                  textDecoration: "none",
                  color: "var(--color-ink)",
                }}
              >
                Wikipedia →
              </a>
            )}
            <Link
              href={`/dossier/${species.slug}`}
              style={{
                padding: "0.4rem 0.9rem",
                background: "var(--color-moss)",
                color: "var(--color-paper)",
                borderRadius: "var(--radius-full)",
                fontSize: "0.8rem",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              🗂️ Ver expediente con streaming →
            </Link>
          </div>
        </div>
      </article>

      {/* Telemetry sidebar */}
      <div>
        <RenderTelemetry pattern="SSG" generatedAt={generatedAt} />
      </div>

      <style>{`
        @media (max-width: 720px) {
          .specimen-plate-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
