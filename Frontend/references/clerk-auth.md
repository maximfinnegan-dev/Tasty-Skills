# Clerk authentication

The Core 3 surface, the protection model, the failure modes, and what the user
must configure. Verify against the installed version before writing code — see
[Version check](#version-check).

**Contents**
- [Version check](#version-check)
- [Core 3 API surface](#core-3-api-surface)
- [The protection model](#the-protection-model)
- [Protecting each resource type](#protecting-each-resource-type)
- [Authorization: roles, permissions, organizations](#authorization-roles-permissions-organizations)
- [Client-side state and signed-out UX](#client-side-state-and-signed-out-ux)
- [Calling a separate backend](#calling-a-separate-backend)
- [What the backend must do](#what-the-backend-must-do)
- [Webhooks](#webhooks)
- [Static-export topology](#static-export-topology)
- [Environment variables](#environment-variables)
- [Dashboard setup for the handoff](#dashboard-setup-for-the-handoff)
- [Failure modes](#failure-modes)

---

## Version check

Read `package.json` for `@clerk/nextjs` (or `@clerk/react`) and `next`, then
confirm the resolved version in the lockfile. Two forks matter:

| Question | Answer changes |
|---|---|
| Clerk Core 2 or Core 3? | Core 2 has `<SignedIn>`/`<SignedOut>`/`<Protect>`; Core 3 replaced all three with `<Show>`. Core 2 is in long-term support until January 2027, so a Core 2 codebase is not automatically wrong. |
| Next.js ≤ 15 or 16+? | The middleware file is `middleware.ts` on ≤ 15 and `proxy.ts` on 16+. The contents are identical. |

Match the codebase. Do not migrate a working Core 2 app to Core 3 as a side
effect of an unrelated task — propose it separately. If you do migrate, Clerk
ships `@clerk/upgrade` to automate most of it.

Everything below is Core 3 with Next.js 16 naming.

## Core 3 API surface

```ts
// Server: App Router pages, layouts, route handlers, server actions
import { auth, currentUser, clerkClient } from '@clerk/nextjs/server'

const { userId, sessionClaims, orgId, has, redirectToSignIn } = await auth()
const { userId } = await auth.protect()          // throws/redirects if signed out
const user = await currentUser()                  // full user object, extra fetch

// Client components
import { useAuth, useUser, useSession } from '@clerk/nextjs'
const { isLoaded, isSignedIn, userId, getToken, has, signOut } = useAuth()

// Components
import { ClerkProvider, Show, SignInButton, UserButton, RedirectToSignIn } from '@clerk/nextjs'
```

`<Show>` replaces the three removed components:

```tsx
<Show when="signed-in">  <Dashboard /> </Show>
<Show when="signed-out"> <Marketing /> </Show>
<Show when={{ role: 'org:admin' }} fallback={<NoAccess />}> <AdminPanel /> </Show>
<Show when={{ permission: 'org:invoices:create' }}> <NewInvoice /> </Show>
<Show when={{ plan: 'pro' }}>       <ProOnly /> </Show>
<Show when={{ feature: 'export' }}> <ExportButton /> </Show>
<Show when={(has) => has({ plan: 'pro' }) || has({ role: 'org:admin' })}>…</Show>
```

Other Core 3 changes worth knowing: `@clerk/clerk-react` → `@clerk/react`
(`@clerk/nextjs` unchanged); `appearance.layout` → `appearance.options`; Clerk
Elements deprecated in favor of hooks; `getToken()` throws `ClerkOfflineError`
when offline, so wrap it.

## The protection model

**Protect the resource, not the route.** Clerk deprecated `createRouteMatcher()`
and no longer recommends gating in middleware. The reasons are concrete:

- Server actions are invoked **by ID, not by path**. An action defined in
  `/protected/actions.ts` and called from `/public/` is seen by middleware as a
  request to `/public/`. A path matcher never protects it.
- URL patterns must be hand-mapped to folders, and route groups (`(app)`) and
  dynamic segments (`[locale]`) appear in one and not the other. A glob that
  matches nothing reports no errors and looks like success.
- Clerk and the framework can normalize a path differently, which is a bypass
  class in itself (GHSA-vqx2-fgx2-5wq9).
- Framework middleware has been bypassed outright — CVE-2025-29927 skipped
  Next.js middleware entirely via a forged `x-middleware-subrequest` header.

`clerkMiddleware()` itself is still required. Keep it and its `config.matcher`.
Only the auth *checks* move out.

```ts
// proxy.ts  (middleware.ts on Next.js ≤ 15)
import { clerkMiddleware } from '@clerk/nextjs/server'

export default clerkMiddleware({
  // Allowlist of origins permitted to mint tokens for this app.
  // Omitting this leaves the app open to subdomain cookie leaking and CSRF.
  authorizedParties: [process.env.NEXT_PUBLIC_APP_URL!],
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
    '/__clerk/(.*)',
  ],
}
```

Set `authorizedParties` on every deployment. It is the single highest-value
option on this function and it is off by default.

An early signed-out redirect may live in middleware **as a latency
optimization**, never as the gate:

```ts
export default clerkMiddleware(async (auth, req) => {
  // Not an auth guarantee — resource checks still enforce access.
  if (req.nextUrl.pathname.startsWith('/dashboard')) {
    const { isAuthenticated, redirectToSignIn } = await auth()
    if (!isAuthenticated) return redirectToSignIn()
  }
})
```

If you add this, keep the resource checks and say in the report that the
redirect is cosmetic — otherwise the next agent reads it as the control.

## Protecting each resource type

Add the check to **every** file below, not only the entry point. Layouts do not
re-render on every navigation, so a layout check does not cover its pages.

```tsx
// app/dashboard/page.tsx — also layout.tsx, template.tsx, default.tsx
import { auth } from '@clerk/nextjs/server'

export default async function Page() {
  const { userId } = await auth.protect()
  return <Dashboard userId={userId} />
}
```

```ts
// app/api/reports/route.ts — every exported HTTP verb
import { auth } from '@clerk/nextjs/server'

export async function GET() {
  const { userId } = await auth.protect()
  return Response.json(await listReports(userId))
}
export async function POST(req: Request) {
  const { userId } = await auth.protect()
  const body = CreateReport.parse(await req.json())   // validate before use
  return Response.json(await createReport(userId, body), { status: 201 })
}
```

```ts
// Any file with 'use server' — regardless of where it lives
'use server'
import { auth } from '@clerk/nextjs/server'

export async function deleteReport(id: string) {
  const { userId } = await auth.protect()
  const report = await getReport(id)
  if (report.ownerId !== userId) throw new Error('Not found')  // ownership, not just identity
  await remove(id)
}
```

`auth.protect()` responds by request type: redirect to sign-in for document
requests, `401` for server actions, `404` for other non-document requests. For
custom behavior, branch on `userId` from `await auth()` yourself.

**Authentication is not authorization.** `auth.protect()` proves *who*. It says
nothing about whether that user owns the record. Every handler that takes an ID
from the client must check ownership or membership against the authenticated
user — this is the most common real vulnerability in Clerk codebases, and no
Clerk API does it for you.

**Keep the check at the top of the function.** Clerk's lint rule expects it
there, and a check after an `await` that already touched data is not a check.

### Enforce it mechanically

```bash
npm install --save-dev @clerk/eslint-plugin
```

```js
// eslint.config.mjs
import clerkNext from '@clerk/eslint-plugin/next'

export default [{
  plugins: { '@clerk/next': clerkNext },
  rules: {
    '@clerk/next/require-auth-protection': ['error', {
      protected: ['**'],
      public: ['src/app/sign-in/**', 'src/app/sign-up/**', 'src/app/(marketing)/**'],
    }],
  },
}]
```

Add this rule whenever you add auth to a project. It is the only thing that
keeps the twentieth route protected. Note two limits: it covers App Router
only — Pages Router must be audited by hand — and the rule is experimental, so
pin the package version. Derive the globs from the actual directory tree, not
from URL patterns; a glob matching no folders silently reports success.

## Authorization: roles, permissions, organizations

```ts
const { has, orgId, orgRole } = await auth()

if (!has({ role: 'org:admin' })) return forbidden()
if (!has({ permission: 'org:invoices:create' })) return forbidden()
```

Prefer **permissions over roles**. A permission check survives a role rename
and reads as intent; `has({ role: 'org:admin' })` scattered through a codebase
becomes unmaintainable the first time the role model changes.

For organization-scoped apps, `orgId` is part of the query, not a filter
applied afterward. Every data access is scoped by `(userId, orgId)` — a query
that returns another tenant's rows and is then filtered in JavaScript has
already leaked them into the response path.

`organizationSyncOptions` on `clerkMiddleware()` can activate an org from the
URL, but it relies on the handshake, which only runs on document navigations.
It will not set the active org for `fetch`/XHR calls or WebSocket upgrades —
call `setActive()` explicitly before those.

## Client-side state and signed-out UX

Removing a middleware gate can degrade UX for client-only routes: a page that
used to redirect now renders and then errors. Restore it deliberately in a
client component, in the layout for that route group — not the root layout:

```tsx
'use client'
import { RedirectToSignIn, Show } from '@clerk/nextjs'

export function RequireSignIn({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Show when="signed-in">{children}</Show>
      <Show when="signed-out"><RedirectToSignIn /></Show>
    </>
  )
}
```

This is presentation. The endpoints it calls still enforce their own checks.

Always branch on `isLoaded` before `isSignedIn`. Rendering a signed-out state
during the loading tick produces a flash of the wrong UI on every page load —
common, avoidable, and consistently reported as a bug.

## Calling a separate backend

```tsx
'use client'
import { useAuth } from '@clerk/nextjs'

export function useApi() {
  const { getToken } = useAuth()
  return async (path: string, init: RequestInit = {}) => {
    const token = await getToken()               // per request, never cached
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
      ...init,
      headers: { ...init.headers, Authorization: `Bearer ${token}` },
    })
    if (!res.ok) throw await toApiError(res)
    return res.json()
  }
}
```

Same-origin requests carry the `__session` cookie automatically. Cross-origin
requests do not — the header is required. A backend on a different domain is
cross-origin.

Call `getToken()` inside the request function every time. Session tokens are
short-lived; a token captured once at mount will expire and produce
intermittent 401s that look like a backend problem.

Server-side, forward the token explicitly:

```ts
const { getToken } = await auth()
const res = await fetch(`${process.env.API_URL}/reports`, {
  headers: { Authorization: `Bearer ${await getToken()}` },
})
```

## What the backend must do

Put this verbatim in the handoff. The frontend cannot enforce any of it, and
the backend is where it actually matters — especially in a static-export
topology, where it is the only enforcement that exists.

The backend receives a Clerk session JWT in `Authorization: Bearer <token>`, or
in the `__session` cookie for same-origin requests. For every request it must:

1. **Verify the signature** against the instance's JWKS
   (`https://<your-frontend-api>/.well-known/jwks.json`). Cache the key set;
   JWKS retrieval is exempt from Clerk's rate limits but should not be per
   request.
2. **Check the algorithm** is the expected one. Reject `none` and reject an
   algorithm the token itself asks for.
3. **Check `exp` and `nbf`**, allowing small clock skew (Clerk's own default is
   5 seconds).
4. **Check the `azp` claim** against an allowlist of permitted origins. Clerk
   documents that skipping this opens the application to CSRF. If `azp` is
   absent, decide deliberately whether to accept the token.
5. **Take the user identity from `sub`** — never from a header, a query
   parameter, or the request body. A `userId` in a JSON payload is user input.
6. **Re-check authorization and ownership** for every resource. The token
   proves identity; it does not prove the caller owns the row.
7. **Rate-limit** authentication-adjacent and expensive endpoints.
8. **Restrict CORS** to the exact frontend origins, with credentials only for
   those origins. Never `*`, never a reflected `Origin`.

Clerk publishes a Rust SDK; whether the backend uses it or verifies the JWT
directly with a JWKS-aware JWT library, the checks above are the same. Name
which one you assumed in the handoff.

## Webhooks

Clerk webhooks are signed with Svix. **Verify the signature before parsing the
body**, and use the raw body — parsing first and verifying after defeats the
signature entirely.

```ts
// app/api/webhooks/clerk/route.ts
import { verifyWebhook } from '@clerk/nextjs/webhooks'

export async function POST(req: Request) {
  let evt
  try {
    evt = await verifyWebhook(req)              // reads CLERK_WEBHOOK_SIGNING_SECRET
  } catch {
    return new Response('Invalid signature', { status: 400 })
  }

  switch (evt.type) {
    case 'user.created':
    case 'user.updated':
      await upsertUser(evt.data.id, evt.data)
      break
    case 'user.deleted':
      await softDeleteUser(evt.data.id)
      break
  }
  return new Response('', { status: 200 })      // 2xx quickly, or Svix retries
}
```

Four things that are easy to get wrong:

- **The route must be public.** A webhook has no session. If it sits behind a
  gate, every delivery fails and the failure is silent until data drifts.
- **Handlers must be idempotent.** Svix retries on non-2xx and can deliver
  twice. Key on the event ID or upsert.
- **Events can arrive out of order.** Do not derive state from arrival order;
  use the payload's own timestamps.
- **Return 2xx fast.** Queue slow work rather than holding the response open.

## Static-export topology

With `output: "export"` there is no `proxy.ts`, no route handler, no server
component, and no server action. Consequences to state explicitly in the
report:

- Clerk runs entirely client-side. `<Show>` and `useAuth()` control what
  renders. Nothing more.
- **Every authorization decision belongs to the backend API.** The backend
  contract is not supporting documentation here; it is the security design.
- Webhooks cannot be received by the frontend — they go to the backend.
- The publishable key is the only Clerk key present. If a secret key appears
  in a static build, it is exposed; rotate it.

Do not paper over this by adding client-side checks that look like enforcement.
Say plainly that the frontend cannot enforce anything and that the backend
must.

## Environment variables

| Variable | Public? | Where |
|---|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Public by design | Client and server |
| `CLERK_SECRET_KEY` | **Secret** | Server only |
| `CLERK_WEBHOOK_SIGNING_SECRET` | **Secret** | Server only |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Public | Optional, if not using defaults |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Public | Optional |
| `CLERK_ENCRYPTION_KEY` | **Secret** | Only when passing `secretKey` to `clerkMiddleware()` |

Development and production instances have different keys. A `pk_test_`/
`sk_test_` pair in a production deployment is a live outage; check the prefix
when the user reports "it works locally".

## Dashboard setup for the handoff

The user does this, not you. List the items that apply, in order, each with its
consequence:

1. **Create the application**, and note that development and production are
   separate instances with separate keys.
2. **Enable the sign-in methods** the UI actually renders. A social provider
   shown in the code and disabled in the Dashboard is a broken button.
3. **Configure OAuth providers** — development uses Clerk's shared credentials;
   production requires the user's own client ID and secret per provider.
4. **Set the paths** for sign-in, sign-up, and after-sign-in/sign-up redirects
   to match the app's routes.
5. **Add the production domain** and complete DNS verification.
6. **Set `authorizedParties`** to the deployed origins — name the exact strings.
7. **Create roles and permissions** if the app uses them, with the exact slugs
   the code checks. A typo here is a silent permanent denial.
8. **Enable Organizations** if the app uses `orgId`.
9. **Add the webhook endpoint** for the deployed URL, subscribe to the exact
   event types the handler switches on, and copy the signing secret into the
   environment.
10. **Copy the keys** into local `.env.local`, CI, and the deploy platform's
    secret store.

## Failure modes

| Symptom | Cause |
|---|---|
| `auth()` returns null on a fetch to your own API | Request did not send cookies, or is cross-origin without the `Authorization` header |
| Works for a minute, then 401s | A `getToken()` result was cached; fetch it per request |
| Random 401s in production only | Development keys deployed, or `authorizedParties` missing the production origin |
| Flash of signed-out UI on every load | Rendering before `isLoaded` |
| Middleware protects some routes, not others | Route groups and dynamic segments in the tree that are absent from the URL pattern |
| Server action reachable while signed out | It was "protected" by a path matcher; actions are called by ID |
| Webhook never fires | Endpoint sits behind an auth gate, or the event type is not subscribed |
| Webhook processes twice | Handler is not idempotent; Svix retried |
| Deprecation warning in the console | `createRouteMatcher()` — migrate to resource checks |
| `<SignedIn>` is not exported | Core 3; use `<Show when="signed-in">` |
| Type imports fail from `@clerk/types` | Core 3 exposes types from the SDK's own `/types` entry |
