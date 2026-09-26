# Verification

The checks that prove the work, rather than assert it. A model stops when the
work looks done; without a signal it can run and read, "looks done" is the only
evidence available and the user becomes the test suite.

**Contents**
- [Find the commands first](#find-the-commands-first)
- [The baseline gate](#the-baseline-gate)
- [Testing auth and authorization](#testing-auth-and-authorization)
- [Testing entitlements](#testing-entitlements)
- [What to test elsewhere](#what-to-test-elsewhere)
- [Verifying headers and CORS](#verifying-headers-and-cors)
- [Performance verification](#performance-verification)
- [Manual verification for the handoff](#manual-verification-for-the-handoff)
- [Reporting](#reporting)

---

## Find the commands first

Read `AGENTS.md`, then `package.json` scripts, then the CI config. Use the
project's commands; do not invent them. If no command exists for something this
skill requires — no typecheck script, no test runner — say so rather than
silently skipping the check, and offer to add it.

## The baseline gate

Every change in this skill's scope runs these and **shows the output**:

```bash
npm run typecheck     # or: npx tsc --noEmit
npm run lint
npm test
npm run build
```

Rules that make this worth doing:

- **Show the result, do not summarize it.** "Tests pass" without output is an
  assertion. A model that has not run the command cannot tell the difference
  between passing and not having run.
- **The build is not optional.** Type errors that `tsc` tolerates can still
  break a production build, and adapter-specific failures only appear there.
- **Iterate until it passes.** A failing check reported as a caveat is not a
  result.
- **Do not disable a check to make it pass.** Adding an eslint-disable or
  `ignoreBuildErrors` converts a caught bug into a shipped one. If a rule is
  genuinely wrong, say so and leave it to the user.

## Testing auth and authorization

The tests that matter here are the negative ones. A test proving a signed-in
admin can reach the admin page proves almost nothing; the valuable tests are
the ones asserting that everyone else cannot.

For each protected resource, assert:

| Case | Expected |
|---|---|
| Signed out | Redirect to sign-in (document) or 401/404 (API) |
| Signed in, wrong role or permission | 403 |
| Signed in, correct role, **another user's record** | 404 |
| Signed in, correct role, own record | 200 |

The third row is the one that finds real vulnerabilities. Authentication tests
pass in codebases with total tenancy leaks; ownership tests do not.

Two more worth automating because they catch whole classes at once:

- **Every server action is protected.** Enumerate `'use server'` exports and
  assert each rejects an unauthenticated call. This catches the action added
  next month that nobody thought about.
- **Route protection does not depend on middleware.** Run the check with the
  middleware redirect bypassed. If a resource becomes reachable, its own gate
  is missing — this is exactly the failure the resource-based model exists to
  prevent, and it is invisible while middleware is in the way.

Add `@clerk/eslint-plugin` with `require-auth-protection` as the standing
mechanical check; see `clerk-auth.md`. Lint catches the missing check at author
time, which is cheaper than any test.

## Testing entitlements

For each gated feature, assert:

- Without the entitlement, the endpoint returns 403 with the distinguishable
  code — not 401, not 404, not a generic 403.
- With the entitlement, it succeeds.
- The client-side gate hides the affordance but is **not** the thing producing
  the 403. Verify by calling the endpoint directly.
- Usage limits are enforced server-side by exceeding them.

## What to test elsewhere

Not everything deserves a test, and over-testing this layer produces brittle
suites that get deleted.

| Test | Where |
|---|---|
| Auth, ownership, entitlement gates | Integration tests against real handlers |
| Schema validation | Unit tests on the schema — cheap, fast, high value |
| Error envelope shape | Unit test on the client's error normalization |
| Webhook signature rejection | Integration test with a bad signature |
| Critical user journeys | One end-to-end test per journey, not per screen |
| Rendering, styling, animation | `frontend-design`'s concern, not here |

End-to-end tests are expensive and flaky in proportion to their number. Cover
sign-in, the primary paid action, and checkout — not every page.

## Verifying headers and CORS

Configured is not deployed. Check the actual response:

```bash
curl -sI https://<deployed-url> | grep -iE "content-security-policy|strict-transport|x-content-type|referrer-policy|frame"
```

- Confirm the CSP is present **and** that `script-src` lacks `unsafe-inline`,
  or that the exception is stated.
- Confirm `connect-src` includes the API and Clerk origins, or every request
  will fail at runtime while everything passes at build time.
- For CORS, send a cross-origin request with credentials from a disallowed
  origin and confirm the browser rejects it. A CORS policy nobody tested is
  usually a wildcard.

## Performance verification

Measure, change, re-measure. An optimization not verified against a number is a
guess.

```bash
npx lhci autorun          # Lighthouse CI
npx bundlesize            # bundle budget in CI
```

Against the budgets in the skill body: LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1,
initial JS < 200KB gzipped, API p95 < 200ms.

Two cautions: measure production builds, since development bundles are not
representative; and where the number is owned by the backend — API latency —
report it rather than absorbing it into a frontend change.

When a number is over budget, `render-performance.md` has the causes and the
fix for each one — bundle size, image and font delivery, component and state
structure, memoization, and long lists or high-frequency updates — plus the
profiling tools (React DevTools Profiler, Chrome's Performance panel) for
finding which component or asset is actually responsible before changing
anything.

## Manual verification for the handoff

Some things cannot be verified by the agent, because they depend on
configuration only the user can do. List them as explicit steps with expected
results rather than leaving them implied:

- Sign up with a new account → lands on the expected page.
- Sign in, sign out, sign back in → session behaves.
- Visit a protected URL while signed out → redirected, not shown.
- Visit another user's resource by ID → not found, not shown.
- Subscribe to a plan → the gated feature unlocks.
- Cancel → the gated feature locks again on the defined schedule.
- Trigger a webhook → the handler runs and is idempotent on re-delivery.
- Load the deployed site → CSP present, no console errors, no blocked requests.

Each step names what a correct result looks like. "Check that auth works" is
not a verification step.

## Reporting

State what was run, what passed, and what was not verified. Distinguish
clearly:

- **Verified** — command run, output seen.
- **Not verified** — could not run it, and why.
- **`UNVERIFIED:`** — an API surface or claim written without confirming it
  against documentation, with what needs checking.

Never report a check as passing that was not run. An honest gap costs the user
a minute; a false pass costs them a production incident.
