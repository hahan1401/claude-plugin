---
name: typescript-review
description: >
  Perform a thorough, TypeScript-specific code review. Use this skill whenever
  the user shares TypeScript code (.ts, .tsx files) and asks for a review, feedback,
  or wants to know if it's ready to push or merge. Also trigger when the user asks
  to "check my TypeScript", "review this TS file", "look at my types", "is this
  type-safe?", "review my React component" (if TypeScript is used), or pastes any
  TypeScript code and asks "does this look okay?" — treat it as a full TS review
  request. Covers type safety, generics, async patterns, React/TSX specifics,
  performance, and common TS anti-patterns. Always use this skill proactively.
---

# TypeScript Code Review Skill

A structured, TypeScript-focused review process that catches type safety issues,
anti-patterns, performance problems, and architectural concerns.

---

## Overview

When invoked, perform a multi-pass review across these dimensions:

1. **Type Safety** — Are types correct, complete, and meaningful?
2. **Correctness** — Does the logic do what's intended?
3. **Async/Concurrency** — Proper use of async/await, Promises, error handling?
4. **Security** — XSS, injection, unsafe type assertions, exposed secrets?
5. **Performance** — Unnecessary renders, expensive operations, memory leaks?
6. **Maintainability** — Readability, naming, complexity, dead code?
7. **Tests** — Coverage for new logic and edge cases?

---

## Step-by-Step Process

### Step 1 — Gather Context

Before reviewing, check for:
- Framework in use (React, Next.js, Node.js, NestJS, plain TS, etc.)
- tsconfig.json strictness settings (if provided)
- Purpose of the change: feature, fix, refactor, etc.
- Existing test setup (Jest, Vitest, Playwright, etc.)

If context isn't provided, infer from the code and state your assumptions at the top.

### Step 2 — Read Everything First

Read all files holistically before writing feedback. Patterns in one file often
explain choices in another.

### Step 3 — Multi-Pass Review

For each issue found, record:

- **Severity**: `critical` | `major` | `minor` | `nit`
- **Location**: File + approximate line/function
- **What**: Short description
- **Why**: Why it matters
- **Fix**: Concrete code suggestion

Read `references/ts-checklist.md` during this pass.
Read `references/severity-guide.md` if uncertain how to classify.

### Step 4 — Output Table in Chat

Display the findings directly as a markdown table in chat. No files need to be written.

```
## TypeScript Code Review

**Summary**: [2–4 sentences: what the code does, overall quality, readiness to push]

| Severity | Location | Issue | Why It Matters | Suggested Fix |
|----------|----------|-------|----------------|---------------|
| 🔴 Critical | `file.ts:42` | Missing `await` on async call | Silently skips result, causes downstream null crash | Add `await` before `fetchUser()` |
| 🟠 Major | `utils.ts:15` | `any` on exported helper | Removes type safety for all callers | Use `unknown` + type guard |
| 🟡 Minor | `Component.tsx:88` | Inline object in JSX prop | Causes unnecessary re-renders | Extract to `useMemo` or module-level const |
| 🔵 Nit | `api.ts:3` | Redundant `else` after `return` | Minor readability | Remove `else` block |

**✅ What's Good**: [Highlight 1–3 things done well]

**Verdict**: [ Ready to push | Needs work | Needs discussion ]
```

- Omit rows for severity levels with no issues
- Keep "Issue" and "Suggested Fix" cells concise — offer to elaborate after
- If there are zero issues, say so clearly and give the green light

**Step 4b** — Run the script to produce the CSV:
```
node .claude/skills/typescripy-review/scripts/write-output.js findings.json ts-review.csv
```

The CSV will be written to `ts-review.csv` in the current working directory.

### Step 5 — Offer Follow-Up

After the review, offer to:
- Rewrite a problematic section with correct types
- Generate missing tests
- Explain any TypeScript concept in more depth

---

## TypeScript-Specific Review Checklist (Quick Reference)

Read `references/ts-checklist.md` for the full list. Key highlights:

### Type Safety
- [ ] No untyped `any` — prefer `unknown` with narrowing
- [ ] No unsafe `as` casts without validation
- [ ] Explicit return types on public/exported functions
- [ ] Union types handle all cases (exhaustive switch/discriminated unions)
- [ ] Optional chaining (`?.`) used instead of manual null checks where appropriate
- [ ] Non-null assertions (`!`) justified or replaced with proper guards
- [ ] Generic constraints (`<T extends Something>`) are appropriate
- [ ] No `@ts-ignore` / `@ts-expect-error` without explanatory comment

### Async / Promises
- [ ] All `async` functions have `await` (no fire-and-forget without intent)
- [ ] `Promise.all` used for parallel work instead of sequential `await`
- [ ] Errors caught — no unhandled rejections
- [ ] No mixing of `.then()` chains and `async/await` without reason

### React / TSX (if applicable)
- [ ] `useEffect` deps array is correct and complete
- [ ] `useState` types inferred or explicitly typed
- [ ] No inline object/function creation in JSX that causes unnecessary re-renders
- [ ] Event handlers properly typed (`React.ChangeEvent<HTMLInputElement>`, etc.)
- [ ] Component props interfaces/types defined and not overly permissive
- [ ] Keys in lists are stable and unique (not array index)
- [ ] `useMemo` / `useCallback` only where justified

### Error Handling
- [ ] `try/catch` blocks don't swallow errors silently
- [ ] Error objects typed correctly (use `instanceof Error` check)
- [ ] API responses validated before use (not blindly cast)

### Security
- [ ] No hardcoded secrets, tokens, or credentials
- [ ] No `dangerouslySetInnerHTML` without sanitization
- [ ] User-controlled data not used in `eval()`, `new Function()`, or dynamic imports unsafely
- [ ] No prototype pollution vectors

### Performance
- [ ] No expensive computation in render without memoization
- [ ] Event listeners / subscriptions cleaned up in `useEffect` return
- [ ] No unnecessary deep clones (`JSON.parse(JSON.stringify(...))`) in hot paths

---

## Review Behavior Guidelines

- **Be specific.** "This type is too wide" → show the narrower type.
- **Explain the why.** Developers accept feedback better with reasoning.
- **Don't over-nitpick.** If `strict` mode isn't enabled project-wide, don't flag
  every missing type as critical — calibrate to the project's standards.
- **Respect context.** A `any` in a migration script is different from `any` in a
  shared utility used across the codebase.
- **Security first.** Always flag security issues even if not asked.
- **Provide corrected snippets.** Show don't just tell — paste a fixed version
  of problematic code whenever possible.

---

## Reference Files

- `references/ts-checklist.md` — Full TypeScript review checklist. Read during Step 3.
- `references/severity-guide.md` — Severity level definitions and examples.