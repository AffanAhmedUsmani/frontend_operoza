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

// Sprint 10 (docs/SPRINT_PLAN.md) - a real, reachable Payroll view exists
// for Admin/Team Lead/Agent/HR Manager now (previously nothing at all -
// Sprint 8's audit confirmed there was no live payroll UI to even fix).
// These are smoke checks that the new nav item renders and its panel
// mounts without error - the underlying computation/scoping is already
// covered exhaustively by payroll's own backend test suite.

test("admin: Payroll nav item renders the payroll panel", async ({ page }) => {
  await login(page, `admin@${TENANT_SLUG}.test`);
  await page.getByText("Payroll", { exact: true }).click();
  await expect(page.getByRole("heading", { name: "Payroll", exact: true })).toBeVisible();
});

test("hr manager: Payroll nav item renders own payroll plus deduction overview", async ({ page }) => {
  await login(page, `hr@${TENANT_SLUG}.test`);
  await page.getByText("Payroll", { exact: true }).click();
  await expect(page.getByRole("heading", { name: "Payroll", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Docking Policy" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Attendance Deduction Counts" })).toBeVisible();
});

test("agent: Payroll nav item renders own payout view", async ({ page }) => {
  await login(page, `agent1@${TENANT_SLUG}.test`);
  await page.getByText("Payroll", { exact: true }).click();
  await expect(page.getByRole("heading", { name: "Payroll", exact: true })).toBeVisible();
});
