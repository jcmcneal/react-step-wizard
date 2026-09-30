# Contributing

Use Node 22.22.2+ (or a supported Node 24 release), `nvm use`, and `npm ci`.
Development dependencies use a committed npm lockfile; pnpm is not required.

- `npm run check`: lint, strict TypeScript, behavior tests, ESM/CJS/declarations,
  Vite example build, packed consumer imports/SSR/types and Vite 8 build.
- `npm run build && npm run app:dev`: watch/rebuild preview of the example using package exports. Refresh after edits.
- `npm run app:build && npx playwright install chromium firefox webkit && npm run test:browser`:
  navigation, validation, dynamic steps, history, focus and overflow in three engines.
- `npm run test:next`: packed-package Next.js App Router production build and HTTP SSR.

Run behavior/type/package checks under React 18.0.0, 18.3.1 and 19.3.0 with the
corresponding `@types/react`/`@types/react-dom` major. CI defines this matrix. Tests
assert observable behavior and cleanup rather than implementation snapshots.
Browser tests use the production preview by default; set `RSW_BROWSER_MODE=development`
to exercise the watch/rebuild development preview. This is a fallback, not a fix for
the unresolved native Vite dev/HMR stall observed on the validation Mac. Reproduce
standard Vite dev with `npm run app:dev:vite`; see [VALIDATION.md](docs/VALIDATION.md).
On Macs with Chrome/Edge installed, use
`RSW_INSTALLED_BROWSERS=1` to add those applications.
Unit regressions live in `src/index.test.tsx`; browser tests in `tests/browser`.

For visual review, check the production example in Chrome/Edge, Firefox and Safari.
Playwright's WebKit is an engine check, not a claim to have tested Safari itself.
IE is outside the v6 support range. Check custom transitions, reduced motion,
keyboard controls, deep links, and browser Back/Forward.

Open a draft pull request with migration notes and applicable validation results.
Review the [release checklist](docs/RELEASE_CHECKLIST.md). Publishing, merging and
issue/PR closures require separate maintainer review and authorization.
