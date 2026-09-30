export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer
      style={{
        background: "var(--color-chrome)",
        color: "var(--color-chrome-text)",
        borderTop: "2px solid var(--color-moss)",
        padding: "2rem 1.5rem",
        marginTop: "auto",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1.5rem",
          alignItems: "start",
        }}
      >
        {/* Brand */}
        <div>
          <p
            style={{
              fontFamily: "var(--font-display, Georgia, serif)",
              fontSize: "1rem",
              fontWeight: 700,
              marginBottom: "0.4rem",
              color: "var(--color-chrome-text)",
            }}
          >
            🦜 Andean Field Atlas
          </p>
          <p
            style={{
              fontSize: "0.78rem",
              color: "var(--color-chrome-text)",
              opacity: 0.6,
              lineHeight: 1.5,
              maxWidth: "22ch",
            }}
          >
            Un cuaderno de campo para leer el territorio, y una excusa para entender cómo se renderiza la web.
          </p>
        </div>

        {/* Data sources */}
        <div>
          <p
            style={{
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "0.65rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--color-chrome-accent)",
              marginBottom: "0.5rem",
            }}
          >
            Fuentes de datos
          </p>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: "0.78rem", opacity: 0.75 }}>
            <li>
              <a
                href="https://www.gbif.org"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "inherit" }}
              >
                GBIF — Global Biodiversity Information Facility
              </a>
            </li>
            <li style={{ marginTop: "0.3rem" }}>
              <a
                href="https://www.inaturalist.org"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "inherit" }}
              >
                iNaturalist
              </a>
            </li>
          </ul>
        </div>

        {/* Academic */}
        <div>
          <p
            style={{
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "0.65rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--color-chrome-accent)",
              marginBottom: "0.5rem",
            }}
          >
            Contexto académico
          </p>
          <p style={{ fontSize: "0.78rem", opacity: 0.7, lineHeight: 1.5 }}>
            Programación Orientada a la Web
            <br />
            Taller: Patrones de Rendering
            <br />© {year}
          </p>
        </div>
      </div>
    </footer>
  );
}
