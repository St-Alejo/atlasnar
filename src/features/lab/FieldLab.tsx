"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Observation, IconicGroup } from "@/domain/models";
import { getBrowserObservationProvider } from "@/adapters/browser.factory";
import { FILTER_DEBOUNCE_MS } from "@/config/timing";
import { NARINO_REGION } from "@/config/municipalities";

interface LabFilters {
  group: IconicGroup | "";
  taxonName: string;
  from: string;
}

const GROUPS: { value: IconicGroup | ""; label: string }[] = [
  { value: "", label: "Todos los grupos" },
  { value: "Aves", label: "🦜 Aves" },
  { value: "Mammalia", label: "🦣 Mamíferos" },
  { value: "Plantae", label: "🌿 Plantas" },
  { value: "Insecta", label: "🐛 Insectos" },
  { value: "Amphibia", label: "🐸 Anfibios" },
  { value: "Reptilia", label: "🦎 Reptiles" },
  { value: "Fungi", label: "🍄 Hongos" },
];

type AsyncState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; message: string };

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export function FieldLab() {
  const [filters, setFilters] = useState<LabFilters>({ group: "", taxonName: "", from: "" });
  const debouncedFilters = useDebounce(filters, FILTER_DEBOUNCE_MS);
  const [state, setState] = useState<AsyncState<Observation[]>>({ status: "idle" });
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Cancel any in-flight request
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setState({ status: "loading" });

    const provider = getBrowserObservationProvider();
    provider
      .getObservations(
        {
          center: NARINO_REGION.center,
          radiusKm: NARINO_REGION.radiusKm,
          group: debouncedFilters.group || undefined,
          taxonName: debouncedFilters.taxonName || undefined,
          from: debouncedFilters.from || undefined,
          limit: 30,
          locale: "es",
        },
        controller.signal,
      )
      .then((result) => {
        if (controller.signal.aborted) return;
        if (result.ok) {
          setState({ status: "success", data: result.value });
        } else {
          setState({ status: "error", message: result.error.message });
        }
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setState({ status: "error", message: String(err) });
      });

    return () => controller.abort();
  }, [debouncedFilters]);

  const observations = state.status === "success" ? state.data : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Filters bar */}
      <section
        aria-label="Filtros"
        style={{
          background: "var(--color-paper-deep)",
          border: "1px solid color-mix(in srgb, var(--color-ink) 12%, transparent)",
          borderRadius: "var(--radius-lg)",
          padding: "1.25rem",
          display: "flex",
          gap: "1rem",
          flexWrap: "wrap",
          alignItems: "flex-end",
        }}
      >
        {/* Group */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
          <label
            htmlFor="filter-group"
            style={{
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "0.6rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--color-ink-muted)",
            }}
          >
            Grupo
          </label>
          <select
            id="filter-group"
            value={filters.group}
            onChange={(e) => setFilters((f) => ({ ...f, group: e.target.value as IconicGroup | "" }))}
            style={{
              padding: "0.4rem 0.7rem",
              border: "1px solid var(--color-paper-deep)",
              borderRadius: "var(--radius-md)",
              fontSize: "0.85rem",
              background: "var(--color-paper-light, #FAF6EE)",
              color: "var(--color-ink)",
              cursor: "pointer",
            }}
          >
            {GROUPS.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
        </div>

        {/* Taxon name */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", flex: 1, minWidth: "180px" }}>
          <label
            htmlFor="filter-taxon"
            style={{
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "0.6rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--color-ink-muted)",
            }}
          >
            Especie (nombre científico)
          </label>
          <input
            id="filter-taxon"
            type="text"
            placeholder="p.ej. Vultur gryphus"
            value={filters.taxonName}
            onChange={(e) => setFilters((f) => ({ ...f, taxonName: e.target.value }))}
            style={{
              padding: "0.4rem 0.7rem",
              border: "1px solid var(--color-paper-deep)",
              borderRadius: "var(--radius-md)",
              fontSize: "0.85rem",
              background: "var(--color-paper-light, #FAF6EE)",
              color: "var(--color-ink)",
            }}
          />
        </div>

        {/* From date */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
          <label
            htmlFor="filter-from"
            style={{
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "0.6rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--color-ink-muted)",
            }}
          >
            Desde
          </label>
          <input
            id="filter-from"
            type="date"
            value={filters.from}
            onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))}
            style={{
              padding: "0.4rem 0.7rem",
              border: "1px solid var(--color-paper-deep)",
              borderRadius: "var(--radius-md)",
              fontSize: "0.85rem",
              background: "var(--color-paper-light, #FAF6EE)",
              color: "var(--color-ink)",
            }}
          />
        </div>

        {/* Status indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginLeft: "auto" }}>
          {state.status === "loading" && (
            <span
              style={{
                fontFamily: "var(--font-mono, monospace)",
                fontSize: "0.75rem",
                color: "var(--color-ink-muted)",
                animation: "pulse-gentle 1.8s ease-in-out infinite",
              }}
            >
              ⏳ Cargando…
            </span>
          )}
          {state.status === "success" && (
            <span
              style={{
                fontFamily: "var(--font-mono, monospace)",
                fontSize: "0.75rem",
                color: "var(--color-moss)",
              }}
            >
              ✓ {observations.length} observaciones
            </span>
          )}
        </div>
      </section>

      {/* Network hint */}
      <p
        style={{
          fontFamily: "var(--font-mono, monospace)",
          fontSize: "0.7rem",
          color: "var(--color-ink-muted)",
          background: "color-mix(in srgb, var(--color-ochre) 15%, transparent)",
          border: "1px solid color-mix(in srgb, var(--color-ochre) 30%, transparent)",
          borderRadius: "var(--radius-md)",
          padding: "0.5rem 0.75rem",
        }}
      >
        🔬 <strong>CSR en acción:</strong> abre la pestaña Network de DevTools → verás el fetch al API de iNaturalist ocurriendo en el navegador, no en el servidor.
      </p>

      {/* Error */}
      {state.status === "error" && (
        <p
          role="alert"
          style={{
            color: "var(--color-cinnabar)",
            background: "color-mix(in srgb, var(--color-cinnabar) 10%, transparent)",
            border: "1px solid color-mix(in srgb, var(--color-cinnabar) 30%, transparent)",
            borderRadius: "var(--radius-md)",
            padding: "0.75rem 1rem",
            fontSize: "0.85rem",
          }}
        >
          ⚠️ {state.message}
        </p>
      )}

      {/* Results grid */}
      {state.status === "success" && observations.length === 0 && (
        <p style={{ color: "var(--color-ink-muted)", fontStyle: "italic", textAlign: "center", padding: "2rem" }}>
          No se encontraron observaciones con esos filtros en Nariño.
        </p>
      )}

      {observations.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "1rem",
          }}
        >
          {observations.map((obs, i) => (
            <article
              key={obs.id}
              style={{
                background: "var(--color-paper-light, #FAF6EE)",
                border: "1px solid var(--color-paper-deep)",
                borderRadius: "var(--radius-lg)",
                overflow: "hidden",
                animation: `reveal 0.35s ease-out ${i * 0.04}s both`,
              }}
            >
              {obs.photo?.url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={obs.photo.url.replace(/\/square\./, "/small.")}
                  alt={obs.species.scientificName}
                  style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover" }}
                  loading="lazy"
                />
              )}
              <div style={{ padding: "0.75rem" }}>
                <p
                  style={{
                    fontStyle: "italic",
                    fontWeight: 600,
                    fontSize: "0.82rem",
                    margin: "0 0 0.2rem",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {obs.species.scientificName}
                </p>
                {obs.species.commonName && (
                  <p
                    style={{
                      fontSize: "0.72rem",
                      color: "var(--color-ink-muted)",
                      margin: "0 0 0.35rem",
                    }}
                  >
                    {obs.species.commonName}
                  </p>
                )}
                {obs.observedAt && (
                  <p
                    style={{
                      fontFamily: "var(--font-mono, monospace)",
                      fontSize: "0.65rem",
                      color: "var(--color-ink-muted)",
                      margin: 0,
                    }}
                  >
                    📅 {obs.observedAt}
                  </p>
                )}
                {obs.placeGuess && (
                  <p
                    style={{
                      fontSize: "0.68rem",
                      color: "var(--color-ink-muted)",
                      margin: "0.15rem 0 0",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    📍 {obs.placeGuess}
                  </p>
                )}
                {obs.uri && (
                  <a
                    href={obs.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-block",
                      marginTop: "0.5rem",
                      fontSize: "0.65rem",
                      color: "var(--color-moss)",
                      fontFamily: "var(--font-mono, monospace)",
                      textDecoration: "none",
                    }}
                  >
                    iNat →
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
