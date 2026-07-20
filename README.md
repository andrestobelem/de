# de

A TypeScript web application and an executable software-delivery laboratory.

## Production

https://de-phi-ruby.vercel.app

Every green change on `main` is built once, tested as an immutable artifact, deployed to a Vercel preview, and promoted to production without rebuilding.

## Local development

```bash
nvm use
corepack enable
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
pnpm dev
```

Run the complete local feedback loop:

```bash
pnpm verify
```

## Wayfinding

- [Contribution workflow](CONTRIBUTING.md)
- [Software delivery system](docs/engineering/software-delivery.md)
- [Production rollback runbook](docs/runbooks/rollback-production.md)
- [Interactive CI/CD lesson](lessons/0001-de-idea-a-produccion.html)
- [Delivery pipeline cheat sheet](reference/delivery-pipeline-cheat-sheet.html)
