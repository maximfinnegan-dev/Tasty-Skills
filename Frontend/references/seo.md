# SEO and crawlability

The markup and endpoints that determine whether a page is indexed, previewed,
and understood correctly by search engines, social platforms, and AI crawlers.
This is frontend output, not a design decision and not a backend one — it
belongs here.

**Contents**
- [Renderability first](#renderability-first)
- [Per-page head tags](#per-page-head-tags)
- [Structured data](#structured-data)
- [Site-level files](#site-level-files)
- [Crawler access](#crawler-access)
- [Review checklist](#review-checklist)

---

## Renderability first

Every item below is inert if the crawler cannot see it. Before touching tags,
confirm the page's primary content is present in the server-rendered or
static HTML — not injected client-side after hydration. See the topology
table and the trust boundary discussion in the main skill body: a topology-A
static export with a client-only shell has empty view-source, and no meta tag
fixes that. If the page needs to be indexed, its content and its `<head>` must
both come from the server or the static build, not from a client render.

## Per-page head tags

Set these per route, not once globally — a single global title or description
is a common failure that makes every page look identical to a crawler.

| Tag | Purpose | Failure mode to avoid |
|---|---|---|
| `<title>` | Primary ranking and SERP signal | Same title on every route |
| `<meta name="description">` | SERP snippet | Missing, truncated, or duplicated across routes |
| Exactly one `<h1>` | Page topic signal, also an accessibility landmark | Zero H1s, or several competing H1s on one page |
| `<meta property="og:image">` + `og:title` + `og:description` | Social and chat-app link previews | Missing `og:image` — the page renders as a bare link everywhere it's shared |
| `<link rel="canonical">` | Tells crawlers which URL is authoritative when content is reachable by more than one | Missing on paginated, filtered, or parameterized routes, causing duplicate-content dilution |
| `<html lang="...">` | Language identification for crawlers, screen readers, and translation tools | Missing, or hardcoded to one language in a multi-locale app |
| `alt` on every meaningful image | Image search indexing, plus accessibility | Empty or filename-derived alt text (`img_2847.jpg`) |

Generate these from route metadata (Next.js `generateMetadata`, a per-page
frontmatter field, or equivalent) rather than hand-writing each page — the
failure mode above is almost always a templating gap, not a one-off mistake.

## Structured data

Add JSON-LD (`<script type="application/ld+json">`) for content types search
engines have a defined schema for: articles, products, FAQs, breadcrumbs,
organizations, events. This is what earns rich results — star ratings, price,
breadcrumbs — in the SERP rather than a plain blue link.

- Match the schema to the actual visible content; structured data describing
  something not shown on the page is a policy violation, not just unhelpful.
- Validate with the schema's official test tool before shipping, not by
  reading the JSON and assuming it is correct.

## Site-level files

Both live at the domain root, generated once and kept current as routes
change — not written by hand per deploy.

- **`sitemap.xml`** — every indexable URL, with `lastmod` kept accurate.
  Frameworks with file-based routing can generate this from the route tree
  (Next.js `sitemap.ts` or equivalent); prefer that over a hand-maintained list
  that drifts.
- **`robots.txt`** — controls which crawlers may fetch which paths. Disallow
  routes that should not be indexed (admin, internal tooling, draft content),
  and point `Sitemap:` at the generated sitemap.

## Crawler access

Search and AI crawlers are a broader set than "Googlebot," and blocking or
allowing them is a product decision, not a default to accept unexamined:

- **`robots.txt` disallow rules block AI crawlers by name** if a project wants
  to opt out of having content used for AI training or retrieval (`GPTBot`,
  `ClaudeBot`, `Google-Extended`, and similar user-agent tokens). Ask which the
  project wants blocked rather than assuming either "block everything" or
  "block nothing" — this is a business decision, not a technical default.
- **`llms.txt`** at the domain root is an emerging convention offering a
  curated, plain-language map of the site for LLM-based tools to read instead
  of crawling the whole thing. Add it when the project wants to be legible to
  AI assistants and answer engines; it is additive to `robots.txt` and
  `sitemap.xml`, not a replacement for either.

## Review checklist

- [ ] Primary content and head tags present in server-rendered or static HTML,
      not only after client-side hydration
- [ ] Unique `<title>` and `<meta description>` per route, generated from route
      metadata rather than hand-duplicated
- [ ] Exactly one `<h1>` per page
- [ ] `og:image`, `og:title`, `og:description` set per route
- [ ] `<link rel="canonical">` set wherever a URL is reachable more than one way
- [ ] `<html lang>` correct, including per-locale in a multi-language app
- [ ] Every meaningful image has descriptive `alt`; decorative images have
      empty `alt=""`
- [ ] Structured data present for eligible content types, and validated
- [ ] `sitemap.xml` generated from the route tree and current
- [ ] `robots.txt` present, correct on what it disallows, and pointing at the
      sitemap
- [ ] A stated decision on which AI crawlers are allowed or blocked, not a
      default left unexamined
- [ ] `llms.txt` added if the project wants to be legible to AI tools
