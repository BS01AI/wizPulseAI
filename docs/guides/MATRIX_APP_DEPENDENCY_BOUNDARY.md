# WizPulseAI Matrix App Dependency Boundary

Last updated: 2026-05-15

## Decision

WizPulseAI is a matrix management repository, not a single Node monorepo.

Each product app keeps its own dependency boundary:

- its own `package.json`
- its own `package-lock.json`
- its own `.env.local`
- its own `node_modules/`
- its own build and deploy root

The matrix root may keep a small `package.json` and `package-lock.json` only for management tooling such as Playwright E2E checks. Root dependencies must not be treated as dependencies for child apps.

## Current Shape

```text
wizPulseAI/
  package.json                 # matrix management tools only
  package-lock.json            # lockfile for matrix management tools only
  docs/
  scripts/

  auth-wizpulseai-com/         # independent app/repo
  db-wizPulseAI-com/           # independent app/repo
  wizPulseAI-com/              # independent app/repo
  fashion-wizpulseai-com/      # independent app/repo
  ExpoGeo/                     # independent repo
    expo-geo/                  # Next app root
      package.json
      package-lock.json
  dino-kids-app/               # independent app/repo
```

## Rules

1. Run app commands from the app root, not from the matrix root.

```bash
cd ExpoGeo/expo-geo
npm install
npm run build
```

2. Commit app-level `package-lock.json`.

Each app's lockfile is part of that app's reproducible build.

3. Do not share app dependencies through the matrix root.

If ExpoGeo needs a dependency, add it to `ExpoGeo/expo-geo/package.json`, not to `wizPulseAI/package.json`.

4. The matrix root `package-lock.json` is allowed only for matrix-level tooling.

Examples:

- Playwright E2E tests across multiple sites
- repository management scripts
- cross-app verification tools

5. Deployment root must point to the concrete app.

For ExpoGeo:

```text
Root directory: ExpoGeo/expo-geo
Build command: npm run build
Install command: npm ci
```

6. Local/generated files are never committed.

```text
node_modules/
.next/
next-env.d.ts
*.tsbuildinfo
.env.local
.claude/
.codex/
```

## Next.js Lockfile Warning

When a child Next app is nested under the matrix repository, Next can notice multiple lockfiles:

```text
wizPulseAI/package-lock.json
wizPulseAI/ExpoGeo/expo-geo/package-lock.json
```

This is not a naming problem. `package-lock.json` is the required npm lockfile name and should not be renamed.

For nested independent apps, the app should explicitly anchor Next file tracing to its own app root:

```ts
const nextConfig = {
  outputFileTracingRoot: process.cwd(),
};
```

This keeps Next from treating the matrix root as the app dependency root during build.

## Why Not a Workspace Yet

Do not convert this repository to a workspace by default.

The current model is product-matrix architecture:

- apps have different release cycles
- apps may be deployed separately
- apps may be maintained by different AI or human workers
- account, billing, and entitlement are shared through platform APIs, not shared npm dependencies

A workspace can be reconsidered only if there is a stable shared package with clear ownership and versioning.

