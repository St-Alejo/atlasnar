import type { Emblem, ThermalFloor } from "@/domain/models";

export interface CuratedSpecies {
  readonly slug: string;
  readonly scientificName: string;
  readonly emblem: Emblem;
  readonly thermalFloor: ThermalFloor;
  /** Fallback names, used when iNaturalist is unreachable. */
  readonly commonName: { readonly es: string; readonly en: string };
}

/**
 * Scientific names, not IDs: keys are resolved at build time through
 * GBIF `/species/match`. Every entry was checked to have records inside the
 * department (iNaturalist place 12737 and GBIF stateProvince=Nariño) before
 * being added. The Andean condor and the mountain tapir were dropped: their
 * "Nariño" iNaturalist records were really in Carchi/Imbabura, Ecuador.
 */
export const CURATED_SPECIES: readonly CuratedSpecies[] = [
  {
    slug: "spectacled-bear",
    scientificName: "Tremarctos ornatus",
    emblem: "mammal",
    thermalFloor: "paramo",
    commonName: { es: "Oso de anteojos", en: "Spectacled bear" },
  },
  {
    slug: "sparkling-violetear",
    scientificName: "Colibri coruscans",
    emblem: "bird",
    thermalFloor: "cloud-forest",
    commonName: { es: "Colibrí chillón", en: "Sparkling violetear" },
  },
  {
    slug: "frailejon-de-narino",
    scientificName: "Espeletia pycnophylla",
    emblem: "plant",
    thermalFloor: "paramo",
    commonName: { es: "Frailejón", en: "Frailejón" },
  },
  {
    slug: "puya-hamata",
    scientificName: "Puya hamata",
    emblem: "plant",
    thermalFloor: "paramo",
    commonName: { es: "Puya o achupalla", en: "Puya" },
  },
  {
    slug: "sword-billed-hummingbird",
    scientificName: "Ensifera ensifera",
    emblem: "bird",
    thermalFloor: "cloud-forest",
    commonName: { es: "Colibrí pico espada", en: "Sword-billed hummingbird" },
  },
  {
    slug: "andean-cock-of-the-rock",
    scientificName: "Rupicola peruvianus",
    emblem: "bird",
    thermalFloor: "cloud-forest",
    commonName: { es: "Gallito de las rocas", en: "Andean cock-of-the-rock" },
  },
  {
    slug: "grey-breasted-mountain-toucan",
    scientificName: "Andigena hypoglauca",
    emblem: "bird",
    thermalFloor: "cloud-forest",
    commonName: { es: "Terlaque andino", en: "Grey-breasted mountain toucan" },
  },
  {
    slug: "golden-headed-quetzal",
    scientificName: "Pharomachrus auriceps",
    emblem: "bird",
    thermalFloor: "cloud-forest",
    commonName: { es: "Quetzal cabecidorado", en: "Golden-headed quetzal" },
  },
  {
    slug: "blue-and-black-tanager",
    scientificName: "Tangara vassorii",
    emblem: "bird",
    thermalFloor: "cloud-forest",
    commonName: { es: "Tangara azul y negra", en: "Blue-and-black tanager" },
  },
  {
    slug: "fire-star-orchid",
    scientificName: "Epidendrum secundum",
    emblem: "plant",
    thermalFloor: "cloud-forest",
    commonName: { es: "Flor de cristo", en: "Fire-star orchid" },
  },
] as const;

export function findCuratedSpecies(slug: string): CuratedSpecies | undefined {
  return CURATED_SPECIES.find((species) => species.slug === slug);
}

/** Museum-style catalogue number, stable as long as the list order is. */
export function catalogNumberOf(slug: string): number {
  return CURATED_SPECIES.findIndex((species) => species.slug === slug) + 1;
}
