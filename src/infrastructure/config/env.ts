import "server-only";
import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url().default("http://localhost:3000"),
  DEMO_LATENCY_MS: z.coerce.number().int().min(0).max(10_000).default(0),
  INAT_USER_AGENT: z.string().min(1).default("AndeanFieldAtlas/1.0 (academic project)"),
});

export type Env = z.infer<typeof envSchema>;

export const env: Env = envSchema.parse(process.env); // fails fast on startup
