# Next.js runtime, rendering, and deployment

Where code runs, what that means for trust and correctness, and how it reaches
Cloudflare. `frontend-design` owns component composition; this file owns the
boundary as a **security and correctness** decision.

**Contents**
- [The boundary is a trust decision](#the-boundary-is-a-trust-decision)
- [Keeping secrets server-side](#keeping-secrets-server-side)
- [Caching is a security surface](#caching-is-a-security-surface)
- [Route handlers](#route-handlers)
- [Server actions](#server-actions)
- [Middleware and proxy](#middleware-and-proxy)
- [Deploying to Cloudflare](#deploying-to-cloudflare)
- [Build and bundle hygiene](#build-and-bundle-hygiene)

---

## The boundary is a trust decision

`"use client"` marks the line between code you control and code the user
controls. Everything below that line — props passed into it, constants inlined
into it, the whole component tree it pulls in — ships to the browser and is
readable.

- **Default to server components** and push `"use client"` down to the leaves.
  A `"use client"` at the top of a page pulls the entire tree into the bundle.
- **Props to a client component are serialized into the HTML.** Passing a
  server-fetched user record to a client component publishes every field on it,
  including the ones the UI never renders. Pass the fields the component needs,
  not the object you happen to have.
- **A server component is where a secret may be read.** A client component is
  never that place, whatever the variable is called.
- **`"use client"` does not create a security boundary in the other
  direction.** A server component rendering inside a client tree still runs on
  the server, but any data it hands across the line has crossed into the
  browser.

Where the frontend must know something the user must not, that knowledge lives
in a route handler or a server action and is exposed only as a result.

## Keeping secrets server-side

```ts
// lib/api-secret.ts
import 'server-only'          // importing this from a client file is a build error
export const apiKey = process.env.UPSTREAM_API_KEY!
```

`server-only` converts a class of leak from a runtime incident into a failed
build. Use it in every module that reads a secret. The mirror, `client-only`,
guards modules that touch browser APIs.

Two leaks that survive careful review:

- **A `NEXT_PUBLIC_` variable read in a server file is still public.** The
  prefix decides publication at build time; where it is read does not matter.
- **A secret interpolated into rendered markup** — an inline script, a data
  attribute, a JSON blob for hydration — is in the HTML, whichever component
  wrote it.

## Caching is a security surface

The highest-consequence mistake available in this framework is caching a
personalized response at a shared layer and serving it to another user. It
presents as a bizarre bug report — "I saw someone else's dashboard" — and it is
a data breach.

- **Anything derived from `auth()`, cookies, or headers must be dynamic.**
  Reading them normally opts a route out of static rendering; confirm it did
  rather than assuming, especially where a value is read inside a helper
  several layers down.
- **Never set a shared-cache header on an authenticated response.** `private`
  and `no-store` are the correct answers; `s-maxage` on a personalized route is
  the incident.
- **Cache keys must include the identity dimension** wherever a cache sits in
  front of user-varying content — including the CDN.
- **Revalidation and tag invalidation are correctness-critical.** A stale
  entitlement means a downgraded user keeps a paid feature, or a paying one
  loses it.
- **Draft and preview modes bypass caching and often bypass gating.** Confirm
  they are not enabled in production.

State in the report which routes are static and which are dynamic, and why.
This is the fact most likely to be wrong after a refactor, and the one least
likely to be noticed.

## Route handlers

A route handler is a public HTTP endpoint. It is reachable by anything that can
make a request, regardless of what the UI does.

- **Every exported HTTP verb needs its own auth check.** `GET` protected and
  `POST` unprotected in one file is common and invisible in review.
- **Validate the body, the query, and the route params** before use.
- **Return the shared error envelope**, never a raw exception.
- **Set an explicit runtime and caching posture** rather than inheriting a
  default that changes between framework versions.
- **A handler that proxies to the backend must not become an open proxy.**
  Allowlist the target paths; never forward a user-supplied URL, and never
  forward the client's headers wholesale.

## Server actions

Server actions are the surface most often left unprotected, because they do not
look like endpoints. They are.

- **They are invoked by ID, not by path.** No path-based gate — middleware,
  route matcher, folder convention — protects them. Search `'use server'` and
  confirm every exported function.
- **Every argument is user input**, including ones the UI would never send.
  Validate with a schema.
- **Check ownership**, not just identity. An action taking a record ID must
  confirm the authenticated user owns that record.
- **Do not return more than the caller needs.** The return value is serialized
  to the client.
- **Actions are not idempotent by default.** A double-submitted action runs
  twice; disable the control during flight and make destructive actions safe to
  repeat.

## Middleware and proxy

Next.js 16 renamed middleware to `proxy.ts`; on ≤ 15 it is `middleware.ts`. The
contents are the same.

Legitimate uses: request and response headers, locale routing, redirects,
rewrites, and an early signed-out redirect as a **latency optimization**.

Not a legitimate use: the authorization gate. Framework middleware has been
bypassed in practice (CVE-2025-29927, via a forged `x-middleware-subrequest`
header), it cannot see server actions, and its path patterns must be
hand-mapped to a folder tree that includes route groups and dynamic segments
the URL does not.

The test: **if deleting a piece of middleware logic would leave a resource
unprotected, it was a gate and it belongs at the resource.**

If a middleware-level early redirect is kept, comment it as cosmetic and keep
the resource check. Otherwise the next reader treats it as the control.

## Deploying to Cloudflare

Determine which of these the repo uses before changing anything, and say which
you found. Do not migrate between them as a side effect of another task.

| Path | Signal in the repo | What exists |
|---|---|---|
| **Static export on Pages** | `output: "export"` in `next.config` | No server at all. No route handlers, no `proxy.ts`, no server components with data, no server actions. |
| **vinext on Workers** | `vinext` dependency, Vite config, `@vinext/cloudflare` deploy script | Full App Router — server components, route handlers, server actions, middleware/proxy. Cloudflare's currently recommended path. |
| **OpenNext on Workers** | `@opennextjs/cloudflare`, `open-next.config` | Full App Router on the Node.js runtime. Supported; the documented path for apps that cannot yet move to vinext. |
| **`@cloudflare/next-on-pages`** | `@cloudflare/next-on-pages` | Legacy, Edge-runtime only. Do not start here. If found, note it and let the user decide about migrating. |

Verify the current state of these tools before acting — this area has changed
repeatedly, and the recommended path in the docs today may not be the one in
the repo.

Deployment items regardless of path:

- **Secrets go to the platform's secret store** (`wrangler secret put` or the
  dashboard), never into `wrangler.jsonc`/`wrangler.toml` or any committed
  file. Bindings and non-secret vars may live in the config.
- **Preview deployments are real deployments.** They get real URLs and are
  frequently public. They must not carry production secrets, and their origins
  must be in Clerk's `authorizedParties` if auth is expected to work there.
- **Security headers** are set in `_headers` for Pages or on the Worker
  response — and must be verified on a deployed response, not assumed from the
  config.
- **Node API availability differs by adapter.** A dependency that works locally
  can fail at the edge. Check compatibility flags rather than discovering it in
  production.
- **The build command and output directory** must match the adapter. Name both
  in the handoff.

For a static export, restate the consequence plainly: the frontend has no
trusted execution, so every authorization decision belongs to the backend API.

## Build and bundle hygiene

- **Do not disable type or lint errors in the build config.** `ignoreBuildErrors`
  and its equivalents convert a caught bug into a production one. If they are
  already set, say so rather than silently working around them.
- **Check what is in the bundle** before shipping a new dependency. The budget
  is under 200KB gzipped for initial JS; a date library or icon set imported
  wholesale can breach it alone.
- **Import selectively.** A namespace import from a large package can pull the
  whole thing in.
- **One library per job** — one icon set, one form library, one date library.
  Duplicates cost bundle weight and produce inconsistent behavior.
- **Confirm no source maps expose server code** in a public deployment.
- **Set the framework and adapter versions explicitly**, and pin anything
  described as experimental — which currently includes parts of Clerk Billing.

For code splitting, lazy loading, and everything else that trims what ships
or speeds up render, see `render-performance.md`.
