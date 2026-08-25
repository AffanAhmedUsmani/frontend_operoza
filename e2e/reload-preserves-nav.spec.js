import { test, expect } from "@playwright/test";

const TENANT_SLUG = "rbac-demo";
const PASSWORD = "Test@1234";

async function login(page, email) {
  await page.goto(`/operoza/${TENANT_SLUG}/login`);
  await page.getByLabel("Business email").fill(email);
  await page.getByLabel("Password").fill(PASSWORD);
  const loginButton = page.getByRole("button", { name: "Login to Tenant CRM" });
  // Explicit wait: this button starts disabled while the page validates the
  // tenant slug, and Playwright's own actionability auto-wait has occasionally
  // clicked through a brief disabled->enabled transition without the click
  // actually registering, under heavier load (many spec files' worth of
  // background activity). Waiting for a stable enabled state first is more
  // robust than relying on click()'s built-in wait alone.
  await expect(loginButton).toBeEnabled();
  await loginButton.click();
  await expect(page).toHaveURL(new RegExp(`/operoza/${TENANT_SLUG}/portal`));
}

// Regression test for the reload-nav-race fix in
// TenantCrmLayout.jsx (docs/SPRINT_PLAN.md Sprint 2). "Reports" only
// appears in an Agent's sidebar once the assigned-reports fetch resolves
// (crm/management/commands/seed_e2e_fixtures.py assigns one report to
// agent1 specifically so this nav item exists to select). Before the fix,
// a persisted selection for an item that isn't in the very first
// synchronous render of navItems fell back to items[0] ("Attendance")
// immediately - correct only by luck, once the fetch happened to resolve
// fast, and never correcting itself if the fetch failed. Delaying the
// fetch here makes that race window wide enough to assert against
// deterministically instead of relying on it happening to be slow.
test("agent reloading on an assigned-report page never snaps to the wrong panel first", async ({ page }) => {
  await login(page, `agent1@${TENANT_SLUG}.test`);

  await page.getByText("Reports", { exact: true }).click();
  await expect(page.getByRole("heading", { name: "Reports" })).toBeVisible();

  await page.route("**/api/crm/reports", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    await route.continue();
  });

  await page.reload();

  // While the delayed fetch is still pending, the old items[0] fallback
  // ("Attendance") must not appear as if it were the resolved answer.
  await expect(page.getByRole("heading", { name: "Attendance" })).not.toBeVisible({ timeout: 300 });

  // Once the delayed fetch resolves, the persisted selection reasserts
  // itself correctly.
  await expect(page.getByRole("heading", { name: "Reports" })).toBeVisible({ timeout: 5000 });
});
