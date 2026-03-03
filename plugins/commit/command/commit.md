---
name: commit
description: >
  Stage and commit all current changes using Conventional Commits.
  Triggers when the user says "commit", "commit changes", "/commit", or
  asks to "save changes to git". Runs pre-commit quality gates (/pr-review,
  /typescripy-review, /simplify) before committing. Blocks on 🔴 Critical
  findings; asks for acknowledgement on 🟠 Major findings.
disable-model-invocation: true
---

## Current Repository State

- Branch: !`git branch --show-current`
- Status: !`git status --short`
- Staged diff: !`git diff --cached`
- Unstaged diff: !`git diff`

---

## Commit Workflow

### Step 1 — Abort if Nothing to Commit

If `git status` shows a clean working tree, report:

```
Nothing to commit — working tree is clean.
```

and stop.

---

### Step 2 — Run Pre-Commit Quality Gates

**Run all applicable skills before staging anything. Never skip this step.**

#### 2a. `/pr-review`
Run against the current unstaged + staged diff.
- 🔴 Critical finding → **block commit**, list what must be fixed, stop.
- 🟠 Major finding → report findings, ask for explicit user acknowledgement before continuing.

#### 2b. `/typescripy-review`
Run on every changed `.ts` / `.tsx` file.
- 🔴 Critical finding → **block commit**, list what must be fixed, stop.
- 🟠 Major finding → report findings, ask for explicit user acknowledgement before continuing.

#### 2c. `/simplify`
Run on any file flagged by the above skills for quality, duplication, or complexity issues.
- Apply or report suggested simplifications before committing.

**Only proceed once all three skills complete with no unresolved 🔴 Critical findings.**

---

### Step 3 — Verify Error-Free State

Review recent command outputs and conversation context:
- No build errors, test failures, or lint errors
- If errors are detected or unclear → **do not commit**; report them and ask the user to resolve first.

---

### Step 4 — Generate Commit Message

Follow the **Conventional Commits** specification:

```
<type>(<scope>): <short description>

[optional body]

[optional footer]
```

**Types:** `feat` | `fix` | `refactor` | `docs` | `style` | `test` | `chore` | `perf` | `ci` | `revert`

**Short description rules:**
- Imperative mood ("add feature", not "added feature")
- ≤ 72 characters, no trailing period
- Specific and descriptive — never use "various fixes", "updates", or "changes"

**Body (when helpful):** explain the *what* and *why*; wrap at 72 chars; use bullet points for multiple concerns.

**Footer (when applicable):**
- `Closes #123` / `Fixes #456`
- `BREAKING CHANGE: <description>`

**Examples:**
- `fix(auth): resolve null pointer on expired token validation`
- `feat(api): add pagination support to product listing endpoint`
- `refactor(users): extract role-check logic into shared guard`

---

### Step 5 — Stage and Commit

1. Stage relevant changes (use `git add` selectively; avoid staging `.env` or credential files).
2. Commit using a HEREDOC to preserve formatting:
   ```bash
   git commit -m "$(cat <<'EOF'
   <type>(<scope>): <short description>

   <body if needed>

   Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
   EOF
   )"
   ```
3. Confirm success by checking the command output.
4. Report the result:

**Success:**
```
✅ Committed successfully!

Commit: <hash>
Message: <full commit message>
Files changed: <count>
```

**Aborted:**
```
⚠️ Commit aborted.

Reason: <clear explanation>
Action required: <what the user needs to do>
```

---

## Safety Rules

- **Never** commit `.env`, credential files, or secret tokens.
- **Never** use `--no-verify` or bypass hooks unless the user explicitly requests it.
- **Never** amend a previous commit — always create a new commit.
- **Never** force-push from this skill.
- If `git` is not initialized, report this and stop.
