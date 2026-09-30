import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

export default function NotFound() {
  return (
    <>
      <Header />
      <main
        id="main-content"
        style={{ maxWidth: "640px", margin: "0 auto", padding: "4rem 1.5rem", textAlign: "center" }}
      >
        <p
          style={{
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "0.75rem",
            color: "var(--color-ink-muted)",
          }}
        >
          N.º 0404 · Espécimen no catalogado
        </p>
        <h1 style={{ fontSize: "clamp(1.8rem, 5vw, 2.6rem)", margin: "0.5rem 0 1rem" }}>
          Esta página no está en el herbario
        </h1>
        <p style={{ color: "var(--color-ink-muted)", marginBottom: "1.5rem" }}>
          Puede que la especie o el municipio no formen parte del atlas.
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
          <Link href="/herbarium" style={{ color: "var(--color-moss)", fontWeight: 600 }}>
            Ver el Herbarium
          </Link>
          <Link href="/" style={{ color: "var(--color-moss)", fontWeight: 600 }}>
            Volver al inicio
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
