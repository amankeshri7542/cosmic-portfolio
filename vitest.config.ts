import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const root = fileURLToPath(new URL(".", import.meta.url));
const mock = (name: string) => fileURLToPath(new URL(`./tests/mocks/${name}.ts`, import.meta.url));

export default defineConfig({
  resolve: {
    alias: [
      { find: /^@\//, replacement: root },
      { find: /^server-only$/, replacement: mock("server-only") },
      { find: /^next\/cache$/, replacement: mock("next-cache") },
      { find: /^next\/headers$/, replacement: mock("next-headers") },
    ],
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    globalSetup: ["tests/global-setup.ts"],
    setupFiles: ["tests/setup.ts"],
    fileParallelism: false,
    // Tests only ever talk to the local throwaway database, whatever the shell environment says.
    env: {
      DATABASE_URL: "postgres://ak@127.0.0.1:5544/ak_test",
      DATABASE_URL_UNPOOLED: "",
      POSTGRES_URL: "",
      BLOB_READ_WRITE_TOKEN: "",
      EMAIL_USER: "",
      EMAIL_PASS: "",
      CONTACT_SECRET: "test-contact-secret",
      CONTACT_TRANSPORT: "log",
    },
  },
});
