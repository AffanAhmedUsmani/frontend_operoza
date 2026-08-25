import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "@playwright/test";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendDir = path.resolve(__dirname, "..", "backend");
const pythonBin =
  process.platform === "win32"
    ? path.join(backendDir, "env", "Scripts", "python.exe")
    : path.join(backendDir, "env", "bin", "python");

// Sprint 2 (docs/SPRINT_PLAN.md) - real automated test runner for the
// frontend. Playwright over Puppeteer/Selenium: cross-browser (Puppeteer is
// Chromium-only), and ships its own test runner/assertions (raw Selenium
// does not) - the right tool for exactly what this suite needs to prove,
// which is "reload the page and check what actually renders."
export default defineConfig({
  testDir: "./e2e",
  // Sprint 13 (docs/SPRINT_PLAN.md) - this suite has grown from a
  // handful of specs to 9 files/15+ tests across many sprints, all
  // sharing one sequential worker and one dev server for the whole run
  // (fullyParallel: false, by design - see below). 30s, sized for the
  // original small suite, started intermittently timing out on the
  // longer specs (e.g. follow-up-tasks.spec.js's two-login flow) purely
  // from cumulative load late in a full run, not from any functional
  // defect - each spec passes reliably in isolation.
  timeout: 45_000,
  fullyParallel: false, // tests share one seeded dev DB - keep them sequential to avoid state races
  retries: 0,
  reporter: [["list"]],
  globalSetup: "./e2e/global-setup.js",
  // Deliberately different ports from the normal dev setup (5173/8000) so
  // this suite never collides with - or gets confused by - a developer's
  // own manual dev servers already running locally.
  use: {
    baseURL: "http://127.0.0.1:5174",
    trace: "retain-on-failure",
  },
  webServer: [
    {
      command: `"${pythonBin}" manage.py runserver 127.0.0.1:8010 --noreload`,
      cwd: backendDir,
      env: { DJANGO_SETTINGS_MODULE: "operoza_backend.settings.dev" },
      url: "http://127.0.0.1:8010/api/auth/live-workspaces",
      reuseExistingServer: false,
      timeout: 60_000,
    },
    {
      // --host 127.0.0.1 matters: Vite's default "localhost" bind resolves
      // to the IPv6 loopback (::1) on this machine, which a health check
      // against 127.0.0.1 (IPv4) never sees, even though the server really
      // is up - confirmed by testing the bare command directly.
      command: "npm run dev -- --port 5174 --strictPort --host 127.0.0.1",
      cwd: __dirname,
      env: { VITE_API_BASE_URL: "http://127.0.0.1:8010" },
      url: "http://127.0.0.1:5174",
      reuseExistingServer: false,
      timeout: 60_000,
    },
  ],
});
