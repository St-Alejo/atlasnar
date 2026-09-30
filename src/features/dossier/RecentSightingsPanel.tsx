import { getDossierSightings } from "@/services/dossier.service";
import { ObservationList } from "@/features/logbook/ObservationList";

export async function RecentSightingsPanel({ scientificName }: { scientificName: string }) {
  const sightings = await getDossierSightings(scientificName);
  return (
    <div style={{ animation: "reveal 0.5s ease-out both" }}>
      <ObservationList
        observations={sightings}
        emptyMessage="No se encontraron avistamientos recientes en Nariño."
      />
    </div>
  );
}

export function SightingsSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          style={{
            height: 100,
            borderRadius: "var(--radius-lg)",
            background: "var(--color-paper-deep)",
            animation: "pulse-gentle 1.8s ease-in-out infinite",
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </div>
  );
}
