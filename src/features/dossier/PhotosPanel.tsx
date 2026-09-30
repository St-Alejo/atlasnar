import Image from "next/image";
import type { TaxonProfile } from "@/domain/models";
import { getDossierPhotos } from "@/services/dossier.service";

export async function PhotosPanel({ scientificName }: { scientificName: string }) {
  const photos = await getDossierPhotos(scientificName);

  if (photos.length === 0) {
    return (
      <p style={{ color: "var(--color-ink-muted)", fontStyle: "italic", padding: "1rem 0" }}>
        No hay fotografías disponibles con licencia abierta.
      </p>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
        gap: "0.75rem",
        animation: "reveal 0.5s ease-out both",
      }}
    >
      {photos.slice(0, 8).map((photo) => (
        <figure key={photo.url} style={{ margin: 0, position: "relative" }}>
          <div
            style={{
              position: "relative",
              aspectRatio: "1",
              borderRadius: "var(--radius-md)",
              overflow: "hidden",
            }}
          >
            <Image
              src={photo.url.replace(/\/square\./, "/medium.")}
              alt={photo.attribution ?? scientificName}
              fill
              sizes="200px"
              style={{ objectFit: "cover" }}
            />
          </div>
          {photo.attribution && (
            <figcaption
              style={{
                fontSize: "0.6rem",
                color: "var(--color-ink-muted)",
                marginTop: "0.2rem",
                fontFamily: "var(--font-mono, monospace)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {photo.attribution}
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  );
}

export function PhotosSkeleton() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
        gap: "0.75rem",
      }}
    >
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          style={{
            aspectRatio: "1",
            borderRadius: "var(--radius-md)",
            background: "var(--color-paper-deep)",
            animation: "pulse-gentle 1.8s ease-in-out infinite",
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
    </div>
  );
}
