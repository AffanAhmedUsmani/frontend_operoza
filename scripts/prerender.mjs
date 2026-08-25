#!/usr/bin/env node
/**
 * scripts/prerender.mjs
 * ----------------------
 * Public-website Phase 3, Step 1 (PUBLIC_WEBSITE_SITEMAP.md).
 *
 * Produces real static HTML for the public marketing routes, without
 * touching React Router or the CRM's routing at all. Chosen instead of
 * vite-react-ssg (requires react-router-dom ^6, this app is on v7) and
 * instead of migrating to React Router v7's own "framework mode"
 * pre-rendering (requires rewriting the whole app's routing to
 * file-based routes - the CRM's routes along with everything else).
 *
 * How it works: builds the app normally (`vite build`), serves the
 * output via Vite's own programmatic `preview()` API (in-process, not a
 * spawned CLI subprocess - see the note below on why), then uses
 * Playwright (already a dependency here for e2e tests - see
 * package.json's test:e2e script) to visit each public route in a real
 * headless browser, wait for React to render (including the
 * SeoHead/react-helmet-async tags for that route), and writes the
 * fully-rendered HTML to `dist/`. CRM routes (anything under /operoza/)
 * are never visited or written - they stay pure client-side-rendered,
 * exactly as before.
 *
 * Why the in-process preview API, not a spawned `vite preview` process:
 * an earlier version of this script spawned `vite preview` as a child
 * process and killed it after each run. On Windows, spawning through a
 * shell (needed to resolve the `vite` CLI) means `.kill()` only
 * terminates the shell wrapper, not the actual `vite preview` process it
 * launched - a real, confirmed bug during development: the orphaned
 * server from a previous run kept serving stale content to the next
 * run, corrupting output in a way that looked like a react-helmet-async
 * bug but wasn't one. The in-process API has a real `http.Server`
 * handle this script can close directly, with no subprocess to leak.
 *
 * Every route is rendered from a fresh, isolated Playwright browser
 * context, and nothing is written to `dist/` until every route has been
 * captured - writing a route's output into `dist/` mid-crawl would
 * mutate the very shell the preview server serves as its SPA fallback
 * for every other route.
 *
 * Requires Chromium already installed (`npx playwright install
 * chromium`) - a one-time setup step in any environment that hasn't run
 * the e2e suite yet.
 *
 * Usage: `npm run build:prerender` (runs `vite build` first, then this
 * script). Does NOT replace the plain `npm run build` script - that
 * stays available unchanged; adopting build:prerender in an actual
 * deployment pipeline is a separate, deliberate decision.
 */
import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { preview } from "vite";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PORT = 4174; // deliberately not vite preview's default 4173, to avoid colliding with a manually-run preview server

// The only routes prerendered are real, shipped public pages - kept in
// lockstep with public/sitemap.xml by convention (see that file's own
// header comment). Add a route here in the same change that adds it to
// the sitemap and to App.jsx.
const PUBLIC_ROUTES = [
  "/",
  "/start",
  "/find-workspace",
  "/features",
  "/features/campaign-management",
  "/features/sales-leads",
  "/features/call-analysis",
  "/features/attendance-workforce",
  "/features/payroll-commission",
  "/features/dashboards-reports",
  "/features/client-portal",
  "/features/messaging-notifications",
  "/features/branding",
  "/features/data-export",
  "/campaigns",
  "/campaigns/medical-insurance",
  "/campaigns/auto-insurance",
  "/campaigns/burial-insurance",
  "/campaigns/solar-sales",
  "/campaigns/real-estate-leads",
  "/campaigns/customer-support",
  "/campaigns/tech-support",
  "/campaigns/debt-collection",
  "/campaigns/appointment-setting",
  "/campaigns/retention-campaign",
  "/pricing",
  "/security",
  "/about",
  "/faq",
  "/contact",
  "/demo",
];

// index.html ships a static <title>Operoza</title> fallback for the CRM
// (which never renders SeoHead) and for the pre-JS instant. Every
// prerendered public route DOES render a real SeoHead title, but
// react-helmet-async doesn't remove tags it didn't create, so the
// static one survives alongside it in the captured DOM. Strip exactly
// that one known tag - never any other <title> - before writing a
// prerendered route to disk.
const STATIC_FALLBACK_TITLE = "<title>Operoza</title>";

function stripStaticFallbackTitle(html) {
  return html.replace(STATIC_FALLBACK_TITLE, "");
}

async function main() {
  console.log(`[prerender] starting an in-process preview server on port ${PORT}...`);
  const server = await preview({
    root: ROOT,
    preview: { port: PORT, strictPort: true },
    logLevel: "warn",
  });
  const baseUrl = server.resolvedUrls?.local?.[0]?.replace(/\/$/, "") || `http://localhost:${PORT}`;
  console.log(`[prerender] serving dist/ at ${baseUrl}`);

  try {
    const browser = await chromium.launch();

    const rendered = new Map();
    for (const route of PUBLIC_ROUTES) {
      const context = await browser.newContext();
      const page = await context.newPage();
      const url = `${baseUrl}${route}`;
      console.log(`[prerender] rendering ${route}`);
      await page.goto(url, { waitUntil: "networkidle" });
      // Give react-helmet-async/late effects one extra tick to settle.
      await page.waitForTimeout(150);
      rendered.set(route, stripStaticFallbackTitle(await page.content()));
      await context.close();
    }

    await browser.close();

    const DIST = join(ROOT, "dist");
    for (const [route, html] of rendered) {
      const outPath = route === "/" ? join(DIST, "index.html") : join(DIST, route.replace(/^\//, ""), "index.html");
      await mkdir(dirname(outPath), { recursive: true });
      await writeFile(outPath, html, "utf-8");
      console.log(`[prerender] wrote ${outPath}`);
    }
  } finally {
    await new Promise((resolve) => server.httpServer.close(resolve));
  }

  console.log("[prerender] done.");
}

main().catch((err) => {
  console.error("[prerender] failed:", err);
  process.exit(1);
});
