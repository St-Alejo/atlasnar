import type { Metadata } from "next";
import { Fraunces, Instrument_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
  display: "swap",
});

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibmplex",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Atlas de Biodiversidad de Nariño",
    template: "%s — Andean Field Atlas",
  },
  description:
    "Cuaderno de campo digital sobre la biodiversidad de Nariño, Colombia. Demuestra los cinco patrones de rendering de Next.js: SSG, ISR, SSR, Streaming SSR y CSR.",
  keywords: ["biodiversidad", "Nariño", "Colombia", "Next.js", "rendering", "SSG", "ISR", "SSR"],
  authors: [{ name: "Andean Field Atlas" }],
  openGraph: {
    title: "Andean Field Atlas — Biodiversidad de Nariño",
    description: "Un cuaderno de campo digital para leer el territorio.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${fraunces.variable} ${instrumentSans.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body>
        <a href="#main-content" className="skip-link">
          Saltar al contenido principal
        </a>
        {children}
      </body>
    </html>
  );
}
