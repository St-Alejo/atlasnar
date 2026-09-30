"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { LazyPointsMap } from "@/components/map/LazyPointsMap";
import type { MapPoint } from "@/components/map/types";
import { ErrorNotice } from "@/components/ui/ErrorNotice";
import { MUNICIPALITIES, NARINO_REGION, findMunicipality } from "@/config/municipalities";
import { FILTER_DEBOUNCE_MS } from "@/config/timing";
import type { IconicGroup, Observation } from "@/domain/models";
import { formatDate, formatDateTime } from "@/lib/formatters";
import { ICONIC_GROUPS, parseFilters, toSearch } from "./filters";
import { useDebouncedValue } from "./hooks/useDebouncedValue";
import { useLabStore } from "./hooks/useLabStore";
import { useObservations } from "./hooks/useObservations";
import { createLabStore, type LabStore } from "./labStore";

const GROUP_LABELS: Record<IconicGroup, string> = {
  Aves: "🦜 Aves",
  Mammalia: "🦣 Mamíferos",
  Plantae: "🌿 Plantas",
  Insecta: "🐛 Insectos",
  Amphibia: "🐸 Anfibios",
  Reptilia: "🦎 Reptiles",
  Fungi: "🍄 Hongos",
};

const REGION_ZOOM = 8;
const MUNICIPALITY_ZOOM = 11;

const labelStyle: CSSProperties = {
  fontFamily: "var(--font-mono, monospace)",
  fontSize: "0.65rem",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "var(--color-ink-muted)",
};

const controlStyle: CSSProperties = {
  padding: "0.4rem 0.7rem",
  border: "1px solid color-mix(in srgb, var(--color-ink) 25%, transparent)",
  borderRadius: "var(--radius-md)",
  fontSize: "0.85rem",
  background: "var(--color-paper-light)",
  color: "var(--color-ink)",
};

/** Entry point of the Field Lab. Only ever rendered in the browser (ssr: false). */
export default function FieldLab() {
  // Initial filters come from the URL, so every view is shareable.
  const [store] = useState(() => createLabStore(parseFilters(window.location.search)));

  // Keep the URL in sync without triggering a Next.js navigation.
  useEffect(
    () =>
      store.subscribe(() => {
        const search = toSearch(store.getState().filters);
        if (search !== window.location.search) {
          window.history.replaceState(null, "", `${window.location.pathname}${search}`);
        }
      }),
    [store],
  );

  return (
    <div data-testid="field-lab" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <FiltersBar store={store} />
      <Results store={store} />
    </div>
  );
}

function FiltersBar({ store }: { store: LabStore }) {
  const filters = useLabStore(store, (state) => state.filters);

  return (
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
      <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
        <label htmlFor="filter-group" style={labelStyle}>
          Grupo
        </label>
        <select
          id="filter-group"
          value={filters.group}
          onChange={(e) => store.setFilters({ group: e.target.value as IconicGroup | "" })}
          style={controlStyle}
        >
          <option value="">Todos los grupos</option>
          {ICONIC_GROUPS.map((group) => (
            <option key={group} value={group}>
              {GROUP_LABELS[group]}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
        <label htmlFor="filter-municipality" style={labelStyle}>
          Zona
        </label>
        <select
          id="filter-municipality"
          value={filters.municipality}
          onChange={(e) => store.setFilters({ municipality: e.target.value })}
          style={controlStyle}
        >
          <option value="">Todo Nariño</option>
          {MUNICIPALITIES.map((m) => (
            <option key={m.slug} value={m.slug}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", flex: 1, minWidth: "180px" }}>
        <label htmlFor="filter-taxon" style={labelStyle}>
          Especie (nombre científico)
        </label>
        <input
          id="filter-taxon"
          type="search"
          placeholder="p.ej. Colibri coruscans"
          value={filters.taxonName}
          onChange={(e) => store.setFilters({ taxonName: e.target.value })}
          style={controlStyle}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
        <label htmlFor="filter-from" style={labelStyle}>
          Desde
        </label>
        <input
          id="filter-from"
          type="date"
          value={filters.from}
          onChange={(e) => store.setFilters({ from: e.target.value })}
          style={controlStyle}
        />
      </div>
    </section>
  );
}

function Results({ store }: { store: LabStore }) {
  const filters = useLabStore(store, (state) => state.filters);
  const selectedId = useLabStore(store, (state) => state.selectedId);
  const debouncedFilters = useDebouncedValue(filters, FILTER_DEBOUNCE_MS);
  const state = useObservations(debouncedFilters);

  const municipality = debouncedFilters.municipality
    ? findMunicipality(debouncedFilters.municipality)
    : undefined;
  const observations = state.status === "success" ? state.data : [];
  const points: MapPoint[] = observations.flatMap((obs) =>
    obs.location
      ? [
          {
            id: obs.id,
            lat: obs.location.lat,
            lng: obs.location.lng,
            label: obs.species.commonName ?? obs.species.scientificName,
          },
        ]
      : [],
  );

  return (
    <>
      <p
        role="status"
        aria-live="polite"
        data-testid="lab-status"
        data-status={state.status}
        style={{
          fontFamily: "var(--font-mono, monospace)",
          fontSize: "0.75rem",
          color: "var(--color-ink-muted)",
        }}
      >
        {state.status === "loading" && "⏳ Consultando iNaturalist desde el navegador…"}
        {state.status === "success" &&
          `✓ ${observations.length} observaciones · datos obtenidos en el navegador a las ${formatDateTime(state.fetchedAt)}`}
        {state.status === "error" && "⚠️ Error al consultar"}
      </p>

      {state.status === "error" && <ErrorNotice error={state.error} />}

      <div className="lab-layout">
        {/* Map and list react to the same store: selecting in one highlights in the other. */}
        <div className="lab-map">
          <LazyPointsMap
            key={municipality?.slug ?? "narino"}
            points={points}
            center={municipality?.center ?? NARINO_REGION.center}
            zoom={municipality ? MUNICIPALITY_ZOOM : REGION_ZOOM}
            ariaLabel="Mapa de observaciones en Nariño"
            height={480}
            selectedId={selectedId}
            onSelect={(id) => store.select(id)}
          />
        </div>

        <ObservationGrid
          observations={observations}
          selectedId={selectedId}
          onSelect={(id) => store.select(id)}
          empty={state.status === "success" && observations.length === 0}
        />
      </div>

      <style>{`
        .lab-layout {
          display: grid;
          grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
          gap: 1rem;
          align-items: start;
        }
        .lab-map { position: sticky; top: 76px; }
        @media (max-width: 860px) {
          .lab-layout { grid-template-columns: 1fr; }
          .lab-map { position: static; }
        }
      `}</style>
    </>
  );
}

function ObservationGrid({
  observations,
  selectedId,
  onSelect,
  empty,
}: {
  observations: readonly Observation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  empty: boolean;
}) {
  if (empty) {
    return (
      <p
        style={{ color: "var(--color-ink-muted)", fontStyle: "italic", textAlign: "center", padding: "2rem" }}
      >
        No se encontraron observaciones con esos filtros en Nariño.
      </p>
    );
  }

  return (
    <ul
      aria-label="Observaciones (alternativa textual del mapa)"
      style={{
        listStyle: "none",
        margin: 0,
        padding: 0,
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
        gap: "0.75rem",
      }}
    >
      {observations.map((obs, i) => {
        const selected = obs.id === selectedId;
        return (
          <li key={obs.id}>
            <article
              style={{
                background: "var(--color-paper-light)",
                border: selected ? "2px solid var(--color-cinnabar)" : "1px solid var(--color-paper-deep)",
                borderRadius: "var(--radius-lg)",
                overflow: "hidden",
                animation: `reveal 0.35s ease-out ${Math.min(i, 12) * 0.04}s both`,
              }}
            >
              {obs.photo && (
                // Direct browser request on purpose: this station shows CSR, so
                // the image is not routed through the Next.js image optimizer.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={obs.photo.url}
                  alt={`Observación de ${obs.species.scientificName}`}
                  width={240}
                  height={180}
                  style={{ width: "100%", height: "auto", aspectRatio: "4/3", objectFit: "cover" }}
                  loading="lazy"
                />
              )}
              <div style={{ padding: "0.75rem" }}>
                <button
                  type="button"
                  onClick={() => onSelect(obs.id)}
                  aria-pressed={selected}
                  style={{
                    all: "unset",
                    cursor: "pointer",
                    fontStyle: "italic",
                    fontWeight: 600,
                    fontSize: "0.82rem",
                    display: "block",
                  }}
                >
                  {obs.species.scientificName}
                </button>
                {obs.species.commonName && (
                  <p
                    style={{
                      fontSize: "0.72rem",
                      color: "var(--color-ink-muted)",
                      margin: "0.2rem 0 0.35rem",
                    }}
                  >
                    {obs.species.commonName}
                  </p>
                )}
                {obs.observedAt && (
                  <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.65rem", margin: 0 }}>
                    📅 {formatDate(obs.observedAt)}
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
                {obs.photo && (
                  <p style={{ fontSize: "0.6rem", color: "var(--color-ink-muted)", margin: "0.3rem 0 0" }}>
                    {obs.photo.attribution}
                  </p>
                )}
                {obs.uri && (
                  <a
                    href={obs.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-block",
                      marginTop: "0.4rem",
                      fontSize: "0.65rem",
                      color: "var(--color-moss)",
                      fontFamily: "var(--font-mono, monospace)",
                    }}
                  >
                    Ver en iNaturalist →
                  </a>
                )}
              </div>
            </article>
          </li>
        );
      })}
    </ul>
  );
}
