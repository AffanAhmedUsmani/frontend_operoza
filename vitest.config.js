import { defineConfig } from "vitest/config";

// Separate from vite.config.js (build) and playwright.config.js (E2E) -
// Sprint 7 added this only for the safe-expression-evaluator's unit
// tests. Explicitly scoped to src/ so Vitest never tries to collect the
// Playwright specs under e2e/ (both frameworks default to picking up
// "*.spec.js", which otherwise collide).
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.{test,spec}.{js,jsx}"],
    exclude: ["e2e/**", "node_modules/**"],
  },
});
