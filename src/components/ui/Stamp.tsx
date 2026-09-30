import type { RenderPattern } from "@/components/telemetry/RenderTelemetry";

interface StampProps {
  label: RenderPattern;
  size?: "sm" | "md" | "lg";
}

const STAMP_COLORS: Record<RenderPattern, { bg: string; text: string; border: string }> = {
  SSG:       { bg: "#3E5C3A", text: "#F1EAD8", border: "#2A3F27" },
  ISR:       { bg: "#D9A441", text: "#1B2A22", border: "#B0832A" },
  SSR:       { bg: "#2E3A3F", text: "#F1EAD8", border: "#1C262A" },
  STREAMING: { bg: "#C2452D", text: "#F1EAD8", border: "#8E3020" },
  CSR:       { bg: "#6B9BA8", text: "#1B2A22", border: "#4A7685" },
};

const SIZES = {
  sm: { outer: 48, inner: 40, fontSize: 7, labelFontSize: 5 },
  md: { outer: 72, inner: 60, fontSize: 10, labelFontSize: 7 },
  lg: { outer: 96, inner: 80, fontSize: 13, labelFontSize: 9 },
};

/**
 * Circular archive-stamp badge — each rendering pattern gets a distinct colour.
 * Styled as a rubber stamp with dashed inner ring and pattern label.
 */
export function Stamp({ label, size = "md" }: StampProps) {
  const colors = STAMP_COLORS[label];
  const { outer, inner, fontSize, labelFontSize } = SIZES[size];
  const r = outer / 2;

  return (
    <svg
      role="img"
      aria-label={`Patrón de rendering: ${label}`}
      width={outer}
      height={outer}
      viewBox={`0 0 ${outer} ${outer}`}
      style={{ flexShrink: 0 }}
    >
      {/* Outer circle */}
      <circle cx={r} cy={r} r={r - 1} fill={colors.bg} stroke={colors.border} strokeWidth={1.5} />
      {/* Inner dashed ring */}
      <circle
        cx={r}
        cy={r}
        r={inner / 2}
        fill="none"
        stroke={colors.text}
        strokeWidth={0.8}
        strokeDasharray="2 2"
        opacity={0.6}
      />
      {/* Pattern text */}
      <text
        x={r}
        y={r + fontSize * 0.35}
        textAnchor="middle"
        fill={colors.text}
        fontFamily="'IBM Plex Mono', monospace"
        fontWeight="600"
        fontSize={fontSize}
        letterSpacing={1}
      >
        {label}
      </text>
      {/* "RENDERING" sub-label */}
      <text
        x={r}
        y={r + fontSize * 1.4}
        textAnchor="middle"
        fill={colors.text}
        fontFamily="'IBM Plex Mono', monospace"
        fontWeight="400"
        fontSize={labelFontSize}
        letterSpacing={0.5}
        opacity={0.7}
      >
        RENDERING
      </text>
    </svg>
  );
}
