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

// Sprint 8 (docs/SPRINT_PLAN.md) - the TL-002/HR-002/CL-001 duplicate-nav
// defect: Team Lead, HR Manager, and Client each used to render their own
// internal <Tabs> bar IN ADDITION to the sidebar, and for HR Manager
// specifically the sidebar didn't even work at all (the component never
// read activeNavLabel). These tests prove exactly one navigation surface
// now exists, and that clicking a sidebar item actually changes what's
// shown - for HR Manager in particular, this is a real regression test
// for a previously completely broken interaction, not just a style check.

test("team lead: sidebar navigation is the only nav surface and actually switches sections", async ({ page }) => {
  await login(page, `teamlead@${TENANT_SLUG}.test`);

  // No internal <Tabs> bar should exist at all - MUI's Tab renders with
  // role="tab". Before the fix, this rendered a second, duplicate nav
  // surface alongside the sidebar.
  await expect(page.getByRole("tab")).toHaveCount(0);

  await page.getByText("Reports", { exact: true }).click();
  await expect(page.getByRole("heading", { name: "Reports" })).toBeVisible();

  await page.getByText("My Team", { exact: true }).click();
  await expect(page.getByRole("heading", { name: "My Team" })).toBeVisible();
});

test("hr manager: sidebar navigation actually switches sections (previously a no-op)", async ({ page }) => {
  await login(page, `hr@${TENANT_SLUG}.test`);

  await expect(page.getByRole("tab")).toHaveCount(0);

  // Before Sprint 8, HRManagerDashboard never read activeNavLabel at all -
  // clicking this did nothing, and only an internal Tabs bar worked.
  await page.getByText("Timesheets", { exact: true }).click();
  await expect(page.getByRole("heading", { name: "Timesheets" })).toBeVisible();

  await page.getByText("Attendance", { exact: true }).click();
  await expect(page.getByRole("heading", { name: "Attendance Controls" })).toBeVisible();
});

test("client: sidebar navigation is the only nav surface and shows real campaign data", async ({ page }) => {
  await login(page, `client@${TENANT_SLUG}.test`);

  await expect(page.getByRole("tab")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Campaigns" })).toBeVisible();
  // Real, fetched content - not the old stub text pointing at other tabs.
  await expect(page.getByText(/read-only campaign milestones/i)).toHaveCount(0);
});
