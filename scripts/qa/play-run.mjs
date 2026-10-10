// Plays the story like a visitor and screenshots each interaction: node scripts/qa/play-run.mjs [outDir]
import { chromium } from "@playwright/test";
const out = process.argv[2] ?? ".qa";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
p.on("pageerror", (e) => errors.push(e.message));
p.on("console", (m) => m.type() === "error" && errors.push(m.text()));
await p.goto("http://127.0.0.1:3001/", { waitUntil: "networkidle" });
await p.waitForTimeout(1200);
const go = async (id, frac = 0.06) => {
  await p.evaluate(([id, f]) => window.scrollTo(0, document.getElementById(id).getBoundingClientRect().top + scrollY - innerHeight * f), [id, frac]);
  await p.waitForTimeout(1300);
};
const shot = (n) => p.screenshot({ path: `${out}/play-${n}.jpg`, type: "jpeg", quality: 78 });
const ch = (id) => p.locator(`#${id}`);

await go("interface");
await ch("interface").getByPlaceholder("Your shop’s name").fill("Sharma Traders");
await ch("interface").getByRole("button", { name: /TMT Bar/ }).click();
await ch("interface").getByRole("button", { name: /Wall Putty/ }).click();
await p.waitForTimeout(600); await shot("1-interface");

await go("api");
await ch("api").getByRole("radio", { name: "Intern" }).click();
await ch("api").getByRole("button", { name: "Send invoice" }).click();
await p.waitForTimeout(1600); await shot("2a-api-403");
await ch("api").getByRole("radio", { name: "Cashier" }).click();
await ch("api").getByRole("button", { name: "Send invoice" }).click();
await p.waitForTimeout(1800); await shot("2b-api-201");

await go("data");
await ch("data").getByRole("button", { name: "Commit the sale" }).click();
await p.waitForTimeout(1500); await shot("3a-commit");
await ch("data").getByRole("switch", { name: "Cut the power mid-write" }).click();
await ch("data").getByRole("button", { name: "Commit the sale" }).click();
await p.waitForTimeout(1500); await shot("3b-rollback");
await ch("data").getByRole("switch", { name: "Without a transaction" }).click();
await ch("data").getByRole("button", { name: "Commit the sale" }).click();
await p.waitForTimeout(1500); await shot("3c-partial");

await go("ship");
await ch("ship").getByRole("button", { name: "Push to main" }).click();
await p.waitForTimeout(3600); await shot("4a-shipped");
await ch("ship").getByRole("switch", { name: "Break a test" }).click();
await ch("ship").getByRole("button", { name: "Push to main" }).click();
await p.waitForTimeout(2000); await shot("4b-blocked");

await go("ai");
await ch("ai").getByRole("button", { name: /sabse zyada/ }).click();
await p.waitForTimeout(1300); await shot("5-ai");

await go("run");
await ch("run").getByRole("button", { name: "Kill api-1" }).click();
await p.waitForTimeout(700); await shot("6a-down");
await p.waitForTimeout(2600); await shot("6b-recovered");

await go("receipt", 0);
await p.waitForTimeout(2200); await shot("7-receipt");
await p.getByRole("button", { name: /Billing & inventory/ }).click();
await p.getByRole("button", { name: /AI assistant/ }).click();
await p.waitForTimeout(400); await shot("8-brief");
console.log("errors:", errors.length ? errors : "none");
await b.close();
