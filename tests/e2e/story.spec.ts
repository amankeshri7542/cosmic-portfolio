import { expect, test } from "@playwright/test";

// The visitor's own run: what they put on the bill is what every later layer works with.
test.describe("interactive story", () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" }); // instant steps; the controls behave the same
    await page.goto("/");
  });

  test("a full run: bill, API, transaction, pipeline, assistant, crash, receipt", async ({ page }) => {
    const ch = (id: string) => page.locator(`#${id}`);
    const result = (id: string) => ch(id).locator("[aria-live=polite]").first();

    await ch("interface").getByPlaceholder("Your shop’s name").fill("Sharma Traders");
    await ch("interface").getByRole("button", { name: /TMT Bar/ }).click();
    await ch("interface").getByRole("button", { name: /Wall Putty/ }).click();
    await expect(result("interface")).toHaveText("Sharma Traders: 3 items, ₹7,380.");
    await expect(page.locator("svg[aria-labelledby='stage-title stage-desc']")).toContainText("Customer · Sharma Traders");

    await ch("api").getByRole("radio", { name: "Intern" }).click();
    await ch("api").getByRole("button", { name: "Send invoice" }).click();
    await expect(result("api")).toContainText("403 Forbidden");
    await ch("api").getByRole("radio", { name: "Cashier" }).click();
    await ch("api").getByRole("button", { name: "Send invoice" }).click();
    await expect(result("api")).toContainText("201 Created");

    await ch("data").getByRole("button", { name: "Commit the sale" }).click();
    await expect(result("data")).toContainText("Committed #1041");
    await expect(result("data")).toContainText("stock now 120");
    await ch("data").getByRole("switch", { name: "Cut the power mid-write" }).check();
    await ch("data").getByRole("button", { name: "Commit the sale" }).click();
    await expect(result("data")).toContainText("Rolled back");
    await ch("data").getByRole("switch", { name: "Without a transaction" }).check();
    await ch("data").getByRole("button", { name: "Commit the sale" }).click();
    await expect(result("data")).toContainText("Out of sync");

    await ch("ship").getByRole("button", { name: "Push to main" }).click();
    await expect(result("ship")).toContainText("v1.5.0 is live", { timeout: 8000 });
    await ch("ship").getByRole("switch", { name: "Break a test" }).check();
    await ch("ship").getByRole("button", { name: "Push to main" }).click();
    await expect(result("ship")).toContainText("Production is still on v1.5.0", { timeout: 8000 });

    await ch("ai").getByRole("button", { name: "OPC 53 ka stock kitna hai?" }).click();
    await expect(result("ai")).toHaveText("110 bags in stock — 20 sold on this page.");

    await ch("run").getByRole("button", { name: "Kill api-1" }).click();
    await expect(result("run")).toContainText("Recovered", { timeout: 8000 });

    const receipt = page.getByLabel("Receipt for Sharma Traders");
    await expect(receipt).toContainText("TOTAL");
    await expect(receipt).toContainText("₹7,380");
    await expect(receipt).toContainText("11 / 11");
  });

  test("the brief builder prefills the contact form", async ({ page }) => {
    await page.getByRole("button", { name: /Billing & inventory/ }).click();
    await page.getByRole("button", { name: /AI assistant/ }).click();
    await expect(page.locator("#receipt").getByRole("link", { name: "Hardware Store ERP" })).toBeVisible();
    await page.getByRole("link", { name: "Send this brief" }).click();
    await expect(page).toHaveURL(/\/contact\?brief=billing,ai$/);
    await expect(page.getByLabel("Message")).toHaveValue(/I'm looking to build: billing & inventory, ai assistant\./);
  });

  test("controls work from the keyboard", async ({ page }) => {
    const send = page.locator("#api").getByRole("button", { name: "Send invoice" });
    await send.focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("#api [aria-live=polite]").first()).toContainText("201 Created");
  });
});

test("the Motion toggle turns the scroll animation off and on @desktop-only", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveClass(/story-live/);
  await page.getByRole("button", { name: "Motion on" }).click();
  await expect(page.locator("html")).not.toHaveClass(/story-live/);
  await expect(page.locator("[data-part='done']")).toHaveCSS("opacity", "1");
  await page.getByRole("button", { name: "Motion off" }).click();
  await expect(page.locator("html")).toHaveClass(/story-live/);
});
