import { afterAll } from "vitest";

afterAll(async () => {
  const g = globalThis as unknown as { __akSql?: { end: (o: { timeout: number }) => Promise<void> } };
  await g.__akSql?.end({ timeout: 1 });
  g.__akSql = undefined;
});
