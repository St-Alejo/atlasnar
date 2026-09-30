import type { ReactNode } from "react";
import { ContourBackground } from "@/components/ui/ContourBackground";

/**
 * Station colours are fixed (not theme tokens) so each hero keeps its
 * identity, and its text contrast (≥ 4.5:1), in both light and dark mode.
 */
const TONES = {
  moss: { background: "#3E5C3A", color: "#F1EAD8" },
  ochre: { background: "#D9A441", color: "#1B2A22" },
  slate: { background: "#2E3A3F", color: "#F1EAD8" },
  cinnabar: { background: "#A93A24", color: "#F1EAD8" },
} as const;

export type StationTone = keyof typeof TONES;

interface StationHeroProps {
  readonly tone: StationTone;
  readonly eyebrow: string;
  readonly title: ReactNode;
  readonly children?: ReactNode;
}

export function StationHero({ tone, eyebrow, title, children }: StationHeroProps) {
  const { background, color } = TONES[tone];
  return (
    <div
      style={{
        position: "relative",
        background,
        color,
        padding: "3rem 1.5rem 2.5rem",
        overflow: "hidden",
      }}
    >
      <ContourBackground />
      <div style={{ position: "relative", zIndex: 1, maxWidth: "1200px", margin: "0 auto" }}>
        <p
          style={{
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "0.7rem",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            opacity: 0.85,
            marginBottom: "0.5rem",
          }}
        >
          {eyebrow}
        </p>
        <h1
          style={{
            fontFamily: "var(--font-display, Georgia, serif)",
            fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
            fontWeight: 800,
            margin: "0 0 0.75rem",
          }}
        >
          {title}
        </h1>
        {children}
      </div>
    </div>
  );
}
