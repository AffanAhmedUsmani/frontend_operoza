import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendDir = path.resolve(__dirname, "..", "..", "backend");
const pythonBin =
  process.platform === "win32"
    ? path.join(backendDir, "env", "Scripts", "python.exe")
    : path.join(backendDir, "env", "bin", "python");

// Runs once, before any webServer starts (Playwright's globalSetup executes
// before webServer per its own lifecycle), so this only ever shells out to
// `manage.py` directly against the dev SQLite DB - no running server
// required yet. Ensures the E2E suite is genuinely self-contained: `npx
// playwright test` from a clean checkout applies migrations and seeds the
// fixed rbac-demo tenant/users this suite's specs log in as, rather than
// requiring a manual seed step first.
export default function globalSetup() {
  const env = { ...process.env, DJANGO_SETTINGS_MODULE: "operoza_backend.settings.dev" };
  const run = (args) =>
    execFileSync(pythonBin, ["manage.py", ...args], { cwd: backendDir, stdio: "inherit", env });

  run(["migrate", "--noinput"]);
  run(["seed_sample_rbac_campaign", "--tenant-slug=rbac-demo"]);
  run(["seed_e2e_fixtures", "--tenant-slug=rbac-demo"]);
}
