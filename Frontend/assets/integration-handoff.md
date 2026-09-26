# Template — integration handoff

Fill this in and deliver it with the code. Delete sections that do not apply;
do not delete a section because it was tedious to fill in.

Write it to a person who has the Dashboard open and will follow it literally.
Every slug, key, URL, and event name must be an exact string they can copy. A
step that says "configure the relevant setting" will be done wrong.

Order matters: blocking prerequisites first, then configuration, then secrets,
then deployment, then verification.

---

# Integration handoff — [feature]

## Summary

[Two or three sentences: what was built, what it does, and what it needs from
you before it works.]

**Topology:** [static export on Pages | vinext on Workers | OpenNext on Workers
| other] — [one line on what that means for enforcement.]

**Blocked until configured:** [yes/no. If yes, name the one blocking step.]

## 1. Blocking prerequisites

> Nothing below works until these are done.

- [ ] **[e.g. Enable Billing]** — Clerk Dashboard → Billing → Settings → enable.
      Until this is on, `<PricingTable />` renders empty and every
      `has({ plan })` returns false, with no error.

## 2. Clerk Dashboard

Development and production are separate instances with separate keys. Do these
in both, or note which instance each applies to.

### Authentication
- [ ] Enable sign-in methods: [exact list matching what the UI renders]
- [ ] OAuth providers: [list] — production needs your own client ID and secret
      per provider; development uses Clerk's shared credentials
- [ ] Paths: sign-in `[/sign-in]`, sign-up `[/sign-up]`, after sign-in
      `[/dashboard]`, after sign-up `[/onboarding]`
- [ ] Production domain added and DNS verified: `[domain]`
- [ ] `authorizedParties` set to: `[exact origins, including preview URLs if
      auth must work there]`

### Roles and permissions
| Slug | Type | Used by |
|---|---|---|
| `[org:admin]` | Role | `[file:line or feature]` |
| `[org:invoices:create]` | Permission | `[…]` |

> These strings must match the code exactly. A typo is a permanent silent
> denial with no error message.

### Plans and features
| Plan slug | Type | Price | Publicly available |
|---|---|---|---|
| `[pro]` | User / Organization | `[$X/mo]` | Yes / No |

| Feature slug | Attach to plans | Gates |
|---|---|---|
| `[advanced_export]` | `[pro, enterprise]` | `[what it unlocks]` |

- [ ] Stripe connected (production only — development uses Clerk's gateway)
- [ ] Seat limits set on organization plans: [details or n/a]

### Webhooks
- [ ] Endpoint: `[https://your-domain/api/webhooks/clerk]`
- [ ] Subscribed events: `[user.created, user.updated, user.deleted, …]` —
      exactly these; the handler switches on them
- [ ] Signing secret copied into `CLERK_WEBHOOK_SIGNING_SECRET`

## 3. Environment variables

| Variable | Public? | Value from | Set in |
|---|---|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Public | Clerk → API keys | local, CI, deploy |
| `CLERK_SECRET_KEY` | **Secret** | Clerk → API keys | local, CI, deploy |
| `CLERK_WEBHOOK_SIGNING_SECRET` | **Secret** | Clerk → Webhooks → endpoint | local, deploy |
| `NEXT_PUBLIC_API_URL` | Public | Your backend URL | local, CI, deploy |

- `.env.example` has been updated with every key above and placeholder values.
- Secret values go in the platform's secret store (`wrangler secret put NAME`),
  never in `wrangler.jsonc`, `next.config`, or any committed file.
- Development keys are prefixed `pk_test_` / `sk_test_`. A `_test_` key in
  production is a live outage.

## 4. Backend contract

Endpoints the frontend now calls. The backend must implement these exactly.

### Every authenticated request

The frontend sends the Clerk session JWT as `Authorization: Bearer <token>`
(cross-origin) or the `__session` cookie (same-origin). For every request the
backend must:

1. Verify the signature against JWKS at `[https://<frontend-api>/.well-known/jwks.json]`, caching the key set.
2. Verify the algorithm is the expected one; reject `none`.
3. Verify `exp` and `nbf`, allowing ~5s clock skew.
4. Verify `azp` against the allowlist: `[exact origins]`. Skipping this opens the API to CSRF.
5. Take the user ID from the `sub` claim — **never** from a header, query parameter, or request body.
6. Re-check authorization and ownership per resource. The token proves identity, not entitlement to a row.
7. Restrict CORS to `[exact origins]`, credentials allowed only for those. Never `*`, never a reflected `Origin`.

### `[METHOD] [/api/v1/path]`

```
Auth:      required | public
Entitle:   feature `[slug]` → 403 PLAN_REQUIRED if absent
Request:   { field: type, constraints }
Response:  [status] { … }
Errors:    401 | 403 FORBIDDEN | 403 PLAN_REQUIRED | 422 VALIDATION_ERROR + details | 429
Backend must:
  - re-validate every field (client schema is not a control)
  - cap pageSize at [N]
  - rate-limit to [N]/min per user
  - return 404, not 403, for another user's record
```

[Repeat per endpoint.]

### Error envelope

Every error response, from every endpoint:

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "…", "details": {} } }
```

`message` is displayed to users — it must never contain a stack trace, a
database error, or an internal identifier.

## 5. Deployment

- Build command: `[…]`
- Output directory: `[…]`
- Adapter/runtime: `[…]`
- Bindings required: `[…]`
- Secrets to set on the platform: `[list]`
- Headers configured in: `[_headers | next.config | worker response]`
- Preview deployments: [do they need their own Clerk origins added?]

## 6. Verify it works

Do these in order. Each names the correct result.

1. **Sign up** with a new account → lands on `[/onboarding]`.
2. **Sign out, sign in** → lands on `[/dashboard]`.
3. **Visit `[/dashboard]` signed out** → redirected to sign-in, page content never renders.
4. **Call `[protected endpoint]` with no token** (curl) → `401`, not `200`.
5. **Call it with another user's resource ID** → `404`, not `403`, not the record.
6. **Subscribe to `[pro]`** → `[gated feature]` becomes available.
7. **Call `[gated endpoint]` on a free account** (curl, bypassing the UI) → `403 PLAN_REQUIRED`.
8. **Cancel the subscription** → `[gated feature]` locks per `[defined downgrade behavior]`.
9. **Trigger a webhook** from the Dashboard → handler runs; re-deliver the same event → no duplicate effect.
10. **Load the deployed site** → CSP header present, no console errors, no blocked requests.

Steps 4, 5, and 7 must be run with curl rather than through the UI. Run through
the interface, they only prove the interface hides things.

## 7. Open items

Anything unverified, assumed, or deliberately left out:

- `UNVERIFIED:` [claim] — needs [what to check].
- **Assumed:** [assumption] — correct it if wrong.
- **Not implemented:** [thing] — because [reason].
- **Decision needed:** [question only you can answer].
