import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: [
        "src/domain/**",
        "src/infrastructure/**",
        "src/adapters/**",
        "src/lib/**",
        "src/features/lab/*.ts",
      ],
    },
  },
});
