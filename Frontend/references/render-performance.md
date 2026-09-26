# Render performance

Bundle size, asset delivery, render efficiency, and the network — the four
places a React app loses speed. Measure before optimizing: memoization has a
cost, and applied everywhere it is usually a net loss in both performance and
readability. An optimization not verified against a number, before and after,
is a guess.

**Contents**
- [The metrics that matter](#the-metrics-that-matter)
- [Rendering strategy](#rendering-strategy)
- [Bundle size](#bundle-size)
- [Images and fonts](#images-and-fonts)
- [Component and state architecture](#component-and-state-architecture)
- [Memoization](#memoization)
- [Long lists and high-frequency updates](#long-lists-and-high-frequency-updates)
- [Profiling](#profiling)

---

## The metrics that matter

Hold these against the budgets in the skill body (LCP ≤ 2.5s, INP ≤ 200ms,
CLS ≤ 0.1, initial JS < 200KB gzipped):

| Metric | What it measures | What moves it |
|---|---|---|
| **LCP** | How soon the largest above-the-fold element paints | Render-blocking resources, data-fetch waterfalls, unoptimized hero assets |
| **CLS** | Visual stability | Un-dimensioned media, content injected above existing content, web fonts swapping in without a reservation |
| **INP** | Responsiveness to interaction | Long main-thread tasks, expensive re-renders on input |
| **TTI / FCP** | How soon the app is visible and usable | Bundle size, hydration cost |

Five causes account for most slow React apps: a bundle carrying unnecessary or
un-split code; unoptimized media and fonts; excessive or cascading re-renders;
state placed higher in the tree than it needs to be; and sequential,
uncached network requests. The sections below map to these in order.

---

## Rendering strategy

Pick per route, not once for the whole app — a router lets each part use the
strategy that fits it.

| Strategy | When it renders | Fits | Costs |
|---|---|---|---|
| **SPA** | Once; client updates from there | Interactive dashboards, internal tools | Slow first load, large initial bundle |
| **SSR** | Per request, on the server, then hydrates | Personalized or dynamic feeds | Server overhead, streaming SSR setup complexity |
| **SSG** | At build time | Marketing pages, docs, blogs | Needs a rebuild or revalidation to update content |
| **RSC** | Server-only and interactive components in one tree | Content-rich apps that want minimal client JS | Requires framework support and the server/client boundary discipline in `nextjs-runtime.md` |

In an App Router project this is the same server/client boundary decision
`nextjs-runtime.md` covers for trust reasons — here the concern is bundle
weight, not exposure. Keep `"use client"` at the leaves; a client boundary
placed at the top of a page pulls the whole subtree into the client bundle
whether or not most of it needs to be interactive.

---

## Bundle size

**Find what's actually shipping before cutting anything.** Run the bundle
analyzer for the build tool in use (`webpack-bundle-analyzer`,
`vite-bundle-analyzer`, `rollup-plugin-visualizer`) and `npx depcheck` to find
dependencies that are installed but unused. Cutting blind produces marginal
wins; cutting from a flame graph produces the real ones.

- **Production mode in the build config** — `minify: true`, `cssMinify:
  true`. A dev build is not representative of anything a user will load.
- **Compression at the server or CDN** — Gzip or Brotli on every text
  response. This is a deploy-config check, not a code change; confirm it
  against the actual response headers, the same way `security.md` checks CSP.
- **Route-based code splitting** through the router, so a user loading one
  page does not pay for every page's JS.
- **Component-level lazy loading** for anything heavy and not immediately
  needed — a chart, a rich-text editor, a media player:

```tsx
import { lazy, Suspense } from 'react';

const HeavyChart = lazy(() => import('@/components/HeavyChart'));

function Dashboard() {
  return (
    <Suspense fallback={<ChartSkeleton />}>
      <HeavyChart />
    </Suspense>
  );
}
```

  Give the fallback the same dimensions as the real content — an empty
  `<div>Loading...</div>` is how a lazy-loaded chart becomes a CLS regression.

- **Preload what the first paint needs**: `<link rel="preload">` for critical
  CSS, core fonts, and the initial route's script, in the document head.
- **Preload the next route on intent** — most routers support preloading on
  hover or focus (e.g. `defaultPreload: 'intent'`) — so navigation feels
  instantaneous instead of triggering a fresh waterfall.

---

## Images and fonts

Images are usually the single largest contributor to a poor LCP.

- **Offload to a CDN** (Cloudflare, Cloudinary, or the framework's own image
  pipeline) rather than serving originals from the app server. A CDN converts
  to modern formats (WebP, AVIF) and serves from an edge node close to the
  user — both are wins a hand-rolled pipeline rarely matches.
- **`fetchPriority="high"`** on the one or two images that are actually
  above the fold — a hero image, a product shot. Marking everything high
  priority defeats the point.
- **`loading="lazy"`** on everything below the fold.

```tsx
<img src="https://cdn.example.com/hero-banner.webp" fetchPriority="high" alt="Hero Banner" />

<img
  src={movie.posterPath ? `https://image.tmdb.org/t/p/w500${movie.posterPath}` : "/placeholder.svg"}
  loading="lazy"
  alt={movie.title}
/>
```

- **Reserve dimensions** — explicit `width`/`height` or a CSS `aspect-ratio`
  on every media container — so the layout does not jump when the asset
  arrives. This is the single most common cause of a CLS regression.
- **`font-display: swap`**, or self-hosted `WOFF2`, so a downloading web font
  does not cause a reflow when it finishes loading.

---

## Component and state architecture

The largest performance wins are usually structural, not memoization. Fix the
shape of the tree before reaching for `memo`.

- **Keep state local.** Transient state — hover, an open/closed flag, a form
  field's current value — belongs in the component that owns it. Lifting it
  higher makes every component between it and the root re-render on every
  keystroke.
- **Split large components.** A component with several unrelated concerns
  re-renders all of them together on any single state change; breaking it up
  means a state update only re-renders the node that actually consumes it.
- **Use `Fragment`** (`<>...</>`) to group children without an extra DOM node
  — irrelevant to render cost directly, but it keeps the tree shallow enough
  that later measurements stay legible.
- **Separate server-cache state from client state.** Use TanStack Query, SWR,
  or the framework's server-fetch layer for anything that comes from the
  network. Hand-rolled `useEffect` fetching misses deduplication and
  background revalidation and tends to over-render on every refetch.
- **Prefer granular state libraries for shared state** (Zustand, Jotai, and
  similar) over one large context or monolithic store. A subscription to one
  slice of state should not re-render a component that only reads a
  different slice.
- **Never declare a helper function inside a component body** if it does not
  close over props or state. A function defined inside the component is
  recreated every render, which both costs allocation and invalidates any
  `useCallback`/`useMemo` downstream that depends on referential stability.

```tsx
// Recreated on every render of MovieDetails
function MovieDetails({ runtimeMinutes }) {
  const formatRuntime = (mins: number) => `${Math.floor(mins / 60)}h ${mins % 60}m`;
  return <div>{formatRuntime(runtimeMinutes)}</div>;
}

// Defined once, outside render
const formatRuntime = (mins: number): string => {
  const hours = Math.floor(mins / 60);
  return `${hours}h ${mins % 60}m`;
};
function MovieDetails({ runtimeMinutes }) {
  return <div>{formatRuntime(runtimeMinutes)}</div>;
}
```

---

## Memoization

Reach for these only once profiling shows a real cost, and only in this
order — structural fixes first, then targeted memoization.

- **`useMemo`** for genuinely expensive computation: sorting or filtering a
  large collection, parsing, heavy derivation. Copy before sorting —
  `Array.prototype.sort` mutates in place, and sorting the original reference
  is a common source of a bug that only shows up under `StrictMode`.
- **`useCallback`** for a function passed to a memoized child or used as an
  effect dependency. Anywhere else it adds overhead for no benefit.
- **`React.memo`** for a component that re-renders often with unchanged
  props and is expensive to render. It is a performance optimization, not a
  correctness guarantee: a memoized component still re-renders when its own
  state changes or when a context it consumes changes, and it does nothing
  if a parent passes a new object, array, or inline function literal every
  render, because `memo`'s default comparison is shallow (`Object.is` per
  prop).

```tsx
// Breaks Profile's memo: a new object every render
function Page() {
  const [name, setName] = useState('Taylor');
  const [age, setAge] = useState(42);
  return <Profile person={{ name, age }} />;
}

// Stabilized
function Page() {
  const [name, setName] = useState('Taylor');
  const [age, setAge] = useState(42);
  const person = useMemo(() => ({ name, age }), [name, age]);
  return <Profile person={person} />;
}

const Profile = memo(function Profile({ person }: { person: { name: string; age: number } }) {
  return <div>{person.name}, {person.age}</div>;
});
```

Passing primitives instead of an object sidesteps the problem entirely where
the shape allows it. Where a container just wraps other elements, accept
`children` as JSX rather than a render prop — when the container's own state
changes, React sees that `children` itself did not change and skips
re-rendering the subtree passed into it.

**Custom `arePropsEqual`** is the last resort, when stabilizing props in the
parent is not possible:

```tsx
const Chart = memo(function Chart({ dataPoints }: { dataPoints: Array<{ x: number; y: number }> }) {
  // render
}, arePropsEqual);

function arePropsEqual(oldProps, newProps) {
  return (
    oldProps.dataPoints.length === newProps.dataPoints.length &&
    oldProps.dataPoints.every((pt, i) => pt.x === newProps.dataPoints[i].x && pt.y === newProps.dataPoints[i].y)
  );
}
```

Compare every prop, including callbacks — skipping a function prop like
`onClick` lets a stale closure bind inside the memoized component. Avoid deep
equality on objects of unknown depth; an unbounded comparison can cost more
than the render it was meant to prevent.

**If the project has the React Compiler enabled** (via its Babel plugin),
manual `memo`/`useMemo`/`useCallback` are largely redundant — the compiler
analyzes the component against the Rules of React and inserts granular
memoization at build time. Check for it before adding manual memoization;
adding both is not wrong, but it is dead weight the compiler already covers.
Confirm the version and setup against current docs rather than assuming it is
on, per the verification procedure in the skill body.

---

## Long lists and high-frequency updates

Standard rendering hits real limits with large lists or continuous data.

- **Virtualize past a few hundred rows.** Use an established virtualizer
  (`react-window`, `@tanstack/react-virtual`, or a specialized grid like AG
  Grid or MUI DataGrid) rather than hand-rolling windowing — variable-height
  rows, scroll restoration, and keyboard navigation are exactly the edge
  cases hand-rolled versions get wrong. `content-visibility: auto` is a
  lighter CSS-only alternative for simpler cases.

```tsx
import { useVirtualizer } from "@tanstack/react-virtual"

const virtualizer = useVirtualizer({
  count: items.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 100,
  overscan: 5,
})
```

  A virtualized list only mounts visible rows, which means assistive
  technology only sees those rows too — set `aria-setsize` and
  `aria-posinset` on each item so position is still announced correctly. See
  `states-and-a11y.md` in `frontend-design` for the rest of the accessible
  pattern.

- **Batch high-frequency updates** rather than rendering on every tick.
  RxJS's `auditTime`, `sampleTime`, and `bufferTime` fit a streaming data
  source; a `useDebounce` hook at 200–300ms fits a search input.
- **Normalize collections into a `Map` keyed by ID** rather than scanning a
  flat array for O(1) lookups, and prefer native `Map`/`Set` over plain
  objects for collections with frequent additions and removals.
- **Structural sharing for very large immutable sets** — past roughly
  100,000 items, a library like Immutable.js speeds up clone and equality
  checks. Never call `.toJS()` during a render cycle; it defeats the
  structural sharing that made the library worth adding.
- **Drop out of the DOM entirely for the heaviest cases.** WebGL or Canvas
  (Three.js, PixiJS) for complex graphics or visual data streams; a Web
  Worker for CPU-heavy work like sorting, parsing, or image manipulation, so
  it does not block the main thread; a non-React grid with transaction-based
  updates (AG Grid and similar) when the update rate is thousands of cell
  changes per second and synthetic-DOM diffing itself is the bottleneck.

---

## Profiling

Optimize from measurements, not assumptions, and re-measure after.

| Tool | Use it for |
|---|---|
| Chrome DevTools Performance panel | Timeline of scripting, rendering, paint, and long main-thread tasks |
| React DevTools Profiler | Per-component render time as a flamegraph; shows compiler-memoized components |
| React's Performance Tracks (Chrome DevTools) | Component time split into blocking, transition, suspense, and idle phases |
| Lighthouse / PageSpeed Insights | Baseline LCP, CLS, TTI against web standards |
| React Scan / "why did you render" style tools | Flags unnecessary re-renders during local development |
| Sentry or another APM | Real-user monitoring — production latency and trend, not synthetic |

```bash
npx lhci autorun          # Lighthouse CI
npx bundlesize             # bundle budget in CI
```

Three rules that keep a profile representative:

1. **Profile a production build.** Development builds carry extra checks and
   warnings that skew every timing number.
2. **Throttle CPU and network** in DevTools to something like a mid-range
   phone on 3G/4G rather than the machine doing the profiling.
3. **Fix the top of the flamegraph first.** A long bar near the root usually
   dominates total render time more than several short bars in a leaf
   subtree — optimizing leaves before the root that renders them is
   time spent on the wrong node.
