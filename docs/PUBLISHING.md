# Distribution

`korridor-api` and `korridor-web` consume this package as a **git-tag
dependency** against this repo, e.g.:

```json
"@korridor-finance/shared-types": "github:Korridor-Finance/korridor-shared-types#v0.2.0"
```

`dist/` is deliberately **committed to this repo** (not gitignored) so that
works with zero build step at install time — `pnpm install` just clones the
tagged commit and the compiled JS/`.d.ts` files are already sitting there.

This needs the repo to be **public**, or every environment that installs
`korridor-api`/`korridor-web` (CI, local dev, and wherever they actually
deploy) needs its own git credential with read access — a git-tag
dependency doesn't remove the credential requirement for a private repo,
it just moves it from "npm registry auth" to "git clone auth." Since this
package is pure type/interface definitions (no secrets, no business logic),
making the repo public is the simpler call, and is what unblocks a build
platform like Cloudflare (whose build sandbox has no access to anyone's
personal git credentials).

## Releasing a new version

1. Bump `version` in `package.json`.
2. `pnpm run build` (regenerates `dist/`).
3. Commit `package.json` + `dist/` together, tag the commit `vX.Y.Z`, push
   both the commit and the tag.
4. In `korridor-api`/`korridor-web`: `pnpm add @korridor-finance/shared-types@github:Korridor-Finance/korridor-shared-types#vX.Y.Z`.

Skipping the tag bump and just pushing to `main` doesn't update anything
downstream — the consuming repos are pinned to a specific tag, not a
moving branch, so a shared-types change has no effect until a consumer
explicitly re-pins.

## GitHub Packages (secondary, not currently used by api/web)

This repo also publishes to GitHub Packages
(`.github/workflows/publish.yml`, on every push to `main` whose version is
new) as `@korridor-finance/shared-types` — GitHub Packages requires the
npm scope to match the GitHub org (`Korridor-Finance`), hence the rename
from the original `@korridor/...`. Publishing needs no secret (the
workflow's own `GITHUB_TOKEN` can publish packages owned by this same
repo). This exists as an option for a future npm-registry-based consumer;
`korridor-api`/`korridor-web` don't use it today because it hit the same
private-repo credential problem the git-tag approach also has, plus GitHub
Packages sometimes still requires auth for reads even on a public repo —
the git-tag dependency is the more reliably credential-free path once this
repo is public.
