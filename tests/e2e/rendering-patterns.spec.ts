import { expect, test, type APIRequestContext } from "@playwright/test";

/** Reads the server timestamp printed by <RenderTelemetry /> from raw HTML. */
async function generatedAtOf(request: APIRequestContext, path: string): Promise<string> {
  const response = await request.get(path);
  expect(response.ok()).toBe(true);
  const html = await response.text();
  const match = html.match(/<time dateTime="([^"]+)" data-testid="generated-at"/);
  expect(match, `no telemetry timestamp in ${path}`).not.toBeNull();
  return match![1]!;
}

test.describe("browser health", () => {
  for (const path of ["/", "/herbarium/spectacled-bear", "/dossier/andean-cock-of-the-rock", "/lab"]) {
    test(`${path} loads without console errors or CSP violations`, async ({ page }) => {
      const problems: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") problems.push(msg.text());
      });
      page.on("pageerror", (error) => problems.push(error.message));

      await page.goto(path);
      await page.waitForLoadState("networkidle", { timeout: 30_000 });
      expect(problems).toEqual([]);
    });
  }
});

test.describe("SSG · Herbarium", () => {
  test("the generation time is the build time and does not change between loads", async ({ request }) => {
    const first = await generatedAtOf(request, "/herbarium/andean-cock-of-the-rock");
    const second = await generatedAtOf(request, "/herbarium/andean-cock-of-the-rock");
    expect(second).toBe(first);
  });

  test("the HTML already contains the species content", async ({ request }) => {
    const html = await (await request.get("/herbarium/andean-cock-of-the-rock")).text();
    expect(html).toContain("Rupicola peruvianus");
  });

  test("unknown species are a 404, never rendered on demand", async ({ request }) => {
    const response = await request.get("/herbarium/dodo");
    expect(response.status()).toBe(404);
  });
});

test.describe("ISR · Logbook", () => {
  test("is served from the ISR cache with a revalidation window", async ({ request }) => {
    const response = await request.get("/logbook/pasto");
    expect(response.ok()).toBe(true);
    expect(["HIT", "STALE"]).toContain(response.headers()["x-nextjs-cache"]);
    expect(response.headers()["cache-control"]).toContain("s-maxage=60");
  });
});

test.describe("SSR · Field Radar", () => {
  test("renders a new timestamp on every request", async ({ request }) => {
    const path = "/radar?lat=1.2136&lng=-77.2811&radius=15";
    const first = await generatedAtOf(request, path);
    const second = await generatedAtOf(request, path);
    expect(second).not.toBe(first);
  });

  test("invalid search params fall back to the form", async ({ page }) => {
    await page.goto("/radar?lat=abc");
    await expect(page.getByRole("button", { name: /Buscar/ })).toBeVisible();
    await expect(page.getByText("Ingresa coordenadas o usa tu ubicación")).toBeVisible();
  });
});

test.describe("Streaming SSR · Specimen Dossier", () => {
  test("the shell and skeletons arrive before the panels", async ({ page }) => {
    await page.goto("/dossier/andean-cock-of-the-rock", { waitUntil: "commit" });
    await expect(page.getByRole("heading", { level: 1, name: "Gallito de las rocas" })).toBeVisible();
    // With DEMO_LATENCY_MS=2000 the sightings panel takes ≥ 2.6 s: its skeleton must show first.
    await expect(page.getByTestId("skeleton-sightings")).toBeVisible();
    await expect(page.getByTestId("skeleton-sightings")).toBeHidden({ timeout: 30_000 });
  });

  test("with ?stream=off nothing is sent until every panel is ready", async ({ page }) => {
    await page.goto("/dossier/andean-cock-of-the-rock?stream=off", { waitUntil: "commit" });
    await expect(page.getByTestId("skeleton-sightings")).toHaveCount(0);
    await expect(page.getByTestId("render-telemetry")).toHaveAttribute("data-pattern", "SSR");
  });
});

test.describe("CSR · Field Lab", () => {
  test("the initial HTML has the shell but no observations", async ({ request }) => {
    const html = await (await request.get("/lab")).text();
    expect(html).toContain('data-testid="lab-skeleton"');
    expect(html).not.toContain("Ver en iNaturalist");
  });

  test("the browser itself calls the iNaturalist API", async ({ page }) => {
    const apiCall = page.waitForRequest((req) =>
      req.url().startsWith("https://api.inaturalist.org/v1/observations"),
    );
    await page.goto("/lab?group=Aves");
    const request = await apiCall;
    expect(new URL(request.url()).searchParams.get("iconic_taxa")).toBe("Aves");
    await expect(page.getByTestId("lab-status")).toHaveAttribute("data-status", /success|error/, {
      timeout: 30_000,
    });
  });

  test.describe("without JavaScript", () => {
    test.use({ javaScriptEnabled: false });

    // Note: Playwright disables script execution but Chromium's parser still
    // treats <noscript> as unrendered text, so its message is not asserted here.
    test("the lab stays an empty shell — the trade-off of CSR", async ({ page }) => {
      await page.goto("/lab");
      await expect(page.getByTestId("lab-skeleton")).toBeVisible();
      await expect(page.getByTestId("field-lab")).toHaveCount(0);
      await expect(page.getByText("Ver en iNaturalist")).toHaveCount(0);
    });
  });
});
