import { ErrorNotice } from "@/components/ui/ErrorNotice";
import { ObservationList } from "@/features/logbook/ObservationList";
import { getDossierSightings } from "@/services/dossier.service";

export async function RecentSightingsPanel({ scientificName }: { scientificName: string }) {
  const result = await getDossierSightings(scientificName);
  if (!result.ok) return <ErrorNotice error={result.error} />;
  return (
    <div data-testid="panel-sightings" className="animate-reveal">
      <ObservationList
        observations={result.value}
        emptyMessage="No se encontraron avistamientos recientes en Nariño."
      />
    </div>
  );
}

export function SightingsSkeleton() {
  return (
    <div
      data-testid="skeleton-sightings"
      aria-hidden="true"
      style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
    >
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
