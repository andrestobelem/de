# Runbook: rollback production

Use this when production is unavailable, serves the wrong release, or exhibits a severe regression that cannot be safely rolled forward faster.

The rollback changes only the Vercel production pointer. It does **not** rebuild source code.

## Preconditions

You need:

- an immutable Vercel deployment URL known to be healthy;
- the full 40-character Git SHA embedded in that deployment;
- permission to dispatch GitHub Actions workflows.

Find a candidate in the Vercel Deployments view or a previously successful GitHub `preview`/`production` environment. Confirm its identity before changing production:

```bash
curl --fail --silent https://<deployment>.vercel.app/release.json
```

Expected shape:

```json
{
  "release": "<full-git-sha>"
}
```

Do not use a mutable production alias as the rollback candidate.

## Execute

From this repository:

```bash
gh workflow run rollback.yml \
  --ref main \
  -f deployment_url=https://<known-good-deployment>.vercel.app \
  -f expected_release=<full-git-sha> \
  -f reason="<incident or regression summary>"
```

Watch the dispatched run:

```bash
gh run list --workflow rollback.yml --limit 1
gh run watch <run-id> --exit-status
```

The workflow serializes on the `production` concurrency group, resolves the URL with Vercel to reject mutable aliases or non-ready deployments, promotes the supplied deployment, and verifies the stable production URL against `expected_release`.

## Verify

The workflow must be green. Independently confirm:

```bash
curl --fail --silent https://de-phi-ruby.vercel.app/release.json
```

Then verify the user-visible failure mode that triggered recovery. Release metadata proves deployment identity; it does not prove every product behavior.

## After recovery

1. Record detection time, recovery completion time, affected release, restored release, and impact in the incident issue.
2. Stop or close the faulty change's rollout path.
3. Prefer a small roll-forward fix after service is stable.
4. Preserve the failed run and diagnostics.
5. Ask what executable check would have caught the failure earlier.
6. Update the pipeline or runbook through a reviewed pull request.

## If rollback fails

- Do not rebuild locally or edit generated files in Vercel.
- Confirm the deployment URL belongs to this Vercel project.
- Confirm the expected SHA is exactly 40 lowercase hexadecimal characters.
- Inspect the rollback workflow logs and Vercel deployment status.
- If promotion succeeded but smoke failed, compare production `/release.json` with the requested SHA and escalate as a platform/alias incident.

## Drill

Run a rollback drill after changing promotion/recovery automation and periodically once the application has real users. Promote a known-good prior deployment, verify it, then promote the current known-good deployment again. Both directions must use immutable URLs and complete without rebuilding.
