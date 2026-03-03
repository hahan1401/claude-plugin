# Severity Guide

Use this guide to classify issues found during a TypeScript code review.

---

## 🔴 Critical

**Definition**: The code is broken, insecure, or will cause data loss/corruption in production.
Must be fixed before pushing.

**Examples**:
- Unhandled promise rejection that silently swallows errors in a payment flow
- SQL/command injection via unescaped user input
- Hardcoded API key or secret in source code
- Missing `await` on an async call that the rest of the function depends on
- Type assertion (`as`) that hides a runtime type mismatch causing crashes
- `useEffect` missing cleanup causing memory leaks in long-lived sessions
- Race condition in auth check that allows unauthorized access

---

## 🟠 Major

**Definition**: The code has significant problems that will likely cause bugs, degrade
performance noticeably, or make the codebase significantly harder to maintain.
Strongly recommended to fix before pushing.

**Examples**:
- Incorrect `useEffect` dependencies causing stale closure bugs (subtle, intermittent)
- Use of `any` removes all type safety downstream
- Missing error handling on a critical network call (non-payment path)
- `Promise.all` missing where multiple sequential `await`s could run in parallel
- Large expensive computation in render without `useMemo` causing jank
- Discriminated union switch missing a branch, causing silent incorrect behavior

---

## 🟡 Minor

**Definition**: Correctness is likely fine, but the code could cause problems in edge cases
or makes the codebase harder to work with over time. Should fix if time allows.

**Examples**:
- Missing explicit return type on an exported function
- Non-null assertion (`!`) used where a guard would be safer
- `any` used in a localized, low-risk utility function
- Magic numbers that should be named constants
- A function that's doing two things (moderate SRP violation)
- Event listener not cleaned up in a component that's rarely re-mounted

---

## 🔵 Nit

**Definition**: Style, polish, or minor readability issues with no functional impact.
Optional to fix; mention as a courtesy.

**Examples**:
- Verbose type that could use a utility type (`Pick`, `Omit`)
- Unnecessary `else` after a `return`
- Variable name that's technically fine but could be clearer
- Comment that restates the obvious
- Inconsistent quote style (if not enforced by a linter)
- Generic parameter named `T1`, `T2` where `TKey`, `TValue` would be clearer

---

## Calibration Notes

- **Calibrate to the project's strictness level.** If `strict: false` is set in tsconfig,
  don't flag missing types as Critical — flag them as Minor and note the tsconfig setting.
- **Consider blast radius.** A `any` in a utility used by 50 files is Major.
  A `any` in a one-off migration script is Minor or Nit.
- **When in doubt, go one level lower.** It's better to slightly under-classify
  than to cry wolf and have developers ignore your reviews.