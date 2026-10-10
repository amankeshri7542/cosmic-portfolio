import "server-only";
import postgres from "postgres";

type Sql = ReturnType<typeof postgres>;
const globalForDb = globalThis as unknown as { __akSql?: Sql };

export function databaseUrl() {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || "";
}

export function hasDatabase() {
  return databaseUrl() !== "";
}

/**
 * postgres.js over TCP. Works against a local Postgres in development and Neon's pooler in
 * production (prepare: false keeps it compatible with PgBouncer transaction pooling).
 */
export function sql(): Sql {
  if (!globalForDb.__akSql) {
    const url = databaseUrl();
    if (!url) throw new Error("No DATABASE_URL configured");
    const local = /@(localhost|127\.0\.0\.1)[:/]/.test(url);
    globalForDb.__akSql = postgres(url, {
      max: local ? 5 : 3,
      idle_timeout: 20,
      connect_timeout: 10,
      prepare: false,
      ssl: local ? false : "require",
      onnotice: () => {},
    });
  }
  return globalForDb.__akSql;
}
