#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const isCi = process.argv.includes("--ci");
const repoRoot = process.cwd();

const excludedDirs = new Set([".git", ".next", "node_modules"]);
const documentationRoots = [
  "README.md",
  "AGENTS.md",
  "CLAUDE.md",
  "docs/",
  "docs/agents/",
  ".agents/",
  ".claude/",
  ".github/pull_request_template.md",
  "scripts/verify-pr.mjs",
];

const forbiddenPatterns = [
  { label: "stripe", regex: /stripe/i },
  { label: "paddle", regex: /paddle/i },
  { label: "payment provider implementation", regex: /payment provider implementation/i },
  { label: "service_role", regex: /service_role/i },
  { label: "secret_key", regex: /secret_key/i },
  { label: "route.ts", regex: /route\.ts/i },
  { label: "server action", regex: /server action|["']use server["']/i },
  { label: "Binance API implementation", regex: /binance/i },
  { label: "Bybit API implementation", regex: /bybit/i },
  { label: "AML score/check implementation", regex: /aml/i },
  { label: "official tax due", regex: /official tax due/i },
  { label: "guaranteed tax correctness", regex: /guaranteed tax correctness/i },
  { label: "tax filing implementation", regex: /tax filing implementation|tax filing/i },
  { label: "tax payment implementation", regex: /tax payment implementation|tax payment/i },
];

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: options.capture ? "pipe" : "inherit",
    shell: false,
  });

  return {
    output: `${result.stdout ?? ""}${result.stderr ?? ""}`,
    status: result.status ?? 1,
  };
}

function runRequired(command, args) {
  console.log(`\n$ ${[command, ...args].join(" ")}`);
  const result = run(command, args);
  if (result.status !== 0) {
    console.error(`\nCommand failed: ${[command, ...args].join(" ")}`);
    process.exitCode = 1;
  }
}

function gitOutput(args) {
  return run("git", args, { capture: true });
}

function printSection(title, body) {
  console.log(`\n## ${title}`);
  const content = body.trim();
  console.log(content.length > 0 ? content : "(none)");
}

function firstSuccessfulGitOutput(candidates, fallbackArgs) {
  for (const args of candidates) {
    const result = gitOutput(args);
    if (result.status === 0) {
      return `${result.output.trim()}\n\n(command: ${["git", ...args].join(" ")})`;
    }
  }

  const fallback = gitOutput(fallbackArgs);
  if (fallback.status === 0) {
    return `${fallback.output.trim()}\n\n(fallback: ${["git", ...fallbackArgs].join(" ")})`;
  }

  return `(unable to run git diff against main/origin/main or fallback)`;
}

function isDocumentationFile(relativePath) {
  return documentationRoots.some((root) =>
    root.endsWith("/") ? relativePath.startsWith(root) : relativePath === root,
  );
}

function isCriticalImplementationMatch(relativePath, line, label) {
  if (isDocumentationFile(relativePath)) {
    return false;
  }

  const normalized = relativePath.replaceAll("\\", "/");
  const lowerLine = line.toLowerCase();

  if (normalized.endsWith("route.ts")) return true;
  if (label === "server action" && (normalized.startsWith("app/") || normalized.startsWith("src/"))) {
    return true;
  }
  if (label === "stripe") {
    if (/finding-v2-stripe|severity stripe|stripExtension/i.test(line)) {
      return false;
    }

    return (
      /(^|\W)(@stripe|stripe-node|stripe\.|stripe_|STRIPE_|stripeKey|stripeClient)(\W|$)/i.test(line) ||
      (/package(-lock)?\.json$/.test(normalized) && /"(@stripe\/[^"]+|stripe)"/i.test(line))
    );
  }
  if (label === "paddle") {
    return (
      /(^|\W)(paddle\.|paddle_|PADDLE_|paddleKey|paddleClient)(\W|$)/i.test(line) ||
      (/package(-lock)?\.json$/.test(normalized) && /"(paddle[^"]*)"/i.test(line))
    );
  }
  if (label === "service_role" || label === "secret_key") {
    return true;
  }
  if (
    label === "Binance API implementation" &&
    /binance.*(api|client|fetch|endpoint|request)|(?:api|client|fetch|endpoint|request).*binance/i.test(line)
  ) {
    return true;
  }
  if (
    label === "Bybit API implementation" &&
    /bybit.*(api|client|fetch|endpoint|request)|(?:api|client|fetch|endpoint|request).*bybit/i.test(line)
  ) {
    return true;
  }
  if (
    label === "AML score/check implementation" &&
    /aml.*(score|check|provider|client|integration)|(?:score|check|provider|client|integration).*aml/i.test(line)
  ) {
    return true;
  }
  if (
    label === "official tax due" ||
    label === "guaranteed tax correctness" ||
    label === "tax filing implementation" ||
    label === "tax payment implementation" ||
    label === "payment provider implementation"
  ) {
    return (
      normalized.startsWith("app/") ||
      normalized.startsWith("src/") ||
      normalized.startsWith("scripts/")
    ) && !/not implemented|out of scope|do not implement|forbidden|must not|no /.test(lowerLine);
  }

  return false;
}

function collectFiles(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (excludedDirs.has(entry.name)) continue;

    const absolutePath = path.join(dir, entry.name);
    const relativePath = path.relative(repoRoot, absolutePath).replaceAll("\\", "/");

    if (entry.isDirectory()) {
      files.push(...collectFiles(absolutePath));
      continue;
    }

    if (!entry.isFile()) continue;

    const stats = statSync(absolutePath);
    if (stats.size > 2_000_000) continue;

    files.push({ absolutePath, relativePath });
  }

  return files;
}

function runForbiddenSearch() {
  const matches = [];
  const criticalMatches = [];

  for (const file of collectFiles(repoRoot)) {
    let text = "";
    try {
      text = readFileSync(file.absolutePath, "utf8");
    } catch {
      continue;
    }

    const lines = text.split(/\r?\n/);
    lines.forEach((line, index) => {
      for (const pattern of forbiddenPatterns) {
        if (!pattern.regex.test(line) && !(pattern.label === "route.ts" && file.relativePath.endsWith("route.ts"))) {
          continue;
        }

        const match = {
          file: file.relativePath,
          line: index + 1,
          label: pattern.label,
          text: line.trim(),
        };
        matches.push(match);

        if (isCriticalImplementationMatch(file.relativePath, line, pattern.label)) {
          criticalMatches.push(match);
        }
      }
    });
  }

  printSection(
    "Forbidden Feature Search",
    matches
      .map((match) => `${match.file}:${match.line} [${match.label}] ${match.text}`)
      .join("\n"),
  );

  if (criticalMatches.length > 0) {
    printSection(
      "Critical Forbidden Implementation",
      criticalMatches
        .map((match) => `${match.file}:${match.line} [${match.label}] ${match.text}`)
        .join("\n"),
    );
    process.exitCode = 1;
  } else if (matches.length > 0) {
    console.log("\nForbidden terms found only as documentation/scope guardrails or non-critical references.");
  }
}

console.log(`Crypto Audit Report PR verification (${isCi ? "CI" : "local"})`);

printSection("Branch", gitOutput(["rev-parse", "--abbrev-ref", "HEAD"]).output);
printSection("Git Status", gitOutput(["status", "--short", "--branch"]).output);
printSection(
  "Diff Stat",
  firstSuccessfulGitOutput(
    [
      ["diff", "--stat", "origin/main...HEAD"],
      ["diff", "--stat", "main...HEAD"],
    ],
    ["diff", "--stat"],
  ),
);
printSection(
  "Changed Files",
  firstSuccessfulGitOutput(
    [
      ["diff", "--name-status", "origin/main...HEAD"],
      ["diff", "--name-status", "main...HEAD"],
    ],
    ["diff", "--name-status"],
  ),
);

runForbiddenSearch();
runRequired("npm", ["run", "test"]);
runRequired("npm", ["run", "build"]);

if (process.exitCode && process.exitCode !== 0) {
  console.error("\nVerification failed.");
  process.exit(process.exitCode);
}

console.log("\nVerification passed.");
