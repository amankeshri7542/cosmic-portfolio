import { execFileSync } from "node:child_process";

const URL_TEST = "postgres://ak@127.0.0.1:5544/ak_test";

export default function setup() {
  const u = new URL(URL_TEST);
  if (u.hostname !== "127.0.0.1" || u.pathname !== "/ak_test") throw new Error("Tests must only use the local ak_test database");
  execFileSync(process.execPath, ["scripts/migrate.mjs"], {
    env: { ...process.env, DATABASE_URL: URL_TEST, DATABASE_URL_UNPOOLED: "" },
    stdio: "inherit",
  });
}
