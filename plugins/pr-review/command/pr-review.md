---
name: pr-review
description: >
  Review an open GitHub pull request. Triggers when the user says "review PR",
  "review pull request", "/pr-review", or provides a PR number and asks for feedback.
  Fetches the diff via gh CLI, analyzes changes across correctness, security, test
  coverage, and breaking changes, then outputs a structured review table. Optionally
  posts the review as a GitHub comment.
---

# PR Review Skill

A structured pull request review that fetches the diff, analyzes changes, and
outputs actionable feedback — optionally posting it back to GitHub.

---

## Step-by-Step Process

### Step 1 — Resolve the PR

Determine which PR to review:
- If the user passed a number (e.g. `/pr-review 42`), use that.
- Otherwise, detect the current branch and find its open PR:
  ```
  gh pr view --json number,title,body,baseRefName,headRefName,author,additions,deletions,changedFiles
  ```
- If no PR is found, tell the user and stop.

Display a one-line summary:
```
PR #<number> — "<title>" by @<author>  (+<additions> / -<deletions>, <changedFiles> files)
```

### Step 2 — Fetch the Diff and File List

Run both in parallel:
```
gh pr diff <number>
gh pr view <number> --json files
```

Read any supporting files that provide context (e.g. related service files,
interfaces, DTOs) if the diff references types or methods not shown in the diff itself.

### Step 3 — Multi-Pass Review

Analyze the diff across these dimensions. For each issue record:
- **Severity**: `critical` | `major` | `minor` | `nit`
- **File + line** (from diff context)
- **What** the issue is
- **Why** it matters
- **Fix** — a concrete suggestion or corrected snippet

#### Dimensions to check

**Correctness**
- Logic errors, off-by-one, wrong conditionals
- Missing `await` on async calls
- Unhandled edge cases (null, empty array, 0)

**Security**
- Injection (SQL, command, template)
- Hardcoded secrets or tokens
- Missing auth/authorization checks on new endpoints
- Unsafe type assertions hiding runtime mismatches

**Breaking Changes**
- Renamed or removed exported types/functions used elsewhere
- Changed DB schema without migration
- API contract changes (renamed fields, removed endpoints)
- Changed environment variable names

**Test Coverage**
- New logic with no accompanying tests
- Deleted tests without replacement
- Mocks that are too permissive (`any`, untyped)

**Code Quality**
- Duplicated logic that should be extracted
- Functions > ~50 lines without clear reason
- Dead code introduced (unused imports, variables, branches)
- Magic numbers/strings that should be constants

Read `references/review-checklist.md` for the full checklist.
Read `references/severity-guide.md` for classification guidance.

### Step 4 — Output Review Table in Chat

```
## PR Review — #<number>: "<title>"

**Summary**: [2–4 sentences describing what the PR does, overall quality, and readiness to merge]

| Severity | File & Line | Issue | Why It Matters | Suggested Fix |
|----------|-------------|-------|----------------|---------------|
| 🔴 Critical | `auth.service.ts:23` | Missing `await` on async call | ... | ... |
| 🟠 Major | `users.controller.ts:88` | No auth guard on new endpoint | ... | ... |
| 🟡 Minor | `dto/create-user.dto.ts:12` | Field not validated | ... | ... |
| 🔵 Nit | `app.module.ts:5` | Unused import | ... | ... |

**✅ What's Good**: [1–3 things done well]

**Verdict**: [ Approve | Request Changes | Needs Discussion ]
```

- Omit severity rows with no findings
- Keep cells concise — offer to elaborate after
- If zero issues: say so clearly and recommend approving

### Step 5 — Offer to Post Review to GitHub

After displaying the table, ask:

> Would you like me to post this review as a GitHub comment on PR #<number>?

If yes, post using:
```
gh pr review <number> --comment --body "<formatted review>"
```

For **Request Changes**, use:
```
gh pr review <number> --request-changes --body "<formatted review>"
```

For **Approve**:
```
gh pr review <number> --approve --body "<formatted review>"
```

Always confirm the action with the user before posting — a posted review
cannot be easily recalled.

### Step 6 — Offer Follow-Up

After the review, offer to:
- Show the full diff for a specific file
- Rewrite a problematic section
- Generate missing tests for new logic
- Explain any finding in more depth

---

## Review Behavior Guidelines

- **Be specific.** Quote the exact code, not a paraphrase.
- **Explain the why.** Developers accept feedback better with context.
- **Calibrate severity to blast radius.** A bug in a shared utility is more severe than the same bug in a one-off script.
- **Security first.** Always flag auth/injection/secret issues regardless of scope.
- **Don't block on style.** Nits are optional. Never hold a PR for formatting if a linter handles it.
- **Distinguish blocking from non-blocking.** Critical/Major = must fix. Minor/Nit = should fix or consider.

---

## Reference Files

- `references/review-checklist.md` — Full PR review checklist. Read during Step 3.
- `references/severity-guide.md` — Severity level definitions and examples.
