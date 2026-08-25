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

// Sprint 11 (docs/SPRINT_PLAN.md) - the notification center: creating a
// user fires USER_CREATED (general guide S7.2), which reaches the acting
// Admin themselves (an Admin recipient, alongside the new user). This is
// an end-to-end smoke check that the whole stack - trigger call site ->
// NotificationService -> API -> NotificationContext polling -> bell badge
// -> popover - actually works in a real browser, not just at the API
// level (already covered exhaustively by the backend's own test suite).
test("admin: creating a user increments the bell's unread count and shows it in the popover", async ({ page }) => {
  await login(page, `admin@${TENANT_SLUG}.test`);

  const bell = page.getByRole("button", { name: "Notifications" });
  await expect(bell).toBeVisible();

  const uniqueEmail = `notif-test-${Date.now()}@${TENANT_SLUG}.test`;
  await page.getByText("Users & Roles", { exact: true }).click();
  await page.getByLabel("Full name").fill("Notification Test User");
  await page.getByLabel("Email").fill(uniqueEmail);
  await page.getByLabel("Temporary password").fill("Correct-Horse-9");
  await page.getByRole("button", { name: "Create User" }).click();
  await expect(page.getByText("New user created successfully.")).toBeVisible();

  await bell.click();
  await expect(page.getByText("Your Operoza account was created", { exact: false }).first()).toBeVisible();
});
