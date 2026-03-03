---
argument-hint: "[--skip-review] [--auto-merge]"
allowed-tools:
  - Bash(git status)
  - Bash(git diff*)
  - Bash(git log*)
  - Bash(git add*)
  - Bash(git commit*)
  - Bash(git checkout*)
  - Bash(git branch*)
  - Bash(git push*)
  - Bash(git rev-parse*)
  - Bash(gh auth*)
  - Bash(gh pr create*)
  - Bash(gh pr view*)
  - Bash(gh pr merge*)
  - AskUserQuestion
  - Task
---

Run a full AI-assisted workflow for the current git repository: code review → commit → push + PR creation → merge.

**Flags**:
- `--skip-review`: Skip Phase 1 (code quality + security review) and proceed directly to commit
- `--auto-merge`: Automatically merge the PR after creation without prompting

---

## Pre-flight Check

Before doing anything else, verify prerequisites:

```
!gh auth status
```

If the command fails or shows "not logged in", stop immediately and tell the user:
> **Error**: GitHub CLI is not authenticated. Run `gh auth login` and try again.

Also check that we're inside a git repository:
```
!git rev-parse --is-inside-work-tree
```

If this fails, stop and tell the user:
> **Error**: Not inside a git repository. Navigate to a git repository and try again.

---

## Phase 1 — Code Review

**Skip this phase if `--skip-review` was passed.**

Capture the current diff:

```
!git diff HEAD
!git diff --cached
```

If both diffs are empty, check for untracked files:
```
!git status --short
```

If there are no changes at all (no staged, no unstaged, no untracked), tell the user there is nothing to review or commit, and stop.

Now launch both review agents **in parallel** using the Task tool, passing the full diff output to each:

- Launch **code-quality-reviewer** with the message:
  > Please review the following git diff for code quality issues. Focus only on added lines (lines starting with `+`).
  >
  > ```diff
  > [PASTE git diff HEAD output here]
  > [PASTE git diff --cached output here]
  > ```

- Launch **security-reviewer** with the message:
  > Please review the following git diff for security vulnerabilities. Focus only on added lines (lines starting with `+`).
  >
  > ```diff
  > [PASTE git diff HEAD output here]
  > [PASTE git diff --cached output here]
  > ```

Wait for both agents to complete, then present their combined findings to the user.

**If either review contains Critical findings**, use AskUserQuestion to ask:
> Critical issues were found in the review. How would you like to proceed?

Options:
1. **Proceed anyway** — Continue with commit despite critical findings
2. **Abort** — Stop the workflow so I can fix the issues first

If the user chooses Abort, stop here and remind them to address the critical findings before running `/review-and-merge` again.

---

## Phase 2 — Commit

Check the current branch:
```
!git rev-parse --abbrev-ref HEAD
```

If the current branch is `main` or `master`, automatically create a new feature branch:
```
!git checkout -b feat/review-and-merge-$(date +%Y%m%d-%H%M%S)
```
Inform the user: "Created and switched to new branch: `[branch-name]`"

Stage all changes, but **first check for sensitive files**:
```
!git status --short
```

Before running `git add -A`, inspect the file list. If any of the following patterns appear, **do not stage them** and warn the user:
- `.env`, `.env.*`, `.env.local`, `.env.production`, etc.
- `*.key`, `*.pem`, `*.p12`, `*.pfx`
- `credentials.json`, `secrets.json`, `*.secret`
- `id_rsa`, `id_ed25519`, `*.priv`

If sensitive files are detected, tell the user which files were skipped and stage everything else explicitly (using specific file paths rather than `-A`).

Otherwise, run:
```
!git add -A
```

Now generate a commit message. Gather context:
```
!git diff --cached
!git log --oneline -10
```

Based on the staged diff and recent commit history, generate a **conventional commit message** following this format:
```
<type>(<optional scope>): <short description>

[optional body: explain WHY, not WHAT, in present tense]

[optional footer: references, breaking changes]
```

Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `perf`, `style`, `ci`

Keep the subject line under 72 characters. The body should explain the motivation and context.

Then run:
```
!git commit -m "[generated message]"
```

Show the user the commit hash and message.

---

## Phase 3 — Push + Pull Request

Push the branch:
```
!git push -u origin HEAD
```

Check if a PR already exists for this branch:
```
!gh pr view --json url,title,state 2>/dev/null
```

If a PR already exists, show the user its URL and skip PR creation (go to Phase 4).

If no PR exists, generate a PR title and body. Use the staged diff, commit message, and review findings to produce:

**PR Title** (< 70 characters): A clear, action-oriented summary of the changes.

**PR Body**:
```markdown
## Summary
- [2-4 bullet points describing what changed and why]

## Changes
- [Specific technical changes made]

## Test Plan
- [ ] [Manual or automated testing steps]
- [ ] [Edge cases verified]

## Review Notes
[Any findings from the automated review that reviewers should pay attention to, or "No issues flagged by automated review."]

🤖 Generated with [Claude Code](https://claude.ai/claude-code) via /review-and-merge
```

Then create the PR:
```
!gh pr create --title "[title]" --body "[body]"
```

Show the user the PR URL.

---

## Phase 4 — Merge

**If `--auto-merge` was passed**, merge immediately:
```
!gh pr merge --squash --delete-branch
```

**Otherwise**, use AskUserQuestion to ask:
> The PR has been created. How would you like to proceed?

Options:
1. **Merge now** — Squash and merge immediately, delete branch
2. **Enable auto-merge** — Merge automatically when CI checks pass
3. **Merge later** — Leave the PR open for review

Based on the user's choice:

- **Merge now**: `!gh pr merge --squash --delete-branch`
- **Enable auto-merge**: `!gh pr merge --auto --squash`
- **Merge later**: Inform the user the PR is open and ready for review, then exit

After a successful merge, confirm with the user:
> PR successfully merged and branch deleted.

---

## Error Handling

- If `git push` fails due to remote rejection (non-fast-forward), inform the user and suggest they pull/rebase first
- If `gh pr create` fails, show the error and suggest the user check their GitHub permissions
- If `gh pr merge` fails due to failed CI checks, inform the user and offer to enable auto-merge instead
- Always show the raw error output so the user can diagnose issues
