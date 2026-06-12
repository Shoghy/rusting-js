#!/usr/bin/bun
/** biome-ignore-all lint/suspicious/noConsole: tool file */

import { execSync } from "child_process";
import * as path from "path";

const reset = "\x1b[0m";
const bold = "\x1b[1m";
const red = "\x1b[31m";
const yellow = "\x1b[33m";
const cyan = "\x1b[36m";
const green = "\x1b[32m";
const dim = "\x1b[2m";

interface Diagnostic {
  level: "error" | "warning";
  rule: string;
  file: string;
  line: string;
  col: string;
  message: string;
}

// Matches GitHub reporter lines:
// ::error title=lint/rule,file=src/foo.ts,line=4,endLine=4,col=3,endColumn=5::message
const GITHUB_PATTERN =
  /^::(error|warning) title=([^,]+),file=([^,]+),line=([^,]+),endLine=[^,]+,col=([^,]+),endColumn=[^:]+::(.+)$/;

function parse(output: string): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  for (const line of output.split("\n")) {
    const m = line.match(GITHUB_PATTERN);
    if (m === null) {
      continue;
    }
    diagnostics.push({
      level: m[1] as "error" | "warning",
      rule: m[2],
      file: m[3],
      line: m[4],
      col: m[5],
      message: m[6],
    });
  }
  return diagnostics;
}

function format(diagnostics: Diagnostic[]): void {
  // Group by file, preserving insertion order
  const byFile = new Map<string, Diagnostic[]>();
  for (const d of diagnostics) {
    const key = d.file;
    if (!byFile.has(key)) {
      byFile.set(key, []);
    }
    byFile.get(key)!.push(d);
  }

  let errors = 0;
  let warnings = 0;

  for (const [file, diags] of byFile) {
    // Print relative path if possible
    const rel = path.relative(process.cwd(), path.resolve(file));
    console.log(`\n${bold}${cyan}${rel}${reset}`);

    for (const d of diags) {
      const pos = `${d.line}:${d.col}`;
      const color = d.level === "error" ? red : yellow;
      const levelPad = d.level.padEnd(7); // "error  " / "warning"
      console.log(
        `  ${dim}${pos.padStart(6)}${reset}  ${color}${levelPad}${reset}  ${d.message}  ${dim}${d.rule}${reset}`,
      );
      if (d.level === "error") {
        errors++;
      } else {
        warnings++;
      }
    }
  }

  const total = errors + warnings;
  if (total === 0) {
    console.log(`\n${green}√ no problems${reset}`);
  } else {
    const plural = (n: number, w: string): string =>
      `${n} ${w}${n === 1 ? "" : "s"}`;
    console.log(
      `\n${bold}× ${plural(total, "problem")} (${plural(errors, "error")}, ${plural(warnings, "warning")})${reset}`,
    );
  }
}

function main(): void {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    args.push(".");
  }

  let raw = "";
  try {
    raw = execSync(`biome check --reporter=github ${args.join(" ")}`, {
      encoding: "utf8",
      stdio: ["inherit", "pipe", "pipe"],
    });
  } catch (err: unknown) {
    // biome exits non-zero when there are lint errors — capture output anyway
    raw =
      ((err as Record<string, string>).stdout ?? "") +
      ((err as Record<string, string>).stderr ?? "");
  }

  const diagnostics = parse(raw);
  format(diagnostics);

  process.exit(diagnostics.length > 0 ? 1 : 0);
}

main();
