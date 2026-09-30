import type { DomainError } from "@/domain/errors";

const MESSAGES: Record<DomainError["kind"], string> = {
  "not-found": "No se encontró la información solicitada.",
  "rate-limited": "La fuente de datos está limitando las peticiones. Inténtalo de nuevo en unos segundos.",
  timeout: "La fuente de datos tardó demasiado en responder.",
  upstream: "La fuente de datos no está disponible en este momento.",
  "invalid-data": "La fuente de datos devolvió una respuesta inesperada.",
};

/** Shows an expected (typed) domain error in place of the content. */
export function ErrorNotice({ error }: { readonly error: DomainError }) {
  return (
    <p
      role="alert"
      data-error-kind={error.kind}
      style={{
        color: "var(--color-cinnabar)",
        background: "color-mix(in srgb, var(--color-cinnabar) 10%, transparent)",
        border: "1px solid color-mix(in srgb, var(--color-cinnabar) 30%, transparent)",
        borderRadius: "var(--radius-md)",
        padding: "0.75rem 1rem",
        fontSize: "0.85rem",
      }}
    >
      ⚠️ {MESSAGES[error.kind]}
    </p>
  );
}
