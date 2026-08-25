import { test, expect } from "@playwright/test";

const TENANT_SLUG = "rbac-demo";
const PASSWORD = "Test@1234";
const CAMPAIGN_NAME = "RBAC Demo Campaign";

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

// Sprint 12 (docs/SPRINT_PLAN.md) - end-to-end smoke check for the
// two-level follow-up opt-in: Admin turns the campaign-level capability
// on, an Agent then explicitly creates a follow-up on one of their own
// sales, and it shows up both in the Agent's own "My Follow-Ups" and the
// Team Lead's rolled-up view. The opt-in enforcement itself (rejecting
// creation on a disabled campaign, the scheduler never creating a row)
// is already covered exhaustively by the backend's own test suite -
// this proves the real browser flow actually works end to end.
test("admin enables follow-ups, agent creates one, it appears for both agent and team lead", async ({ page }) => {
  // This one test does two full logins plus a settings save and a
  // dialog-driven create - more round trips than the 30s default budget
  // comfortably covers when the dev server is also carrying other spec
  // files' background activity (periodic jobs, etc.) in the same run.
  test.setTimeout(60_000);

  await login(page, `admin@${TENANT_SLUG}.test`);
  await page.getByText("Campaigns", { exact: true }).click();

  const campaignCard = page.locator("text=" + CAMPAIGN_NAME).first();
  await expect(campaignCard).toBeVisible();
  // Scoped to <main> - the sidebar also has a nav item whose accessible
  // name is "Settings", which a page-wide getByRole would match first.
  await page.locator("main").getByRole("button", { name: "Settings" }).first().click();
  await expect(page.getByText("Campaign Settings")).toBeVisible();
  const followUpCheckbox = page.getByLabel("Enable follow-ups for this campaign");
  if (!(await followUpCheckbox.isChecked())) {
    await followUpCheckbox.check();
  }
  await page.getByRole("button", { name: "Save Changes" }).click();
  await expect(page.getByText("Campaign Settings")).toHaveCount(0);

  await login(page, `agent1@${TENANT_SLUG}.test`);
  await page.getByText("Sales", { exact: true }).click();
  await expect(page.getByRole("button", { name: "Create Follow-Up" }).first()).toBeVisible();
  await page.getByRole("button", { name: "Create Follow-Up" }).first().click();

  await expect(page.getByRole("heading", { name: "Create Follow-Up" })).toBeVisible();
  const dueAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16);
  // Unique per run - repeated runs against the same seeded dev DB
  // otherwise accumulate multiple rows with identical note text, making
  // a plain getByText match ambiguous (strict-mode violation).
  const noteText = `e2e follow-up note ${Date.now()}`;
  await page.getByLabel("Follow up on").fill(dueAt);
  await page.getByLabel("Note").fill(noteText);
  await page.getByRole("button", { name: "Create Follow-Up" }).last().click();
  await expect(page.getByRole("heading", { name: "Create Follow-Up" })).toHaveCount(0);

  await page.getByText("Follow-Ups", { exact: true }).click();
  await expect(page.getByText(noteText)).toBeVisible();

  await login(page, `teamlead@${TENANT_SLUG}.test`);
  await page.getByText("Follow-Ups", { exact: true }).click();
  await expect(page.getByRole("heading", { name: "Team Follow-Ups" })).toBeVisible();
  await expect(page.getByText(noteText)).toBeVisible();
});
