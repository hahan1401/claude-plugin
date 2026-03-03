# PR Review Severity Guide

---

## 🔴 Critical — Must fix before merge

The change is broken, insecure, or will cause data loss/corruption in production.

**Examples**:
- Missing auth guard on a sensitive endpoint
- SQL/command injection via unescaped user input
- Hardcoded secret or API key committed to source
- Missing `await` on an async call the rest of the function depends on
- DB schema change with no migration (data loss risk)
- Race condition in an auth check that allows unauthorized access

---

## 🟠 Major — Strongly recommended to fix before merge

Significant problems that will likely cause bugs, security gaps, or maintenance pain.

**Examples**:
- New endpoint with no input validation
- Missing error handling on a critical path (payment, auth, data write)
- Breaking change to a public API with no versioning or migration plan
- Logic error that causes incorrect results in common (not just edge-case) scenarios
- Deleted tests with no replacement and no documented reason
- Sensitive data written to logs

---

## 🟡 Minor — Fix if time allows

Correctness is likely fine, but there are edge cases or long-term maintenance concerns.

**Examples**:
- Missing test for an uncommon but real edge case
- Magic number that should be a named constant
- Function doing two things (moderate SRP violation)
- Unhandled `null` path that realistically won't occur but isn't guarded
- Missing `.env.example` update for a new variable

---

## 🔵 Nit — Optional polish

Style, readability, or minor cosmetic issues. Never block a merge on a nit.

**Examples**:
- Unused import left in
- Variable name that works but could be clearer
- Comment that restates the obvious
- Inconsistent naming convention (if not enforced by a linter)
- Redundant `else` after a `return`

---

## Calibration Notes

- **Blast radius matters.** The same bug in a shared utility is Critical; in a one-off script it may be Minor.
- **When in doubt, go one level lower.** It's better to slightly under-classify than to cry wolf.
- **Security is always at least Major.** Any auth, injection, or secret issue is never a Nit.
- **Blocking vs non-blocking.** Critical + Major = must fix. Minor + Nit = should consider.
