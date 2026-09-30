"use client"; // Error boundaries must be Client Components

import Link from "next/link";
import { useEffect } from "react";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

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
            color: "var(--color-cinnabar)",
          }}
        >
          Entrada del cuaderno ilegible
        </p>
        <h1 style={{ fontSize: "clamp(1.8rem, 5vw, 2.6rem)", margin: "0.5rem 0 1rem" }}>
          La expedición tuvo un tropiezo
        </h1>
        <p style={{ color: "var(--color-ink-muted)", marginBottom: "1.5rem" }}>
          Una de las fuentes de datos no respondió como esperábamos. Suele ser temporal.
        </p>
        {error.digest && (
          <p
            style={{
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "0.7rem",
              color: "var(--color-ink-muted)",
            }}
          >
            Referencia: {error.digest}
          </p>
        )}
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", marginTop: "1.5rem" }}>
          <button
            type="button"
            onClick={() => retry()}
            style={{
              padding: "0.5rem 1.2rem",
              background: "var(--color-moss)",
              color: "var(--color-paper)",
              border: "none",
              borderRadius: "var(--radius-full)",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Reintentar
          </button>
          <Link href="/" style={{ padding: "0.5rem 1.2rem", color: "var(--color-moss)", fontWeight: 600 }}>
            Volver al inicio
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
