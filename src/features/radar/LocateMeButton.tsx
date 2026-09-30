"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LocateMeButton() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  function handleLocate() {
    if (!navigator.geolocation) {
      setStatus("error");
      return;
    }
    setStatus("loading");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const params = new URLSearchParams({
          lat: coords.latitude.toFixed(6),
          lng: coords.longitude.toFixed(6),
          radius: "15",
        });
        router.push(`/radar?${params}`);
      },
      () => setStatus("error"),
      { timeout: 8000 },
    );
  }

  return (
    <div>
      <button
        id="btn-locate-me"
        onClick={handleLocate}
        disabled={status === "loading"}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.6rem 1.2rem",
          background: "var(--color-moss)",
          color: "var(--color-paper)",
          border: "none",
          borderRadius: "var(--radius-full)",
          fontSize: "0.9rem",
          fontWeight: 600,
          cursor: status === "loading" ? "not-allowed" : "pointer",
          opacity: status === "loading" ? 0.7 : 1,
          transition: "opacity 0.2s",
        }}
      >
        {status === "loading" ? "⏳ Obteniendo ubicación…" : "📍 Usar mi ubicación"}
      </button>
      {status === "error" && (
        <p
          role="alert"
          style={{
            color: "var(--color-cinnabar)",
            fontSize: "0.82rem",
            marginTop: "0.5rem",
          }}
        >
          No se pudo obtener tu ubicación. Ingresa las coordenadas manualmente.
        </p>
      )}
    </div>
  );
}
