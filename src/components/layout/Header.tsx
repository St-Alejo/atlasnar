import Link from "next/link";

const NAV_ITEMS = [
  { href: "/herbarium", label: "🌿 Herbarium", subtitle: "SSG" },
  { href: "/logbook/pasto", label: "📓 Logbook", subtitle: "ISR" },
  { href: "/radar", label: "📡 Radar", subtitle: "SSR" },
  { href: "/dossier/andean-cock-of-the-rock", label: "🗂️ Dossier", subtitle: "Streaming" },
  { href: "/lab", label: "🔬 Field Lab", subtitle: "CSR" },
] as const;

export function Header() {
  return (
    <header
      style={{
        background: "var(--color-chrome)",
        color: "var(--color-chrome-text)",
        borderBottom: "2px solid var(--color-moss)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          height: "60px",
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            textDecoration: "none",
            display: "flex",
            flexDirection: "column",
            lineHeight: 1.1,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-display, Georgia, serif)",
              fontSize: "1.1rem",
              fontWeight: 700,
              color: "var(--color-chrome-text)",
              letterSpacing: "-0.01em",
            }}
          >
            🦜 Andean Field Atlas
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "0.6rem",
              color: "var(--color-chrome-accent)",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            Biodiversidad · Nariño
          </span>
        </Link>

        {/* Navigation */}
        <nav aria-label="Estaciones del atlas">
          <ul
            style={{
              display: "flex",
              gap: "0.25rem",
              listStyle: "none",
              margin: 0,
              padding: 0,
              flexWrap: "wrap",
            }}
          >
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: "0.3rem 0.6rem",
                    borderRadius: "var(--radius-md)",
                    textDecoration: "none",
                    transition: "background 0.15s",
                  }}
                  className="header-nav-link"
                >
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 500,
                      color: "var(--color-chrome-text)",
                    }}
                  >
                    {item.label}
                  </span>
                  <span
                    style={{
                      fontSize: "0.55rem",
                      fontFamily: "var(--font-mono, monospace)",
                      color: "var(--color-chrome-accent)",
                      letterSpacing: "0.08em",
                    }}
                  >
                    {item.subtitle}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <style>{`
        .header-nav-link:hover {
          background: rgba(241,234,216,0.08);
        }
      `}</style>
    </header>
  );
}
