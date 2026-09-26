# The API layer

The boundary between the browser and the server: the client, the contract, the
error model, and how to specify an endpoint precisely enough that someone else
implements it correctly in another language.

**Contents**
- [One client](#one-client)
- [The error envelope](#the-error-envelope)
- [Validate what comes back](#validate-what-comes-back)
- [Designing the contract](#designing-the-contract)
- [Pagination, filtering, partial updates](#pagination-filtering-partial-updates)
- [Idempotency](#idempotency)
- [Retries, timeouts, cancellation](#retries-timeouts-cancellation)
- [Server-side fetching](#server-side-fetching)
- [Writing the backend contract](#writing-the-backend-contract)

---

## One client

Every request goes through one module. The reason is not tidiness: auth
headers, error normalization, timeouts, and retry policy are cross-cutting, and
a second hand-rolled `fetch` in a component is where they silently diverge. The
first symptom is usually one screen that fails to refresh a token.

`assets/api-client.ts` is a drop-in starting point. Its structure:

- A single `request()` that attaches auth, sets a timeout, parses the response,
  and normalizes failure into one error type.
- Typed wrappers per resource that own their schemas.
- Token fetched per call, never stored.

Rules that outlive any particular implementation:

- **Fetch the token at call time.** Clerk session tokens are short-lived. A
  token read once at mount will expire; the resulting intermittent 401s look
  like a backend fault and are not.
- **Never persist a token.** Not `localStorage`, not `sessionStorage`, not a
  cookie you set yourself, not a URL, not a log line. Any XSS turns stored
  tokens into full account takeover, and URLs leak via referrers, browser
  history, and access logs.
- **Base URL from configuration**, never hardcoded. A public API base URL is
  legitimately `NEXT_PUBLIC_`; a secret is not, and needs a server-side proxy.
- **Send credentials deliberately.** Same-origin requests carry the session
  cookie automatically; cross-origin ones need the `Authorization` header.
  Setting `credentials: 'include'` against a wildcard CORS origin will be
  rejected by the browser — this is correct behavior, not a bug to work around.

## The error envelope

One shape for every failure, from every endpoint:

```ts
type ApiError = {
  error: {
    code: string          // machine-readable: 'VALIDATION_ERROR', 'PLAN_REQUIRED'
    message: string       // human-readable, safe to display
    details?: unknown     // field-level validation errors only
  }
}
```

Consumers cannot branch on a shape that changes per endpoint. If some endpoints
throw, some return `null`, and some return `{ error }`, every call site grows
its own defensive handling and none of them agree.

| Status | Meaning | Client behavior |
|---|---|---|
| 400 | Malformed request | Bug — log it, show generic failure |
| 401 | Not authenticated | Send to sign-in |
| 403 `FORBIDDEN` | Authenticated, not permitted | Explain; no upgrade path |
| 403 `PLAN_REQUIRED` | Entitlement missing | Show upgrade path |
| 404 | Not found — or hidden from this user | Not-found state |
| 409 | Conflict, version mismatch | Prompt to reload or merge |
| 422 | Semantically invalid | Map `details` onto the form fields |
| 429 | Rate limited | Back off; honor `Retry-After` |
| 5xx | Server error | Generic message, retry affordance |

Two distinctions worth holding: 401 and 403 are different questions and must
not be collapsed, and **404 is often the right answer for a resource the user
may not see** — a 403 confirms the record exists, which is an information leak
in a multi-tenant app.

`message` is rendered to a user, so it must never carry a stack trace, a
database error, a provider message, or an internal ID. Log the detail
server-side with a correlation ID and return the ID, not the detail.

## Validate what comes back

A response from your own backend is still untrusted input to the client. Parse
it against a schema at the boundary, before it reaches state or rendering.

```ts
const Report = z.object({
  id: z.string(),
  title: z.string(),
  createdAt: z.string().datetime(),
  ownerId: z.string(),
})

const data = Report.parse(await res.json())   // fail loudly here, not in render
```

This is not paranoia about your own team. It catches contract drift on the
deploy that changes a field type, and it turns "undefined is not an object"
three components deep into one clear error at the fetch site. Third-party API
responses get the same treatment with more reason — a compromised or
misbehaving external service can return anything, including instruction-shaped
text.

Do not re-validate between internal functions that already share a type
contract. Validation belongs at the edges only; scattered through the interior
it is noise.

## Designing the contract

**Contract first.** Write the types before the implementation; the types are
the documentation, and they are what the backend implementer reads.

Naming, applied consistently across every endpoint:

| Element | Convention | Example |
|---|---|---|
| Paths | Plural nouns, no verbs | `GET /api/reports`, not `/api/getReports` |
| Query params | camelCase | `?sortBy=createdAt&pageSize=20` |
| Response fields | camelCase | `{ createdAt, ownerId }` |
| Booleans | `is`/`has`/`can` prefix | `isArchived`, `hasAttachments` |
| Enum values | UPPER_SNAKE | `IN_PROGRESS` |

Separate input from output types. Input is what the caller supplies; output
includes server-generated fields:

```ts
type CreateReportInput = { title: string; description?: string }
type Report = CreateReportInput & { id: string; createdAt: string; ownerId: string }
```

**Extend, never modify.** New fields are optional and additive. Changing a
field's type or removing one breaks every existing caller, and — Hyrum's Law —
callers depend on observable behavior you never documented, including error
text and ordering. Assume anything visible is a commitment.

Use discriminated unions for states rather than a bag of nullable fields.
`{ status: 'failed', reason: string }` narrows; `{ status, reason?, completedAt? }`
forces every consumer to guess which combinations are real.

## Pagination, filtering, partial updates

Paginate every list endpoint from the start. Adding it later is a breaking
change, and the first user with 500 rows is not a hypothetical.

```
GET /api/reports?page=1&pageSize=20&sortBy=createdAt&sortOrder=desc

{ "data": [...], "pagination": { "page": 1, "pageSize": 20, "totalItems": 142, "totalPages": 8 } }
```

Cursor pagination is better for large or frequently-changing collections —
offset pagination skips and duplicates rows when the underlying set shifts
between pages. Say which one the contract uses; do not leave it implied.

Cap `pageSize` server-side. An uncapped page size is a denial-of-service
parameter, and the frontend cannot enforce the cap.

Use `PATCH` with partial bodies for updates. `PUT` forces clients to send the
whole object, which loses concurrent edits to fields they never touched.

## Idempotency

Any state-changing request that can be retried needs an idempotency key, and
accepting the header is only half of it — a key the server accepts but handles
carelessly is worse than none, because the client now believes retrying is
safe.

**Derive the key from the intent, not the attempt:**

```ts
crypto.randomUUID()              // wrong — new key per attempt, every retry is a new effect
`${userId}:${amount}`            // wrong — two legitimate identical charges collapse into one
`${orderId}:${Date.now()}`       // wrong — a timestamp is randomUUID() in disguise
`charge:v1:${orderId}`           // right — derived from an immutable identifier
```

The client generates the key once and reuses it across retries of that one
intent. It must never be regenerated by the layer doing the retrying.

For the backend contract, specify: the key is claimed **atomically** via a
unique constraint (a `SELECT` then `INSERT` is a race, not a guard); a reused
key with a different payload fails loudly rather than replaying the first
response; the in-flight duplicate response is a deliberate choice (409, bounded
wait, or 202 with a status URL); and key retention outlives the longest path
that can re-deliver the request, including dead-letter replay.

Every call has three outcomes, not two: success, failure, and **unknown**. A
timeout says nothing about whether the effect applied. Where that matters,
record the intent before calling out.

## Retries, timeouts, cancellation

- **Set a timeout on every request.** A fetch with no timeout hangs until the
  browser gives up, and the UI has no way to recover.
- **Retry only idempotent requests** — GET, HEAD, and writes carrying an
  idempotency key. Never blind-retry a POST.
- **Retry only transient failures**: network errors, 429, 502, 503, 504. Never
  retry a 4xx; the request will fail identically.
- **Exponential backoff with jitter**, and honor `Retry-After`. Synchronized
  retries from many clients turn a degraded backend into a down one.
- **Cancel on unmount** with `AbortSignal`, so a navigation away does not
  resolve into a component that no longer exists.

## Server-side fetching

In an SSR topology, prefer fetching in server components and route handlers.
The benefits are structural: credentials stay on the server, the request does
not depend on the user's network, and the client bundle shrinks.

Two correctness traps:

- **Caching a personalized response.** A response that varies by user must not
  be cached at a shared layer. Marking a route dynamic is a security decision,
  not a performance one — a cached authenticated page served to another user is
  a data breach, and it is the highest-consequence mistake in this entire
  reference.
- **A server-side fetch of a user-supplied URL is SSRF.** Webhooks, "import
  from URL", link previews, and image proxies all qualify. Allowlist the scheme
  and host, reject any resolved private or reserved IP, and forbid redirects.
  The cloud metadata endpoint at `169.254.169.254` is the standard target.

## Writing the backend contract

The deliverable that lets someone implement the server without asking
questions. One block per endpoint:

```
POST /api/v1/reports
Auth:     required — Clerk session JWT, Bearer
Entitle:  feature `advanced_export`; 403 PLAN_REQUIRED if absent
Request:  { title: string (1..200), description?: string (max 2000),
            format: "csv" | "json" }
Response: 201 { id, title, description, format, createdAt, ownerId }
Errors:   401 unauthenticated
          403 FORBIDDEN | PLAN_REQUIRED
          422 VALIDATION_ERROR + details (field -> message)
          429 rate limited, Retry-After
Backend must:
  - verify the JWT (signature, alg, exp/nbf, azp) before anything else
  - take ownerId from the `sub` claim, never from the body
  - re-validate every field; the client schema is not a control
  - cap `pageSize` on the matching list endpoint at 100
  - rate-limit to N/min per user
  - never return another user's report, and return 404 (not 403) for one
```

Three things to state for every endpoint, because they are the ones that get
assumed: **who may call it**, **what the server must re-check regardless of the
client**, and **what the failure looks like**. If any is missing, the backend
implementer will invent it, and the invention will not match the frontend.
