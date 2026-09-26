# Clerk Billing

Plans, features, entitlement gating, checkout, and subscription lifecycle.
Read `clerk-auth.md` first — billing checks ride on the same `auth()` and
`has()` surface.

**Contents**
- [The prerequisite](#the-prerequisite)
- [The model: plans, features, entitlements](#the-model-plans-features-entitlements)
- [Gate on features, not plan names](#gate-on-features-not-plan-names)
- [Where to enforce a paywall](#where-to-enforce-a-paywall)
- [The pricing page](#the-pricing-page)
- [Checkout and the customer portal](#checkout-and-the-customer-portal)
- [Billing webhooks](#billing-webhooks)
- [Seats and B2B](#seats-and-b2b)
- [Backend contract for entitlements](#backend-contract-for-entitlements)
- [Dashboard setup for the handoff](#dashboard-setup-for-the-handoff)
- [Failure modes](#failure-modes)

---

## The prerequisite

**Billing must be enabled in the Clerk Dashboard before any of this code does
anything.** `<PricingTable />` renders empty, `has({ plan })` returns false,
and checkout does not open. Nothing throws — it just silently does nothing,
which is why it costs hours.

Put this at the top of the handoff as a blocking step: Dashboard → Billing →
Settings → enable. Enabling auto-creates default `free_user` / `free_org`
plans. Development instances can use Clerk's shared development gateway;
**production requires the user to connect a Stripe account** for payment
processing. Clerk owns the plan model; the plans are not mirrored into Stripe
as products the user manages.

Clerk's billing APIs have been shipping quickly. **Pin `@clerk/nextjs` and
`clerk-js`** rather than floating on a range, and say in the handoff which
versions you targeted.

## The model: plans, features, entitlements

Three levels, and conflating them is the usual design mistake:

| Concept | What it is | Lives in |
|---|---|---|
| **Plan** | A priced tier a user or organization subscribes to (`pro`, `team`) | Dashboard → Billing → Plans |
| **Feature** | A named entitlement attached to one or more plans (`advanced_export`) | Inside a plan's Features section |
| **Permission** | What a member may do within an organization (`org:invoices:create`) | Organization settings |

Features are **scoped per plan, not global**. The same slug attached to several
plans means `has({ feature: 'export' })` is true on any of them — which is the
behavior you want, and the reason feature checks survive a repricing.

Plans are either **user plans** or **organization plans**. This choice
determines which surface they appear on and is the most common source of an
empty pricing table.

## Gate on features, not plan names

```ts
// Brittle: breaks when a tier is renamed, split, or a new tier gains the capability
if (has({ plan: 'pro' })) { … }

// Durable: expresses the capability the code actually needs
if (has({ feature: 'advanced_export' })) { … }
```

Use `has({ plan })` only when the gate genuinely *is* the tier — a "you are on
Free" banner, a plan comparison, an upgrade prompt naming the target plan.
Every capability gate uses `has({ feature })`.

The payoff is concrete: adding an Enterprise tier that includes advanced export
requires one Dashboard change and no code change. Plan-name checks require
finding every call site.

## Where to enforce a paywall

A paywall is an authorization decision, so it follows the same rule as every
other: **the client-side check is UX, the server-side check is the control.**
A user who edits the bundle to render a Pro button must still be refused by the
endpoint behind it.

```tsx
// Client — decides what is shown. Not a control.
<Show when={{ feature: 'advanced_export' }} fallback={<UpgradePrompt />}>
  <ExportButton />
</Show>
```

```ts
// Server — the actual gate. Every entitlement-gated resource gets one.
import { auth } from '@clerk/nextjs/server'

export async function POST(req: Request) {
  const { userId, has } = await auth.protect()
  if (!has({ feature: 'advanced_export' })) {
    return Response.json(
      { error: { code: 'PLAN_REQUIRED', message: 'Advanced export requires a paid plan.' } },
      { status: 403 },
    )
  }
  return Response.json(await runExport(userId, ExportInput.parse(await req.json())))
}
```

Return **403 with a distinguishable code**, not 402 and not a bare 403. The
client needs to tell "you are not signed in" (401), "you may not do this" (403
`FORBIDDEN`), and "your plan does not include this" (403 `PLAN_REQUIRED`)
apart, because only the last one should surface an upgrade path.

Where the resource lives in a separate backend, the backend enforces it — see
[Backend contract](#backend-contract-for-entitlements).

Two gates that are frequently missed:

- **Usage limits.** "10 exports per month on Free" is a counter the server
  owns. A client-side count is a suggestion.
- **The downgrade path.** When a subscription lapses, resources created under
  the paid plan still exist. Decide explicitly what happens — read-only,
  hidden, or deleted — and say so in the handoff. Leaving it undefined is how
  a downgraded user keeps full access indefinitely.

## The pricing page

```tsx
import { PricingTable } from '@clerk/nextjs'

export default function PricingPage() {
  return <PricingTable />                    // user plans (default)
}
```

```tsx
<PricingTable for="organization" />          // organization plans
```

`for` must match the plan type in the Dashboard. A mismatch renders an empty
table with no error — check this first when a user reports "the pricing page is
blank".

`<PricingTable />` opens Clerk's checkout drawer itself; there is no separate
checkout route to build. It accepts `appearance` for the table and
`checkoutProps.appearance` for the drawer, so it can be brought onto the
project's design tokens. Styling the pricing page is `frontend-design`'s
concern; wiring it is this skill's.

If the design calls for a fully custom pricing page, the plan and subscription
data are available through Clerk's hooks — but confirm the current hook names
against the docs rather than assuming, since this surface is newer than most of
the SDK.

## Checkout and the customer portal

Subscription management — payment method, invoices, cancellation, plan changes
— is handled by Clerk's own components rather than a route you build. User
plans surface in `<UserProfile />`; organization plans surface in
`<OrganizationProfile />`. Link to those rather than building a billing screen.

Never build a custom flow that collects card details. Payment data must not
touch the application at all; that is the entire point of the hosted drawer,
and doing otherwise pulls the project into PCI scope.

## Billing webhooks

Subscription state changes asynchronously — renewals, failed payments,
cancellations, upgrades — and the app learns about it by webhook. Verify the
signature exactly as in `clerk-auth.md`, then handle the subscription events
the app depends on.

What matters more than the event list, which changes:

- **`has()` reads the session token**, so an entitlement change is not visible
  to a signed-in user until their token refreshes. If a purchase must unlock
  the UI immediately, refresh the session rather than waiting.
- **Handle failed payment as a state, not an error.** A subscription in a
  past-due state is a distinct condition from active and from cancelled, and
  the UI should say something specific.
- **Never grant entitlements from a client-reported purchase.** The webhook and
  `has()` are the sources of truth. "Checkout returned success" is a client
  claim.
- **Idempotency and ordering** apply as they do for all webhooks: key on the
  event ID, derive state from payload timestamps rather than arrival order.

If the backend maintains its own copy of subscription state, decide which
system is authoritative and say so in the handoff. Two systems both believing
they own entitlement is how a user pays and stays locked out.

## Seats and B2B

Organization plans can be seat-limited. Two things follow:

- **Seat count is enforced at invitation time**, on the server. A client-side
  member count is not a limit.
- **Permission checks and feature checks compose.** A member may have the
  permission and the organization may lack the feature, or the reverse. Check
  both where both apply, and make the failure message say which one failed —
  "your plan does not include this" and "you do not have permission" send the
  user to completely different places.

## Backend contract for entitlements

When the gated resource lives in the Rust/Axum backend rather than a Next.js
route handler, put this in the handoff:

Clerk publishes plan and feature entitlements as claims in the session JWT. The
backend, having already verified the token per `clerk-auth.md`, reads the
entitlement from the verified claims — **never from a header, body field, or
query parameter supplied by the client.**

Specify for each gated endpoint:

- The feature slug required, exactly as it appears in the Dashboard.
- The status and error code on failure (`403` / `PLAN_REQUIRED`).
- Any usage limit the backend must count, its window, and its reset behavior.
- What happens to existing resources when entitlement is lost.

Confirm the current claim shape against Clerk's documentation for the pinned
version before writing the contract, and mark it `UNVERIFIED:` if you could
not. Guessing a claim name here produces a backend that silently denies every
paid user.

## Dashboard setup for the handoff

1. **Enable Billing** — Dashboard → Billing → Settings. Blocking; nothing works
   before this.
2. **Connect Stripe** for the production instance. Development can use the
   shared gateway.
3. **Create each plan** with the exact name, price, interval, and — critically
   — the correct type (user or organization). List each one explicitly.
4. **Add each feature** inside its plan, with the exact slug the code checks.
   List every slug. A mismatch is a silent permanent denial, so these strings
   must be copied, not retyped.
5. **Set publicly available** on plans that should appear in `<PricingTable />`,
   and unset it on internal or legacy plans.
6. **Configure seat limits** on organization plans if used.
7. **Add the billing webhook endpoint** and subscribe to the exact event types
   the handler switches on.
8. **Test the full path in development** — subscribe, verify the feature
   unlocks, cancel, verify it locks — before going live.

Include a table mapping every feature slug in the code to the plans that should
carry it. That table is the thing the user actually needs, and it is the thing
most easily got wrong.

## Failure modes

| Symptom | Cause |
|---|---|
| `<PricingTable />` renders empty | Billing not enabled, or `for` does not match the plan type (user vs organization) |
| `has({ feature })` always false | Feature slug mismatch, or the feature is not attached to the subscribed plan |
| `has({ plan })` false right after purchase | Session token predates the change; refresh the session |
| Free users reach paid functionality | Gate exists only in `<Show>`; no server-side check |
| Entitlement works in the UI, denied by the backend | Backend reading entitlement from an unverified claim, or a different slug |
| Subscription state drifts | Webhook handler not idempotent, or arrival order treated as sequence |
| Downgraded user keeps access | No defined downgrade behavior for existing resources |
| Works in development, fails in production | Stripe not connected on the production instance |
