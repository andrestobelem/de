# Contributing

## Operating model

- Integrate through short-lived branches and small pull requests.
- Keep `main` releasable. Do not merge while a required check is red.
- Prefer one complete, observable change over partially completed layers.
- Separate deployment from feature release when an incomplete capability could affect users.

## Commits

Use [Conventional Commits](https://www.conventionalcommits.org/) with a non-empty scope:

```text
<type>(<scope>): <imperative summary>
```

Examples:

```text
feat(search): display matching products
fix(checkout): preserve cart after authentication
ci(delivery): verify the release artifact
```

Each commit must be atomic: it represents one coherent change, passes the relevant checks, and can be reverted independently. Do not combine formatting, refactoring, and behavior changes unless they are inseparable parts of the same change.

## Local feedback

Install the pinned toolchain and dependencies:

```bash
nvm use
corepack enable
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
```

Run the deterministic core checks used by continuous integration:

```bash
pnpm verify
```

The pre-commit hook formats staged files and runs type checking and unit tests. The commit-message hook enforces the Conventional Commit shape and required scope. Browser tests remain outside pre-commit so the fast local loop stays fast. CI additionally validates commit ranges and packages, checksums, unpacks, and serves the release candidate in a fresh job.

`pnpm audit:dependencies` queries the live advisory database. Run it when changing dependencies; automation also runs it daily. It is deliberately separate from deterministic commit feedback because advisory data can change while source and lockfile bytes remain identical.

## Pull requests

- Link the originating GitHub issue.
- State the user-visible behavior delivered and the evidence collected.
- Keep branches short-lived and rebase or update them when integration feedback goes stale.
- Treat preview deployments as evidence, not as a substitute for automated acceptance checks.
- Merge only when required checks pass and review conversations are resolved.
