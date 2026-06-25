// vitest.config.ts — Unit test runner for the lib/pulse/ modules.
//
// Phase 2 of Plumbline v1.0 — the math + factor-registry ported from
// v1.0-worker/ into the production repo, runnable both in Node (vitest) and in
// the browser (Next.js client bundle).

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: false,
    environment: "node",
    include: ["lib/pulse/__tests__/**/*.test.ts"],
    exclude: ["node_modules/**", ".next/**", "out/**"],
    testTimeout: 30_000,
    reporters: ["default"],
  },
});