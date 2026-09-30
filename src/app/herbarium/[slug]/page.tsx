import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SpecimenPlate } from "@/features/herbarium/SpecimenPlate";
import { getSpeciesBySlug, getAllSpeciesSlugs } from "@/services/species.service";

// Unknown slugs → immediate 404, never rendered on demand
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllSpeciesSlugs();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const species = await getSpeciesBySlug(slug);
  if (!species) return {};
  return {
    title: `${species.commonName} · Herbarium`,
    description: species.profile?.summary?.slice(0, 160) ?? `Ficha de ${species.scientificName} en el Atlas de Biodiversidad de Nariño.`,
  };
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function SpeciesPage({ params }: PageProps) {
  const { slug } = await params;
  const species = await getSpeciesBySlug(slug);
  if (!species) notFound();

  const generatedAt = new Date().toISOString();

  return (
    <>
      <Header />
      <main
        id="main-content"
        style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem 1.5rem" }}
      >
        <nav
          aria-label="Breadcrumb"
          style={{
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "0.72rem",
            marginBottom: "1.5rem",
            color: "var(--color-ink-muted)",
          }}
        >
          <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>Inicio</Link>
          {" / "}
          <Link href="/herbarium" style={{ color: "inherit", textDecoration: "none" }}>Herbarium</Link>
          {" / "}
          <span>{species.commonName}</span>
        </nav>

        <SpecimenPlate species={species} generatedAt={generatedAt} />
      </main>
      <Footer />
    </>
  );
}
