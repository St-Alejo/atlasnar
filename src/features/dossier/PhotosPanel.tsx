import Image from "next/image";
import { ErrorNotice } from "@/components/ui/ErrorNotice";
import { getDossierPhotos } from "@/services/dossier.service";

const MAX_PHOTOS = 6;

export async function PhotosPanel({ scientificName }: { scientificName: string }) {
  const result = await getDossierPhotos(scientificName);
  if (!result.ok) return <ErrorNotice error={result.error} />;

  const photos = result.value.slice(0, MAX_PHOTOS);
  if (photos.length === 0) {
    return (
      <p style={{ color: "var(--color-ink-muted)", fontStyle: "italic", padding: "1rem 0" }}>
        No hay fotografías disponibles con licencia abierta.
      </p>
    );
  }

  return (
    <div
      data-testid="panel-photos"
      className="animate-reveal"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
        gap: "0.75rem",
      }}
    >
      {photos.map((photo, index) => (
        <figure key={photo.id} style={{ margin: 0 }}>
          <div
            style={{
              position: "relative",
              aspectRatio: "1",
              borderRadius: "var(--radius-md)",
              overflow: "hidden",
            }}
          >
            <Image
              src={photo.url}
              alt={`Fotografía ${index + 1} de ${scientificName}`}
              fill
              sizes="(max-width: 720px) 50vw, 200px"
              style={{ objectFit: "cover" }}
            />
          </div>
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
            title={photo.attribution}
          >
            {photo.attribution} · {photo.license}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

export function PhotosSkeleton() {
  return (
    <div
      data-testid="skeleton-photos"
      aria-hidden="true"
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
