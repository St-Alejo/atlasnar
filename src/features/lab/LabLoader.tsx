"use client";

import dynamic from "next/dynamic";

export function LabSkeleton() {
  return (
    <div
      data-testid="lab-skeleton"
      aria-busy="true"
      style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
    >
      <div style={{ height: 86, borderRadius: "var(--radius-lg)", background: "var(--color-paper-deep)" }} />
      <div
        style={{
          height: 480,
          borderRadius: "var(--radius-lg)",
          background: "var(--color-paper-deep)",
          animation: "pulse-gentle 1.8s ease-in-out infinite",
        }}
      />
    </div>
  );
}

// ssr: false → the server sends only this skeleton; the lab (and its data)
// exist only after the JavaScript bundle runs in the browser.
const FieldLab = dynamic(() => import("./FieldLab"), {
  ssr: false,
  loading: () => <LabSkeleton />,
});

export function LabLoader() {
  return <FieldLab />;
}
