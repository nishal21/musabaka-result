#!/usr/bin/env node
/** Block commits that would publish secrets or local agent notes. */
import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const blockedExact = new Set([
  ".env",
  "learning-journal.md",
  "devlog.md",
  "AGENTS.md",
  "CLAUDE.md",
  "paln.md",
  "plan.md",
  "notes.md",
]);

function list(cmd) {
  try {
    return execSync(cmd, { encoding: "buffer" })
      .toString("utf8")
      .split("\0")
      .filter(Boolean);
  } catch {
    return [];
  }
}

const problems = [];
const files = new Set([
  ...list("git ls-files -z"),
  ...list("git diff --cached --name-only --diff-filter=ACMR -z"),
]);

for (const f of files) {
  const base = f.split(/[/\\]/).pop() ?? f;
  if (blockedExact.has(f) || blockedExact.has(base)) {
    problems.push(`do not track: ${f}`);
  }
  if (/\.(pem|key|p12|db)$/i.test(f) || f.startsWith("data/")) {
    problems.push(`do not track: ${f}`);
  }
  if (f.startsWith("graphify-out/") || f.startsWith(".cursor/")) {
    problems.push(`do not track: ${f}`);
  }
}

if (existsSync(join(root, ".env"))) {
  try {
    execSync("git check-ignore -q .env", { stdio: "ignore" });
  } catch {
    problems.push(".env is not gitignored");
  }
}

for (const f of files) {
  if (!/\.(ts|tsx|js|mjs|cjs|md)$/.test(f)) continue;
  const path = join(root, f);
  if (!existsSync(path)) continue;
  const text = readFileSync(path, "utf8");
  if (text.includes("dev-only-session-secret")) {
    problems.push(`${f}: hardcoded session secret fallback`);
  }
  if (/ADMIN_PASSWORD\s*\|\|\s*["']/.test(text) || /SESSION_SECRET\s*\|\|\s*["']/.test(text)) {
    problems.push(`${f}: secret fallback with || "…"`);
  }
}

if (problems.length) {
  console.error("check:repo failed:\n" + problems.map((p) => `  - ${p}`).join("\n"));
  process.exit(1);
}
console.log("check:repo ok");
