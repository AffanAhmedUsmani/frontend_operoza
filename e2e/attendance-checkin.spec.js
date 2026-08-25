import { test, expect } from "@playwright/test";

const TENANT_SLUG = "rbac-demo";
const PASSWORD = "Test@1234";

test("agent can check in and check out, single-campaign assignment auto-resolves", async ({ page }) => {
  await page.goto(`/operoza/${TENANT_SLUG}/login`);
  await page.getByLabel("Business email").fill(`agent1@${TENANT_SLUG}.test`);
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

  await page.getByText("Attendance", { exact: true }).click();
  await expect(page.getByRole("heading", { name: "Attendance Controls" })).toBeVisible();

  // agent1 is assigned to exactly one campaign with no shift configured
  // (seed_sample_rbac_campaign) - Sprint 5's campaign-assignment stage
  // should auto-resolve it, no campaign picker should ever appear, and
  // the check-in should succeed without any shift-window restriction.
  await expect(page.getByLabel(/which campaign are you checking into/i)).toHaveCount(0);

  await page.getByRole("button", { name: "Check In", exact: true }).click();

  // Accepts either outcome: a fresh check-in, or "already checked in" if a
  // prior run left today's session open (the seed data isn't reset
  // per-run - see global-setup.js) - both prove the request succeeded
  // rather than erroring, which is what this test actually verifies.
  const alertMessage = page.locator(".MuiAlert-message").first();
  await expect(alertMessage).toBeVisible();
  await expect(alertMessage).toHaveText(/check-in recorded|already checked in/i);

  await page.getByRole("button", { name: "Check Out", exact: true }).click();
  await expect(page.locator(".MuiAlert-message").first()).toContainText(/check-out recorded/i);
});
