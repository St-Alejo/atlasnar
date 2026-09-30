"use client";

import { useEffect, useState } from "react";
import { Stamp } from "@/components/ui/Stamp";
import { formatDateTime, formatRelativeTime } from "@/lib/formatters";

export type RenderPattern = "SSG" | "ISR" | "SSR" | "STREAMING" | "CSR";

const WHY: Record<RenderPattern, string> = {
  SSG:
    "El contenido taxonómico cambia raramente. Generarlo en build lo sirve desde CDN sin coste de servidor.",
  ISR:
    "Las observaciones cambian a diario. ISR sirve la versión reciente sin bloquear al usuario.",
  SSR:
    "La búsqueda depende de coordenadas únicas por petición. Debe resolverse en cada consulta.",
  STREAMING:
    "Tres fuentes con latencias distintas. Suspense muestra cada bloque cuando llega, sin esperar al más lento.",
  CSR:
    "Los filtros y el mapa son completamente interactivos. El estado vive en el navegador.",
};

const TRADEOFF: Record<RenderPattern, string> = {
  SSG:
    "Inviable para datos dinámicos. El contenido es tan reciente como el último build.",
  ISR:
    "La primera visita tras caducar sirve la versión vieja mientras regenera en segundo plano.",
  SSR:
    "El servidor retiene la respuesta hasta tener todos los datos. El TTFB puede ser alto.",
  STREAMING:
    "Hay que diseñar esqueletos cuidadosos para evitar saltos de layout (CLS).",
  CSR:
    "El HTML llega casi vacío. JavaScript desactivado deja la página sin contenido.",
};

interface RenderTelemetryProps {
  readonly pattern: RenderPattern;
  /** ISO timestamp taken on the server at render time. */
  readonly generatedAt: string;
  readonly revalidateSeconds?: number;
}

/** Small island component: shows "hace N minutos" by comparing generatedAt to now(). */
function PageAge({ generatedAt }: { generatedAt: string }) {
  const [age, setAge] = useState<string>("");
  useEffect(() => {
    const update = () => setAge(formatRelativeTime(generatedAt));
    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, [generatedAt]);
  return age ? (
    <span style={{ color: "var(--color-ink-muted)", fontSize: "0.75rem" }}>
      {" "}
      ({age})
    </span>
  ) : null;
}

/**
 * Sidebar panel shown on every page. Displays rendering pattern, timestamp,
 * "why here" rationale and the trade-off — making each page self-explanatory.
 */
export function RenderTelemetry({
  pattern,
  generatedAt,
  revalidateSeconds,
}: RenderTelemetryProps) {
  return (
    <aside
      aria-label="Información de rendering"
      style={{
        background: "var(--color-paper-deep)",
        border: "1px solid color-mix(in srgb, var(--color-ink) 15%, transparent)",
        borderRadius: "var(--radius-lg)",
        padding: "1.25rem",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        fontSize: "0.82rem",
        lineHeight: 1.5,
      }}
    >
      {/* Stamp + pattern name */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <Stamp label={pattern} size="lg" />
        <div>
          <p
            style={{
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "0.65rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--color-ink-muted)",
              margin: 0,
            }}
          >
            Patrón de rendering
          </p>
          <p
            style={{
              fontFamily: "var(--font-display, Georgia, serif)",
              fontSize: "1.1rem",
              fontWeight: 700,
              margin: 0,
            }}
          >
            {pattern}
          </p>
        </div>
      </div>

      {/* Metadata */}
      <dl style={{ margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <div>
          <dt
            style={{
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "0.6rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--color-ink-muted)",
              marginBottom: "0.1rem",
            }}
          >
            Generado
          </dt>
          <dd style={{ margin: 0, fontFamily: "var(--font-mono, monospace)" }}>
            <time dateTime={generatedAt}>{formatDateTime(generatedAt)}</time>
            <PageAge generatedAt={generatedAt} />
          </dd>
        </div>

        {revalidateSeconds !== undefined && (
          <div>
            <dt
              style={{
                fontFamily: "var(--font-mono, monospace)",
                fontSize: "0.6rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--color-ink-muted)",
                marginBottom: "0.1rem",
              }}
            >
              Revalida cada
            </dt>
            <dd style={{ margin: 0, fontFamily: "var(--font-mono, monospace)" }}>
              {revalidateSeconds} s
            </dd>
          </div>
        )}

        <div>
          <dt
            style={{
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "0.6rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--color-ink-muted)",
              marginBottom: "0.1rem",
            }}
          >
            ¿Por qué este patrón?
          </dt>
          <dd style={{ margin: 0, color: "var(--color-ink)" }}>{WHY[pattern]}</dd>
        </div>

        <div>
          <dt
            style={{
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "0.6rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--color-cinnabar)",
              marginBottom: "0.1rem",
            }}
          >
            Trade-off
          </dt>
          <dd style={{ margin: 0, color: "var(--color-ink)" }}>{TRADEOFF[pattern]}</dd>
        </div>
      </dl>
    </aside>
  );
}
