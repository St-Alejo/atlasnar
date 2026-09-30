import type { CSSProperties } from "react";
import { Stamp } from "@/components/ui/Stamp";
import { t } from "@/i18n";
import { formatDateTime } from "@/lib/formatters";
import { PageAge } from "./PageAge";
import type { RenderPattern } from "./patterns";

export type { RenderPattern } from "./patterns";

interface RenderTelemetryProps {
  readonly pattern: RenderPattern;
  /** ISO timestamp taken on the server at render time. */
  readonly generatedAt: string;
  readonly revalidateSeconds?: number;
  /** Overrides the "generated" label, e.g. for CSR where data is fetched later. */
  readonly generatedLabel?: string;
}

const termStyle: CSSProperties = {
  fontFamily: "var(--font-mono, monospace)",
  fontSize: "0.6rem",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "var(--color-ink-muted)",
  marginBottom: "0.1rem",
};

/**
 * Server Component shown on every page: rendering pattern, server timestamp,
 * "why here" rationale and trade-off, so each page explains itself.
 */
export function RenderTelemetry({
  pattern,
  generatedAt,
  revalidateSeconds,
  generatedLabel,
}: RenderTelemetryProps) {
  const dict = t();
  return (
    <aside
      aria-label="Información de rendering"
      data-testid="render-telemetry"
      data-pattern={pattern}
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
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <Stamp label={pattern} size="lg" />
        <div>
          <p style={{ ...termStyle, margin: 0 }}>Patrón de rendering</p>
          <p
            style={{
              fontFamily: "var(--font-display, Georgia, serif)",
              fontSize: "1.1rem",
              fontWeight: 700,
              margin: 0,
            }}
          >
            {dict.pattern[pattern]}
          </p>
        </div>
      </div>

      <dl style={{ margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <div>
          <dt style={termStyle}>{generatedLabel ?? dict.telemetry.generatedAt}</dt>
          <dd style={{ margin: 0, fontFamily: "var(--font-mono, monospace)" }}>
            <time dateTime={generatedAt} data-testid="generated-at">
              {formatDateTime(generatedAt)}
            </time>
            <PageAge generatedAt={generatedAt} />
          </dd>
        </div>

        {revalidateSeconds !== undefined && (
          <div>
            <dt style={termStyle}>{dict.telemetry.revalidatesEvery}</dt>
            <dd style={{ margin: 0, fontFamily: "var(--font-mono, monospace)" }}>
              {revalidateSeconds} {dict.telemetry.seconds}
            </dd>
          </div>
        )}

        <div>
          <dt style={termStyle}>{dict.telemetry.whyThisPattern}</dt>
          <dd style={{ margin: 0 }}>{dict.patternWhy[pattern]}</dd>
        </div>

        <div>
          <dt style={{ ...termStyle, color: "var(--color-cinnabar)" }}>{dict.telemetry.tradeoff}</dt>
          <dd style={{ margin: 0 }}>{dict.patternTradeoff[pattern]}</dd>
        </div>
      </dl>
    </aside>
  );
}
