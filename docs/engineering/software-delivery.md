# Software delivery system

This document is the operating contract for moving a change from an idea to production. The workflow is optimized for rapid, trustworthy feedback rather than ceremony.

## Operating principles

1. **`main` is releasable.** A red mainline is the highest-priority defect.
2. **Build once, promote.** A commit produces one release candidate. Later stages may inspect or promote it but never rebuild it.
3. **Small, reversible changes.** Work moves through short-lived branches, atomic scoped Conventional Commits, and narrow pull requests.
4. **Evidence advances work.** Every gate answers a question. A failed gate stops promotion instead of being waived.
5. **Deployment is not release.** Deploy incomplete user-facing behavior safely behind a release mechanism when a feature needs one.
6. **Recovery is a normal path.** Rollback promotes a known-good deployment; it does not compile under incident pressure.

These choices follow Dave Farley's deployment-pipeline model and are evaluated against both stability and throughput.

## Development lifecycle

| Stage               | Input                       | Executable evidence                                              | Output                                        |
| ------------------- | --------------------------- | ---------------------------------------------------------------- | --------------------------------------------- |
| Intake              | User problem or opportunity | Triage context is sufficient                                     | Categorized GitHub Issue                      |
| Shape               | Accepted issue              | Observable stories, agreed test seams, explicit scope            | Spec and tracer-bullet tickets                |
| Implement           | One ready ticket            | Red → Green at the highest useful seam                           | Small, independently revertible commits       |
| Pull request        | Short-lived branch          | Review plus required GitHub checks                               | Integrable change                             |
| Commit stage        | Git commit SHA              | Commitlint, format, lint, typecheck, unit-test capability, build | `release-<SHA>` artifact and SHA-256 checksum |
| Artifact acceptance | Verified archive            | Playwright against the unpacked Vercel Build Output              | Deployable release candidate                  |
| Preview             | Accepted candidate          | Vercel deploys with `--prebuilt`; HTTP smoke verifies full SHA   | Immutable preview deployment                  |
| Production          | Green mainline preview      | Vercel promotes the preview; production smoke verifies full SHA  | Current production deployment                 |
| Operate             | Live deployment             | Health and software-delivery signals                             | Learning, roll-forward, or rollback           |

## Git and review policy

- Start from an issue carrying an appropriate triage state.
- Prefer a branch that lives for hours, not days.
- Use `<type>(<scope>): <summary>` for every commit; scope is mandatory.
- Keep each commit coherent, green, independently revertible, and linked to its issue.
- Use squash merge so the pull-request title becomes the mainline Conventional Commit.
- Required checks must pass and conversations must be resolved before merge.
- Do not push directly, force-push, or delete `main`.

See [`CONTRIBUTING.md`](../../CONTRIBUTING.md) for local commands.

## Deployment pipeline

The source of truth is [`.github/workflows/delivery.yml`](../../.github/workflows/delivery.yml).

### Pull requests

1. **Commit stage** creates `.vercel/output`, packages it as `release.tgz`, and records `release.tgz.sha256`.
2. **Artifact acceptance** downloads that archive in a fresh job, verifies its checksum, serves it over HTTP, and runs Playwright.
3. **Deploy preview** sends the accepted Build Output to Vercel with `--prebuilt --target=preview`.
4. **Preview smoke** fetches `/` and `/release.json`; it requires the exact workflow SHA.

Preview URLs are intentionally public. The repository and frontend are public, and previews contain the same client-visible bytes intended for production. Client bundles must never contain secrets.

### Mainline

A push to `main` repeats the pipeline from source and then runs **Promote and verify production**:

1. promote the verified preview with `vercel promote`;
2. do not invoke a build command;
3. fetch the stable production URL;
4. require `/release.json` to report the exact mainline SHA.

Production: https://de-phi-ruby.vercel.app

The production job and rollback workflow share the `production` concurrency group, preventing two alias changes from racing.

### Artifact identity

`VITE_RELEASE_SHA` is embedded in both the visible application and `/release.json` during the one build. The release archive is then checksummed. This gives one chain:

```text
Git SHA → release.tgz digest → Vercel deployment → /release.json → production observation
```

If any identity differs, promotion fails.

## Configuration and credentials

GitHub Actions is the only deployment authority; Vercel's Git integration is not used, avoiding a second hidden build path.

- `VERCEL_TOKEN` — encrypted GitHub Actions secret used only by deploy/promote steps.
- `VERCEL_ORG_ID` — repository variable selecting the Vercel account.
- `VERCEL_PROJECT_ID` — repository variable selecting the Vercel project.
- `PRODUCTION_URL` — repository variable used by the post-promotion smoke test.
- `VERCEL_ENABLED` — repository variable that explicitly enables deployment jobs.

Rotate `VERCEL_TOKEN` immediately if it is exposed. Never add `.env*`, `.vercel/`, tokens, or IDs copied from credential files to a commit.

## Failure policy

| Failure             | Meaning                                     | Response                                        |
| ------------------- | ------------------------------------------- | ----------------------------------------------- |
| Local hook          | Change is not internally coherent           | Fix before committing                           |
| Commit stage        | Cheap quality or build invariant failed     | Stop normal work and restore green              |
| Artifact acceptance | Packaged behavior differs from expectations | Preserve diagnostics; do not deploy             |
| Preview deploy      | Artifact cannot run on the target platform  | Diagnose platform/configuration; do not promote |
| Preview smoke       | Deployment is unavailable or stale          | Keep production unchanged                       |
| Production smoke    | Alias does not serve the promoted SHA       | Run the rollback procedure immediately          |

Do not rerun a deterministic failure hoping it disappears. A rerun is justified only after identifying an external transient failure.

## Recovery

Use [the production rollback runbook](../runbooks/rollback-production.md). Recovery promotes an immutable known-good deployment and verifies its full SHA. It never rebuilds.

## Measuring and improving

Use DORA's current model to inspect the delivery system:

- **Throughput:** change lead time, deployment frequency, failed-deployment recovery time.
- **Instability:** change fail rate and deployment rework rate.

GitHub pull requests, Actions runs, environments, and Vercel deployments already preserve the raw events. Establish a baseline before setting targets. Metrics are diagnostic signals, never individual performance goals.

When changing this pipeline, use a tracer bullet and prove the real hosted behavior. YAML review alone is not sufficient evidence.

## Primary references

- [Dave Farley — The Deployment Pipeline](https://continuousdelivery.com/wp-content/uploads/2010/01/The-Deployment-Pipeline-by-Dave-Farley-2007.pdf)
- [Continuous Delivery pipeline patterns](https://continuousdelivery.com/implementing/patterns/)
- [GitHub Actions workflow artifacts](https://docs.github.com/en/actions/concepts/workflows-and-actions/workflow-artifacts)
- [Vercel prebuilt deployments](https://vercel.com/docs/cli/deploy) and [promotion](https://vercel.com/docs/cli/promote)
- [DORA software-delivery metrics](https://dora.dev/guides/dora-metrics/)
