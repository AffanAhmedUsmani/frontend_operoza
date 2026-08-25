import { test, expect } from "@playwright/test";

const TENANT_SLUG = "rbac-demo";
const PASSWORD = "Test@1234";

test("admin can log in and reach the tenant portal", async ({ page }) => {
  await page.goto(`/operoza/${TENANT_SLUG}/login`);
  await page.getByLabel("Business email").fill(`admin@${TENANT_SLUG}.test`);
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
});

test("wrong password is rejected with an inline error, not a silent failure", async ({ page }) => {
  await page.goto(`/operoza/${TENANT_SLUG}/login`);
  await page.getByLabel("Business email").fill(`admin@${TENANT_SLUG}.test`);
  await page.getByLabel("Password").fill("definitely-wrong");
  const loginButton = page.getByRole("button", { name: "Login to Tenant CRM" });
  // Explicit wait: this button starts disabled while the page validates the
  // tenant slug, and Playwright's own actionability auto-wait has occasionally
  // clicked through a brief disabled->enabled transition without the click
  // actually registering, under heavier load (many spec files' worth of
  // background activity). Waiting for a stable enabled state first is more
  // robust than relying on click()'s built-in wait alone.
  await expect(loginButton).toBeEnabled();
  await loginButton.click();

  // Asserting the specific message (not just "some error appeared") matters:
  // a CORS/network failure also surfaces as a generic alert, which would
  // make this test pass for the wrong reason and hide a real backend-
  // connectivity problem behind a "the login flow works" result. MUI's
  // Alert here doesn't set an ARIA role (confirmed by inspecting the
  // installed component), so this asserts on the rendered text directly.
  await expect(page.getByText(/invalid login credentials/i)).toBeVisible();
  await expect(page).toHaveURL(new RegExp(`/operoza/${TENANT_SLUG}/login`));
});
