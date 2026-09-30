# 🦜 Andean Field Atlas — Atlas de Biodiversidad de Nariño

Cuaderno de campo digital sobre la biodiversidad de Nariño (Colombia) que demuestra, en una sola aplicación
Next.js, los cinco patrones de rendering: **SSG, ISR, SSR, Streaming SSR y CSR**.

**Curso:** Programación Orientada a la Web · **Taller:** Patrones de Rendering
**Stack:** Next.js 16 (App Router) · React 19 · TypeScript estricto · Tailwind CSS 4 · Leaflet · Zod · Vitest · Playwright

---

## Mapa de patrones

| Ruta                      | Estación         | Patrón                               | Datos                                    |
| ------------------------- | ---------------- | ------------------------------------ | ---------------------------------------- |
| `/`                       | Portada          | SSG                                  | Contenido propio                         |
| `/herbarium`              | Herbarium        | SSG                                  | Lista curada (sin red)                   |
| `/herbarium/[slug]`       | Herbarium        | SSG · `generateStaticParams`         | GBIF + iNaturalist, en build             |
| `/logbook`                | Logbook          | SSG                                  | Índice de municipios                     |
| `/logbook/[municipality]` | Logbook          | ISR · `revalidate = 60`              | iNaturalist (2 prebuild, resto perezoso) |
| `/radar`                  | Field Radar      | SSR · `force-dynamic`                | iNaturalist según `searchParams`         |
| `/dossier/[slug]`         | Specimen Dossier | Streaming SSR · `Suspense`           | 3 fuentes con latencias distintas        |
| `/lab`                    | Field Lab        | CSR · `dynamic(..., { ssr: false })` | iNaturalist llamado desde el navegador   |

Salida real de `npm run build`:

```
┌ ○ /
├ ƒ /dossier/[slug]
├ ○ /herbarium
├   /herbarium/[slug]          ● 10 rutas (fallback: false → 404 para slugs desconocidos)
├ ○ /lab
├ ○ /logbook
├   /logbook/[municipality]    ● pasto, ipiales (revalidate 60 s)
└ ƒ /radar
```

## Puesta en marcha

Requisitos: Node.js 22 LTS y npm.

```bash
npm install
cp .env.example .env.local
npm run build && npm run start   # para ver los patrones reales
```

> ⚠️ En `npm run dev` todo se renderiza bajo demanda: SSG e ISR **no** se comportan como en producción.

| Comando                         | Qué hace                                                |
| ------------------------------- | ------------------------------------------------------- |
| `npm run dev`                   | Servidor de desarrollo                                  |
| `npm run build` / `start`       | Build de producción (clasificación de rutas) y servidor |
| `npm run lint` / `format:check` | ESLint / Prettier                                       |
| `npm run typecheck`             | `next typegen` + `tsc --noEmit`                         |
| `npm test`                      | Tests unitarios (Vitest)                                |
| `npm run test:e2e`              | Tests E2E (Playwright, contra `next start`)             |

### Variables de entorno

| Variable               | Uso                                                                   |
| ---------------------- | --------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL` | URL pública del sitio                                                 |
| `INAT_USER_AGENT`      | `User-Agent` identificable en las peticiones del servidor             |
| `DEMO_LATENCY_MS`      | Retraso artificial por panel del Dossier (p. ej. `2000` para la demo) |

Se validan con Zod al arrancar (`src/infrastructure/config/env.ts`).

## Arquitectura

```
app/ (composición) → features/ → services/ → domain/ (tipos y puertos)
                                     ↑
adapters/ (GBIF, iNaturalist) ──implementa──┘ → infrastructure/ (HTTP, cola, config)
```

- `domain/` es TypeScript puro: modelos, puertos (`TaxonomyProvider`, `ObservationProvider`), `Result` y errores tipados.
- `adapters/` valida cada respuesta con Zod y la traduce con _mappers_ al dominio. `provider.factory.ts` es la raíz de
  composición del servidor y `browser.factory.ts` la del navegador (Field Lab).
- `infrastructure/http` define decoradores encadenados: **caché → cola → reintentos → timeout → fetch**. Los aciertos de
  caché no esperan turno en la cola, y los reintentos conservan su turno para que el _backoff_ también limite el ritmo.

| Patrón de diseño       | Dónde                                                         |
| ---------------------- | ------------------------------------------------------------- |
| Queue (límite de tasa) | `infrastructure/queue/RateLimitedQueue.ts`                    |
| Adapter + Port         | `adapters/*` implementan `domain/ports/*`                     |
| Factory / Composition  | `adapters/provider.factory.ts`, `adapters/browser.factory.ts` |
| Decorator              | `withCache`, `withQueue`, `withRetry`, `withTimeout`          |
| Strategy               | Taxonomía de GBIF, fotos y observaciones de iNaturalist       |
| Facade / Service layer | `services/*`                                                  |
| Result / Either        | `domain/result.ts`, adaptadores y servicios                   |
| Observer               | `features/lab/labStore.ts` (filtros, mapa y lista)            |

## Decisiones y hallazgos

- **Sin `cacheComponents`.** Next 16 lo ofrece como opción, pero con él desaparecen `revalidate`/`dynamic`. Se usa el
  modelo de _route segment config_, que es el que enseña el taller.
- **GBIF limita la tasa muy pronto (HTTP 429).** Cada API tiene su propia cola, con reintentos exponenciales, y el build
  usa `experimental.cpus: 1` para que la cola (que es por proceso) limite de verdad todo el build.
- **Frontera de Nariño.** Un círculo alrededor del departamento incluye Carchi e Imbabura (Ecuador). Todas las
  consultas "de Nariño" se cruzan con el lugar de iNaturalist `12737`. Al verificarlo, el cóndor andino y la danta de
  páramo resultaron no tener observaciones de iNaturalist dentro del departamento, así que salieron de la lista curada.
- **Streaming medido:** con `DEMO_LATENCY_MS=2000`, `/dossier/andean-cock-of-the-rock` tarda 0,02 s en enviar el primer
  byte, frente a ~4,8 s con `?stream=off`, para el mismo contenido total. No hay `loading.tsx` en el Dossier: rodearía
  también el modo OFF con un _fallback_ y arruinaría la comparación.
- **ISR y errores.** Si una regeneración en segundo plano falla, la página lanza el error y Next sigue sirviendo la
  última versión buena. Durante `next build` muestra un aviso para no romper el build.
- **Hora fija de Colombia.** Todas las fechas se formatean en `America/Bogota`, para que servidor y navegador produzcan el
  mismo HTML (sin errores de hidratación).
- **Contraste.** El cinabrio del diseño original (`#C2452D`, 4,18:1) no pasa WCAG AA sobre papel, así que se oscureció a
  `#A93A24` (5,27:1). El modo oscuro ("cuaderno de noche") redefine todos los tokens, y cabecera y pie usan colores
  fijos.
- **Idioma.** La interfaz está en español; los textos de telemetría viven en `src/i18n/es.json`.

## Guion de demostración

| #   | Estación            | Qué hacer                                     | Qué se observa                                            |
| --- | ------------------- | --------------------------------------------- | --------------------------------------------------------- |
| 1   | Herbarium (SSG)     | Abrir una ficha, recargar, ver código fuente  | Hora fija (la del build); el HTML trae el contenido       |
| 2   | Logbook (ISR)       | Recargar, esperar 60 s, recargar dos veces    | Versión vieja primero; luego la nueva, sin espera         |
| 3   | Field Radar (SSR)   | Buscar un municipio y recargar                | Hora distinta en cada carga                               |
| 4   | Dossier (Streaming) | Alternar Streaming ON / OFF                   | Marco inmediato y paneles que se revelan, frente a espera |
| 5   | Field Lab (CSR)     | Cambiar filtros, abrir Network, desactivar JS | `fetch` en el navegador; sin JS queda el marco vacío      |
| 6   | Build               | Mostrar la salida de `npm run build`          | `○`/`●` estáticas · `ƒ` dinámicas                         |

La cabecera `x-nextjs-cache` (`HIT`, `STALE`, `MISS`) permite ver el ciclo de ISR desde la pestaña Network.

## Despliegue (Vercel)

1. Subir el repositorio a GitHub.
2. En Vercel: **Add New → Project**, importar el repositorio.
3. Configurar las variables de `.env.example` (sin `DEMO_LATENCY_MS` en producción real).
4. Verificar en el resumen del build la clasificación de cada ruta.

## Créditos

Datos: **GBIF** e **iNaturalist**; solo se muestran fotos con licencia Creative Commons y siempre con su atribución.
Mapa base © colaboradores de OpenStreetMap. Tipografías: Fraunces, Instrument Sans e IBM Plex Mono (licencias abiertas).
