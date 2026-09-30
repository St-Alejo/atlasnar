import Image from "next/image";
import type { Observation } from "@/domain/models";
import { formatDate, formatCoords } from "@/lib/formatters";

interface ObservationCardProps {
  observation: Observation;
  index: number;
}

function ObservationCard({ observation, index }: ObservationCardProps) {
  return (
    <article
      style={{
        background: "var(--color-paper-light, #FAF6EE)",
        border: "1px solid var(--color-paper-deep)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        display: "flex",
        gap: 0,
        animation: `reveal 0.4s ease-out ${index * 0.05}s both`,
      }}
    >
      {/* Photo */}
      {observation.photo?.url && (
        <div style={{ position: "relative", width: 120, flexShrink: 0 }}>
          <Image
            src={observation.photo.url.replace(/\/square\./, "/medium.")}
            alt={`Observación de ${observation.species.scientificName}`}
            fill
            sizes="120px"
            style={{ objectFit: "cover" }}
          />
        </div>
      )}

      {/* Info */}
      <div style={{ padding: "0.9rem 1rem", flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontStyle: "italic",
            fontWeight: 600,
            fontSize: "0.9rem",
            margin: "0 0 0.2rem",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {observation.species.scientificName}
        </p>
        {observation.species.commonName && (
          <p
            style={{
              fontSize: "0.78rem",
              color: "var(--color-ink-muted)",
              margin: "0 0 0.4rem",
            }}
          >
            {observation.species.commonName}
          </p>
        )}
        <dl
          style={{
            margin: 0,
            fontSize: "0.75rem",
            color: "var(--color-ink-muted)",
            display: "flex",
            flexDirection: "column",
            gap: "0.15rem",
          }}
        >
          {observation.observedAt && (
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <dt>📅</dt>
              <dd style={{ margin: 0 }}>{formatDate(observation.observedAt)}</dd>
            </div>
          )}
          {observation.placeGuess && (
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <dt>📍</dt>
              <dd style={{ margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {observation.placeGuess}
              </dd>
            </div>
          )}
          {observation.location && (
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <dt style={{ fontFamily: "var(--font-mono, monospace)" }}>🌐</dt>
              <dd style={{ margin: 0, fontFamily: "var(--font-mono, monospace)", fontSize: "0.7rem" }}>
                {formatCoords(observation.location.lat, observation.location.lng)}
              </dd>
            </div>
          )}
          {observation.observer && (
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <dt>👤</dt>
              <dd style={{ margin: 0 }}>{observation.observer}</dd>
            </div>
          )}
        </dl>
        {observation.uri && (
          <a
            href={observation.uri}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              marginTop: "0.5rem",
              fontSize: "0.7rem",
              color: "var(--color-moss)",
              fontFamily: "var(--font-mono, monospace)",
              textDecoration: "none",
            }}
          >
            Ver en iNaturalist →
          </a>
        )}
      </div>
    </article>
  );
}

interface ObservationListProps {
  observations: Observation[];
  emptyMessage?: string;
}

export function ObservationList({
  observations,
  emptyMessage = "No se encontraron observaciones recientes.",
}: ObservationListProps) {
  if (observations.length === 0) {
    return (
      <p
        style={{ color: "var(--color-ink-muted)", fontStyle: "italic", textAlign: "center", padding: "2rem" }}
      >
        {emptyMessage}
      </p>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {observations.map((obs, i) => (
        <ObservationCard key={obs.id} observation={obs} index={i} />
      ))}
    </div>
  );
}
