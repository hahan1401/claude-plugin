#!/usr/bin/env node
/**
 * write-output.js
 * Usage: node write-output.js <findings.json> [output.csv]
 *
 * Input JSON shape:
 * {
 *   "summary": "...",
 *   "verdict": "Ready to push | Needs work | Needs discussion",
 *   "whatIsGood": "...",
 *   "findings": [
 *     { "severity": "🔴 Critical", "location": "file.ts:42",
 *       "issue": "...", "why": "...", "fix": "..." }
 *   ]
 * }
 */
const fs = require("fs");

function csvCell(value) {
  const str = String(value ?? "");
  return str.includes(",") || str.includes('"') || str.includes("\n")
    ? `"${str.replace(/"/g, '""')}"` : str;
}

function buildCsv({ summary, verdict, whatIsGood, findings }) {
  const headers = ["Severity", "Location", "Issue", "Why It Matters", "Suggested Fix"];
  const rows = (findings || []).map(f =>
    [f.severity, f.location, f.issue, f.why, f.fix].map(csvCell).join(",")
  );
  return [
    `# Summary: ${summary ?? ""}`,
    `# What's Good: ${whatIsGood ?? ""}`,
    `# Verdict: ${verdict ?? ""}`,
    "",
    headers.join(","),
    ...rows,
  ].join("\n");
}

const [,, input, outputArg] = process.argv;
if (!input) { console.error("Usage: node write-output.js <json-or-file> [output.csv]"); process.exit(1); }

const raw = fs.existsSync(input) ? fs.readFileSync(input, "utf8") : input;
const data = JSON.parse(raw);
const outPath = outputArg || "ts-review.csv";
fs.writeFileSync(outPath, buildCsv(data), "utf8");
console.log(`✅ Review written to ${outPath}`);
