import { test, expect } from "@playwright/test";

const TENANT_SLUG = "rbac-demo";
const PASSWORD = "Test@1234";

async function loginAsAdmin(page) {
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
}

test("admin can add, see the current-IP helper for, and remove a network access entry", async ({ page }) => {
  await loginAsAdmin(page);

  await page.getByText("Settings", { exact: true }).click();
  await expect(page.getByText(/network access/i)).toBeVisible();

  // The current-session-IP helper resolves from the backend, not a placeholder.
  const ipHelper = page.getByText(/your current session ip is/i);
  await expect(ipHelper).toBeVisible();
  await expect(ipHelper).not.toContainText("…");

  const label = `E2E test network ${Date.now()}`;
  await page.getByLabel("Label").fill(label);
  await page.getByRole("button", { name: "Use my IP" }).click();

  const cidrField = page.getByLabel("IP address or CIDR range");
  await expect(cidrField).not.toHaveValue("");

  await page.getByRole("button", { name: "Add", exact: true }).click();

  // First tenant-wide entry - the pre-save lockout warning must appear
  // before anything is actually saved.
  const warningDialog = page.getByRole("dialog", { name: /turn on ip restriction/i });
  await expect(warningDialog).toBeVisible();
  await warningDialog.getByRole("button", { name: "Add anyway" }).click();

  await expect(page.getByText("Network entry added.")).toBeVisible();
  const row = page.getByRole("row", { name: new RegExp(label) });
  await expect(row).toBeVisible();

  // Clean up: remove the entry so this test can be re-run without a
  // stale tenant-wide network silently starting to restrict Agents.
  await row.getByRole("button", { name: "Remove" }).click();
  const removeDialog = page.getByRole("dialog", { name: /remove network entry/i });
  await removeDialog.getByRole("button", { name: "Remove", exact: true }).click();

  await expect(page.getByText(`Removed "${label}".`)).toBeVisible();
  await expect(page.getByRole("row", { name: new RegExp(label) })).not.toBeVisible();
});
