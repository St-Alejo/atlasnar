import { defineConfig, devices } from "@playwright/test";

const PORT = 3200;

/**
 * E2E tests run against the production server (`build` + `start`): in
 * development every page renders on demand and SSG/ISR behave differently.
 */
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  fullyParallel: false,
  workers: 1, // one browser at a time keeps the upstream APIs happy
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    // A visible delay per dossier panel so the streaming test can observe skeletons.
    env: { DEMO_LATENCY_MS: "2000" },
  },
});
