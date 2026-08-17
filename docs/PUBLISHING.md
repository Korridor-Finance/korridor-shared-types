# Publishing (GitHub Packages)

`@korridor-finance/shared-types` publishes to GitHub Packages'
npm registry (`npm.pkg.github.com`) via `.github/workflows/publish.yml`,
which runs on every push to `main` that touches `package.json`, `src/**`, or
`tsconfig.json` — and only actually publishes when `package.json`'s
`version` is one the registry doesn't already have.

To ship a new version: bump `version` in `package.json`, push to `main`,
done. No manual publish step, no npm login.

## Why the package is named `@korridor-finance/...`, not `@korridor/...`

GitHub Packages requires an npm package's scope to match the GitHub
organization that owns the publishing repository — the org here is
`Korridor-Finance`, so the scope must be `@korridor-finance`. This is a
GitHub-enforced rule, not a style choice; publishing as `@korridor/...`
fails with a 403.

## What's left for you to do

Publishing itself (above) needs no secret — the workflow's ambient
`GITHUB_TOKEN` can publish packages owned by this same repository once
granted `packages: write`, which `publish.yml` already declares.

**Consuming** this package from a different repo (`korridor-api`,
`korridor-web` — either their CI, a developer's own machine, or an actual
production deploy) is a separate story: GitHub's `GITHUB_TOKEN` is
deliberately scoped to only the repo a workflow runs in, so it can't read
packages published by a sibling repo, private or not. You need to:

1. **Create a Personal Access Token** (classic, not fine-grained — GitHub
   Packages' npm registry doesn't yet support fine-grained tokens for reads
   across repos) with the `read:packages` scope only.
   GitHub → Settings → Developer settings → Personal access tokens →
   Tokens (classic) → Generate new token.
2. **Add it as an Actions secret** named `PACKAGES_READ_TOKEN` — do this
   once at the `Korridor-Finance` **organization** level (Settings →
   Secrets and variables → Actions → New organization secret) rather than
   per-repo, so `korridor-api` and `korridor-web` both pick it up without
   duplicating the secret.
3. **For local development**, export the same token as `NODE_AUTH_TOKEN`
   in your shell profile (or a local, gitignored `.npmrc`) before running
   `pnpm install` in `korridor-api` or `korridor-web`.
4. **For production deployment**, whatever platform builds `korridor-api`
   or `korridor-web` (Docker build, Render, Vercel, ...) needs
   `NODE_AUTH_TOKEN` set in its own build-time environment/secrets — the
   same PAT works here too.

None of this was created automatically — a PAT is a credential tied to a
GitHub user account, and creating one (or an org secret) isn't something
that can be done on your behalf.
