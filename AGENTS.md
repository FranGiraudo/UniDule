# Agent Instructions — UniDule

Cross-tool rules file (read by Claude Code, Antigravity, and any other AGENTS.md-compatible agent).

## Git Commit Conventions

This project follows [Conventional Commits](https://www.conventionalcommits.org/).

### Format

```
<type>(<scope>): <short summary>

<optional body>

<optional footer>
```

### Types

- `feat` — new feature
- `fix` — bug fix
- `refactor` — code change that neither fixes a bug nor adds a feature
- `style` — formatting/whitespace, no logic change
- `docs` — documentation only
- `test` — adding or fixing tests
- `perf` — performance improvement
- `chore` — tooling, dependencies, config
- `build` — build system changes
- `ci` — CI configuration changes
- `revert` — reverts a previous commit

### Scope

Name the feature or area touched: `subjects`, `tasks`, `career`, `schedule`, `dashboard`, `settings`, `auth`, `shared`, `db`, `deps`, etc. Matches the `src/features/<name>` and `src/shared` folder names where applicable.

### Rules

- Subject line in imperative mood ("add", not "added"/"adds"), lowercase after the colon, no trailing period, ≤72 characters.
- One logical change per commit — don't bundle unrelated changes just because they happened in the same session.
- Body (when needed) explains **why**, not what — the diff already shows what changed.
- Reference issues/PRs in the footer when relevant (`Refs #12`, `Closes #34`).
- Never commit secrets (`.env`, API keys, credentials).
- Only commit when explicitly asked; don't commit proactively mid-task.

### Examples

```
feat(subjects): add notes tab with markdown rendering
fix(dashboard): compute real attendance alerts instead of hardcoded zero
refactor(shared): split lib/api.ts into per-feature api modules
chore(deps): bump vite to 8.2.1
docs(agents): document git commit conventions
```
