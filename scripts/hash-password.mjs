#!/usr/bin/env node
// Prints an EDITOR_PASSWORD_HASH value. The password is read from stdin without echo:
//   node scripts/hash-password.mjs            (prompts)
//   printf '%s' "$PW" | node scripts/hash-password.mjs
import { randomBytes, scrypt } from "node:crypto";

const N = 2 ** 15, R = 8, P = 1;

function readSecret(prompt) {
  const { stdin, stderr } = process;
  if (!stdin.isTTY) {
    return new Promise((resolve) => {
      let data = "";
      stdin.setEncoding("utf8").on("data", (c) => (data += c)).on("end", () => resolve(data.replace(/\r?\n$/, "")));
    });
  }
  return new Promise((resolve) => {
    stderr.write(prompt);
    let value = "";
    stdin.setRawMode(true).resume().setEncoding("utf8");
    const onData = (chunk) => {
      for (const ch of chunk) {
        if (ch === "\r" || ch === "\n") {
          stdin.setRawMode(false).pause().off("data", onData);
          stderr.write("\n");
          return resolve(value);
        }
        if (ch === "\u0003") process.exit(130);
        if (ch === "\u007f" || ch === "\b") value = value.slice(0, -1);
        else value += ch;
      }
    };
    stdin.on("data", onData);
  });
}

const password = await readSecret("Password: ");
if (password.length < 12) {
  console.error("Use at least 12 characters.");
  process.exit(1);
}
const salt = randomBytes(16);
scrypt(password, salt, 64, { N, r: R, p: P, maxmem: 256 * N * R + 1024 * 1024 }, (err, key) => {
  if (err) throw err;
  console.log(`scrypt$${N}$${R}$${P}$${salt.toString("hex")}$${key.toString("hex")}`);
});
