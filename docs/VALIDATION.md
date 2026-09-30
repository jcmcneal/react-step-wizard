# Candidate validation

Validated on Jason's macOS 27.0.1 host on 2026-09-30, using Node 22.22.3 and npm
10.9.8. Candidate version: **6.0.0-beta.0**, unpublished. The isolated branch starts
from master `eeec4054a6a32c283e2f5f9cd233a16aa6c9e4d7`. CI must also pass on the
exact final PR head before treating it as ready for review.

## Completed local checks

| Check | Result |
| --- | --- |
| `npm run check`, React 18.0.0 + React 18 types | Passed: lint, strict types, 32 regressions, library/example builds and packed consumer checks |
| `npm run check`, React 18.3.1 + React 18 types | Passed, same checks and 32 regressions |
| `npm ci && npm run check`, locked React 19.3.0 + React 19 types | Passed, same checks and 32 regressions; locked install restored |
| Packed ESM import and CJS require | Both render through React SSR without browser globals |
| Packed declarations, NodeNext and Bundler resolution | Passed on all three React versions with strict mode, `skipLibCheck:false`, `.mts`/`.cts` consumers and negative type assertions |
| Packed Vite 8.3.1 / Rolldown consumer | Production build passed under all three React versions; default import is the component |
| Production example browsers | 15/15: three scenarios each in Chromium, Firefox, WebKit, installed Chrome and installed Edge |
| Example development fallback | 3/3 Chromium scenarios; touching example CSS triggered a successful rebuild |
| Packed Next 13.5.11 + React 18.3.1 | Production build, direct server-component package import, HTTP SSR, hydration and named navigation passed |
| Packed Next 16.3.8 + React 19.3.0 | Same checks passed with the webpack build path |
| `npm audit --audit-level=moderate` | Zero reported vulnerabilities from the locked development tree |
| `npm pack --dry-run --ignore-scripts` | 18 files, about 23 KB compressed; only built JS/maps/declarations/CSS, package metadata, license, README, migration and changelog |
| `git diff --check` | Passed |

The behavioral suite covers defaults, zero/one numbering, reactive context/live
handles, nested controls, slots, preserved application props, metadata, conditional
arrays/fragments, keyed reorder/removal, validation veto/rejection/latest requests,
unmount invalidation, StrictMode listener cleanup, URL toggling/encoding/history,
SSR hydration, transition cleanup, eager/lazy state, optional-CSS hiding and swipe
cancellation/scroll discrimination. Browser checks cover actual rendering, guarded
navigation, dynamic steps, history, inactive focus/overflow and missing styles.

The Next fixtures are disposable applications installed from an actual tarball.
They test representative framework paths; they are not the missing original
applications from #93/#127. Next 16 Turbopack and arbitrary router integrations are
outside the completed checks.

## Dependency PR evidence

`npm ls follow-redirects url-parse async eventsource terser minimatch loader-utils
decode-uri-component qs express json5 minimist --all` confirmed:

- The old paths for follow-redirects, url-parse, async, eventsource, terser,
  loader-utils, decode-uri-component, qs, express and minimist are absent.
- minimatch is 10.2.6 under current ESLint/TypeScript-ESLint, replacing vulnerable 3.0.4.
- json5 is 2.2.3 under the hooks lint plugin's current Babel dependency, replacing 1.0.1.
- The library itself has no non-peer runtime dependencies; React is external.

These findings support the individual supersession dispositions for the 12
dependency PRs. They do not justify closing unrelated reports without review.

## Known limitations and unresolved checks

**Native Vite dev/HMR stalls on this host.** With the locked Vite 8.3.1 toolchain,
standard dev startup or browser loading timed out around native dependency
resolution/optimization. Clearing caches, explicit dependency inclusion, native
config loading, bundled dev mode and a temporary Vite 8.0.16 comparison did not
establish a repeatable working native-dev path. The exact cause is unresolved;
the lockfile was restored to 8.3.1. Reproduce with:

```sh
npm ci
npm run build
npm run app:dev:vite -- --host 127.0.0.1 --port 4173 --strictPort
```

`npm run app:dev` is an explicitly documented **fallback**: watch source/example
files, rebuild with Vite's working production path, serve preview, and refresh the
browser manually. Its passing browser/rebuild checks are not a fix or a passing
native HMR test. Production and packed Vite import checks pass independently.

Actual Safari WebDriver could not start because Safari's “Allow remote automation”
setting is disabled. No user setting was changed. WebKit passed; actual Safari
application verification remains a manual release check. Physical touch devices,
custom animations and application focus management also need maintainer UX review.

Vite's packed consumer emits a module-directive warning when bundling `'use client'`
for a browser application. The library outputs retain the directive, asserted by
the package check and verified by direct Next server-component imports. React 18
also logs expected errors for deliberately invalid context/children test cases;
those assertions pass.

Review proposed React-minimum, UMD retirement, explicit CSS, class-handle removal
and Promise-navigation changes in MIGRATION.md separately from verified bug fixes.
No npm/GitHub release, merge or existing issue/PR closure was performed.
