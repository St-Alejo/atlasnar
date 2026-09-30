import Link from "next/link";
import { formatCatalogNumber } from "@/lib/formatters";

interface SpecimenCardProps {
  slug: string;
  scientificName: string;
  commonName: string;
  emblem: "mammal" | "bird" | "plant";
  thermalFloor: "coast" | "cloud-forest" | "paramo";
  catalogNumber: number;
}

const EMBLEM_ICON: Record<string, string> = {
  mammal: "🦣",
  bird: "🦜",
  plant: "🌿",
};

const FLOOR_LABEL: Record<string, string> = {
  coast: "Costa Pacífica",
  "cloud-forest": "Bosque de niebla",
  paramo: "Páramo",
};

const FLOOR_COLOR: Record<string, string> = {
  coast: "#6B9BA8",
  "cloud-forest": "#3E5C3A",
  paramo: "#D9A441",
};

export function SpecimenCard({
  slug,
  scientificName,
  commonName,
  emblem,
  thermalFloor,
  catalogNumber,
}: SpecimenCardProps) {
  return (
    <Link href={`/herbarium/${slug}`} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
      <article
        style={{
          background: "var(--color-paper-light, #FAF6EE)",
          border: "1px solid var(--color-paper-deep, #E6DCC3)",
          borderRadius: "var(--radius-lg, 16px)",
          padding: "1.25rem",
          position: "relative",
          overflow: "hidden",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          cursor: "pointer",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
        }}
        className="specimen-card"
      >
        {/* Catalogue number */}
        <span
          style={{
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "0.65rem",
            color: "var(--color-ink-muted, #3D4F45)",
            letterSpacing: "0.08em",
          }}
        >
          {formatCatalogNumber(catalogNumber)}
        </span>

        {/* Emblem icon */}
        <div style={{ fontSize: "2.5rem", lineHeight: 1 }}>{EMBLEM_ICON[emblem] ?? "🌿"}</div>

        {/* Names */}
        <div style={{ flex: 1 }}>
          <p
            style={{
              fontFamily: "var(--font-display, Georgia, serif)",
              fontSize: "1rem",
              fontWeight: 700,
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            {commonName}
          </p>
          <p
            style={{
              fontStyle: "italic",
              fontSize: "0.8rem",
              color: "var(--color-ink-muted, #3D4F45)",
              margin: "0.25rem 0 0",
            }}
          >
            {scientificName}
          </p>
        </div>

        {/* Thermal floor tag */}
        <span
          style={{
            display: "inline-block",
            padding: "0.2rem 0.6rem",
            borderRadius: "var(--radius-full, 9999px)",
            fontSize: "0.65rem",
            fontFamily: "var(--font-mono, monospace)",
            letterSpacing: "0.05em",
            background: FLOOR_COLOR[thermalFloor],
            color: thermalFloor === "cloud-forest" ? "#F1EAD8" : "#1B2A22",
            width: "fit-content",
          }}
        >
          {FLOOR_LABEL[thermalFloor]}
        </span>

        {/* Corner decoration */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: "0.75rem",
            right: "0.75rem",
            width: 32,
            height: 32,
            borderTop: "2px solid var(--color-paper-deep)",
            borderRight: "2px solid var(--color-paper-deep)",
            borderRadius: "0 var(--radius-sm) 0 0",
          }}
        />
      </article>

      <style>{`
        .specimen-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(27,42,34,0.12);
        }
      `}</style>
    </Link>
  );
}
