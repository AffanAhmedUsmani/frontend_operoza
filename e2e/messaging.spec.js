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

// Sprint 13 (docs/SPRINT_PLAN.md) - end-to-end smoke check, real browser:
// (1) a direct message between two people the server allows (Admin -> HR)
//     actually delivers, and (2) assigning a new member to a campaign's
//     team (the existing campaign-assignment action) auto-creates/syncs
//     that campaign's team channel, which the newly-added member can then
//     see and post in. The negative/scoping cases (agent on a different
//     campaign, Client entirely blocked, shared-record permission
//     re-check) are already covered exhaustively by the backend's own
//     test suite - this proves the real browser flow works end to end.
test("admin can DM hr manager and the message is delivered", async ({ page }) => {
  await login(page, `admin@${TENANT_SLUG}.test`);
  await page.getByText("Messages", { exact: true }).click();
  await page.getByRole("button", { name: "New Message" }).click();
  await expect(page.getByRole("heading", { name: "New Message" })).toBeVisible();
  // Scoped to the dialog - the conversation list on the left can already
  // contain a "HR Manager One" entry from a prior run against this same
  // seeded dev DB, which would otherwise make this a strict-mode
  // ambiguous match.
  await page.getByRole("dialog").getByText("HR Manager One", { exact: false }).click();

  const messageText = `hello from admin ${Date.now()}`;
  await page.getByPlaceholder("Type a message...").fill(messageText);
  await page.getByRole("button", { name: "Send" }).click();
  // .last() - the same text also appears as the conversation list's own
  // "last message preview" secondary text; the thread's own message
  // bubble is always the later element in DOM order.
  await expect(page.getByText(messageText).last()).toBeVisible();

  await login(page, `hr@${TENANT_SLUG}.test`);
  await page.getByText("Messages", { exact: true }).click();
  // .first() - repeated runs against the same seeded dev DB can leave more
  // than one thing on the page mentioning "Admin One" (e.g. a sender name
  // inside an already-open thread), the conversation-list entry is always
  // the first such element in DOM order.
  await page.getByText("Admin One", { exact: false }).first().click();
  await expect(page.getByText(messageText).last()).toBeVisible();
});

test("adding a member to a campaign auto-syncs its team channel", async ({ page }) => {
  await login(page, `admin@${TENANT_SLUG}.test`);
  await page.getByText("Campaigns", { exact: true }).click();
  await expect(page.locator("text=" + CAMPAIGN_NAME).first()).toBeVisible();
  await page.locator("main").getByRole("button", { name: "Team" }).first().click();
  await expect(page.getByText("Add to Campaign")).toBeVisible();

  // Idempotent across repeated runs against the same seeded dev DB: only
  // assign HR Manager if they aren't already on the team from a prior run
  // (the seed fixtures don't undo test-added assignments between runs).
  await page.getByRole("combobox").click();
  const hrOption = page.getByRole("option", { name: /HR Manager One/i });
  if (await hrOption.count()) {
    await hrOption.click();
    await page.getByRole("button", { name: "Assign" }).click();
    await expect(page.getByText(/HR Manager One/i).first()).toBeVisible();
  } else {
    await page.keyboard.press("Escape");
  }

  const messageText = `hr joining the team channel ${Date.now()}`;
  await login(page, `hr@${TENANT_SLUG}.test`);
  await page.getByText("Messages", { exact: true }).click();
  await expect(page.getByText(`# ${CAMPAIGN_NAME}`)).toBeVisible();
  await page.getByText(`# ${CAMPAIGN_NAME}`).click();
  await page.getByPlaceholder("Type a message...").fill(messageText);
  await page.getByRole("button", { name: "Send" }).click();
  await expect(page.getByText(messageText).last()).toBeVisible();
});
