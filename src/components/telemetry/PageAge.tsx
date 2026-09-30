"use client";

import { useSyncExternalStore } from "react";
import { formatRelativeTime } from "@/lib/formatters";

const TICK_MS = 1_000;

function subscribe(onTick: () => void): () => void {
  const id = setInterval(onTick, TICK_MS);
  return () => clearInterval(id);
}

// Snapshots are rounded to the tick so React sees a stable value between ticks.
const getSnapshot = () => Math.floor(Date.now() / TICK_MS) * TICK_MS;
const getServerSnapshot = () => null;

/**
 * Tiny client island: "hace 12 segundos". It renders nothing on the server,
 * so the HTML stays identical between the server and the first client render.
 */
export function PageAge({ generatedAt }: { readonly generatedAt: string }) {
  const now = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  if (now === null) return null;
  return (
    <span data-testid="page-age" style={{ color: "var(--color-ink-muted)", fontSize: "0.75rem" }}>
      {" "}
      ({formatRelativeTime(generatedAt, now)})
    </span>
  );
}
