# review-and-merge

A Claude Code plugin that provides a `/review-and-merge` slash command — an AI-assisted workflow for code review, commit message generation, PR creation, and merging.

## What It Does

Running `/review-and-merge` in any git repository triggers a 4-phase workflow:

1. **Review** — Launches two AI sub-agents in parallel:
   - **Code Quality Reviewer**: Checks correctness, maintainability, reliability, performance, and best practices. Only reports findings with ≥75% confidence.
   - **Security Reviewer**: Checks for OWASP vulnerabilities with CWE references (injection, auth/authz, crypto, data exposure, supply chain). Reports Critical through Low severity.

2. **Commit** — Generates a conventional commit message from the diff and recent history, guards against committing sensitive files (`.env*`, `*.key`, `credentials.json`), and auto-creates a feature branch if you're on `main`/`master`.

3. **Push + PR** — Pushes the branch and creates a GitHub PR with an AI-generated title and body (Summary, Changes, Test Plan, Review Notes). Skips creation if a PR already exists.

4. **Merge** — Prompts to merge now, enable auto-merge (waits for CI), or leave open for review.

## Requirements

- **Claude Code** CLI installed and authenticated
- **git** — must be run inside a git repository with a GitHub remote
- **gh** (GitHub CLI) — must be authenticated (`gh auth login`)

## Installation

```bash
# In any Claude Code session:
/plugin install /home/hahan/projects/personal/agent-plugin
```

Or add to your Claude Code settings to auto-load:

```json
{
  "plugins": ["/home/hahan/projects/personal/agent-plugin"]
}
```

## Usage

```bash
# Full workflow (review → commit → push → PR → merge prompt)
/review-and-merge

# Skip the code review phase
/review-and-merge --skip-review

# Auto-merge without prompting
/review-and-merge --auto-merge

# Skip review and auto-merge
/review-and-merge --skip-review --auto-merge
```

## Options

| Flag | Description |
|------|-------------|
| `--skip-review` | Skip Phase 1 (code quality + security review). Useful when you've already reviewed the changes manually. |
| `--auto-merge` | Skip the merge prompt in Phase 4 and immediately squash-merge + delete the branch. |

## File Structure

```
agent-plugin/
├── .claude-plugin/
│   └── plugin.json              # Plugin manifest
├── commands/
│   └── review-and-merge.md      # Main workflow orchestrator
├── agents/
│   ├── code-quality-reviewer.md # Quality sub-agent
│   └── security-reviewer.md     # Security sub-agent
└── README.md
```

## How It Works

This plugin is a **pure Claude Code skill** — no TypeScript, no npm, no build step. Claude Code is the runtime:

- The `commands/review-and-merge.md` file defines the workflow as a prompt with `!bash` injections for live git/gh output
- Sub-agents in `agents/` are launched in parallel via the `Task` tool
- GitHub operations use the `gh` CLI (already authenticated in your environment)
- Interactive decisions use `AskUserQuestion` for human-in-the-loop control

## Security Notes

The commit phase automatically skips files matching these patterns:
- `.env`, `.env.*`, `.env.local`, `.env.production`
- `*.key`, `*.pem`, `*.p12`, `*.pfx`
- `credentials.json`, `secrets.json`, `*.secret`
- `id_rsa`, `id_ed25519`, `*.priv`

If sensitive files are detected, you'll be warned and they'll be excluded from the commit.

## Troubleshooting

**"GitHub CLI is not authenticated"**
Run `gh auth login` and follow the prompts, then retry.

**"Not inside a git repository"**
Navigate to a directory that is a git repository with `cd /path/to/your/repo`.

**Push rejected (non-fast-forward)**
Your local branch is behind the remote. Run `git pull --rebase` first, then retry.

**PR merge fails due to CI**
Choose "Enable auto-merge" when prompted — the PR will merge automatically once all checks pass.
