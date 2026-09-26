# Motion system

The values, rules, and decision tables every animation depends on. Read this
before any motion work; read `motion-patterns.md` when building a specific
animated component.

**Contents:** [Rules](#rules) · [Tokens and springs](#tokens-and-springs) ·
[Reduced motion and device gating](#reduced-motion-and-device-gating) ·
[SSR safety](#ssr-safety) · [Choosing the right API](#choosing-the-right-api) ·
[AnimatePresence mode](#animatepresence-mode) · [Restraint](#restraint) ·
[Mobile and touch](#mobile-and-touch) · [Debugging](#debugging) ·
[Anti-patterns](#anti-patterns)

For browser-native motion capabilities that sit alongside Motion — View
Transitions, scroll-driven CSS animation, and the rest — see
`references56/platform-motion.md`. Everything below still governs anything built
with those tools.

---

## Rules

Non-negotiable. Every pattern follows these.

1. **Import from `motion/react` only.** `framer-motion` is the old package name
   for the same library; both work, but never both in one tree — they run
   separate schedulers, and `AnimatePresence` in one will not coordinate exits
   with components from the other. If the project already depends on
   `framer-motion`, keep that import path consistently rather than migrating
   mid-task.
2. **`initial` must match server output exactly.** If the server renders
   `opacity: 1`, `initial` says `opacity: 1`, or hydration mismatches. See
   [SSR safety](#ssr-safety).
3. **Reduced motion overrides everything.** When `useReducedMotion()` is true,
   disable transforms; an opacity fade at 0.2s or less is the only permitted
   fallback. This outranks device tier and design preference.
4. **Never animate layout properties.** `width`, `height`, `top`, `left`,
   `margin`, `padding` recalculate layout every frame. Animate `transform`
   (`x`, `y`, `scale`) and `opacity` — both run on the compositor.
5. **Every value comes from the token set.** No inline `duration: 0.3` or
   `{ stiffness: 300, damping: 30 }` in component files. Centralizing them is
   what makes a motion system tunable in one place instead of forty.
6. **`"use client"` on every file importing `motion/react`.** Server Components
   cannot run the browser APIs Motion depends on.
7. **Never read `window` or `navigator` at module scope.** Both are absent
   during server rendering; guard with `typeof window !== "undefined"`.
8. **Wrap every conditional render in `AnimatePresence`, key its direct child,
   and give that child an `exit`.** Miss any one of the three and the exit
   animation silently does not fire — no error, the element just vanishes.
9. **Never drive continuous input values through React state.** Mouse
   position, scroll progress, drag offset, pointer physics — use
   `useMotionValue` / `useTransform` / `useScroll`. `useState` re-renders the
   tree on every frame and collapses on mobile.
10. **Never attach a raw `scroll` listener.** `window.addEventListener("scroll",
    ...)` fires unbatched on every frame. Use `useScroll`,
    `IntersectionObserver`, or CSS `animation-timeline: view()`.
11. **Infinite animations pause when the tab is hidden.** Guard loops with
    `document.visibilityState`, or a background tab burns GPU for nothing.
12. **Every effect that adds a listener removes it** in the same effect's
    cleanup, and every animation control stops on unmount.

---

## Tokens and springs

`assets/motion-tokens.ts` is a drop-in version of the block below, and
`assets/use-safe-motion.tsx` is the reduced-motion hook it pairs with. Where
the project's design system already defines durations or easings, map onto
those rather than introducing a parallel set — a component whose CSS
transitions and Motion transitions disagree by 100ms reads as broken even when
neither value is wrong alone.

```ts
// lib/motion-tokens.ts
export const motionTokens = {
  duration: {
    instant: 0.08, // tooltip show/hide, focus ring, badge update
    fast:    0.18, // button feedback, icon swap, chip toggle
    normal:  0.35, // modal open, card expand, element enter
    slow:    0.6,  // hero entrance, full-page transition
    crawl:   1.0,  // deliberate storytelling; use sparingly
  },
  easing: {
    smooth: [0.22, 1, 0.36, 1],    // default enter/exit
    sharp:  [0.4, 0, 0.2, 1],      // quick UI feedback
    bounce: [0.34, 1.56, 0.64, 1], // playful overshoot
    linear: [0, 0, 1, 1],          // progress bars, marquees
  },
  distance: { xs: 4, sm: 8, md: 16, lg: 24, xl: 48 },
  scale:    { subtle: 0.98, press: 0.95, pop: 1.04 },
}

export const springs = {
  snappy:  { type: "spring", stiffness: 300, damping: 30 }, // default UI
  gentle:  { type: "spring", stiffness: 120, damping: 14 }, // cards, modals, panels
  bouncy:  { type: "spring", stiffness: 400, damping: 10 }, // playful moments
  instant: { type: "spring", stiffness: 600, damping: 35 }, // tooltips, popovers
  release: { type: "spring", stiffness: 200, damping: 20, restDelta: 0.001 }, // drag release
}
```

**Choosing a duration.** `instant` and `fast` for feedback the user caused
directly — tap, hover, toggle. `normal` for content entering or leaving.
`slow` and `crawl` only for one-time entrances that set a scene, never for
anything repeated or in a hot path.

**Spring or duration?** Use a spring when the motion should feel like it has
weight: drag release, a card landing, a button press. Use a fixed duration when
it must land at a predictable time — a page transition synced to a route
change, a progress bar tied to real progress.

---

## Reduced motion and device gating

Priority order, highest first: `prefers-reduced-motion` > low-end device >
design preference. Decorative motion is the first thing a low-end check turns
off; motion communicating real state — a loading indicator, a save confirmation
— counts as essential and stays on, just shortened.

```ts
// lib/motion-config.ts
export const motionConfig = {
  isLowEnd() {
    if (typeof navigator === "undefined") return false
    const nav = navigator as Navigator & { deviceMemory?: number }
    if (nav.deviceMemory !== undefined) return nav.deviceMemory <= 2
    return navigator.hardwareConcurrency <= 4
  },

  prefersReduced() {
    return (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
  },

  shouldAnimate({ essential = false } = {}) {
    if (this.prefersReduced()) return false
    if (!essential && this.isLowEnd()) return false
    return true
  },
}
```

`deviceMemory` exists only on Chromium, which is why the fallback to core count
covers Safari and Firefox on weak hardware.

```tsx
// hooks/use-safe-motion.tsx
"use client"
import { useReducedMotion } from "motion/react"

export function useSafeMotion(fullY: number = 16) {
  const reduce = useReducedMotion()
  return {
    initial: { opacity: 0, y: reduce ? 0 : fullY },
    animate: { opacity: 1, y: 0 },
    exit:    { opacity: 0, y: reduce ? 0 : -fullY },
  }
}
```

For CSS transitions outside Motion:

```css
@media (prefers-reduced-motion: reduce) {
  .motion-safe-transition  { transition: opacity 0.15s; }
  .motion-reduce-transform { transform: none !important; }
}
```

Verify by toggling the OS setting, not by reading the code. Infinite loops,
parallax, scroll hijacking, and pointer physics must all collapse to static.

---

## SSR safety

The only rule that matters: **`initial` must equal what the server actually
rendered.** A component that always renders `opacity: 0` on the server and
animates to `1` is safe. A component whose initial state depends on client-only
data is not, and needs a mount guard:

```tsx
"use client"
const [mounted, setMounted] = useState(false)
useEffect(() => setMounted(true), [])

<motion.div initial={{ opacity: mounted ? 0 : 1 }} animate={{ opacity: 1 }} />
```

Keep motion isolated in client leaf components. A Server Component renders the
static layout; the animated piece inside it is a small `"use client"` island.
For `staggerChildren`, the parent holding `variants` and its children must be
in the same client tree.

---

## Choosing the right API

| Situation | Use |
|---|---|
| Hover feedback | `whileHover` — desktop only, always paired with `whileTap` |
| Tap / press feedback | `whileTap` |
| Element appears or disappears | `AnimatePresence` + `key` + `exit` |
| List loading in sequence | `variants` + `staggerChildren` |
| Navigating between routes | Page-transition wrapper, `mode="wait"` |
| Element resizes in place, few children | `layout` prop |
| Element resizes, many children or deep DOM | Explicit `x`/`y`/`scale` — `layout` re-measures the whole subtree every frame |
| Same element across two contexts | `layoutId`, unique per mounted instance |
| Reveal on scroll | `whileInView` + `viewport={{ once: true }}` |
| Value tied to scroll position | `useScroll` + `useTransform` |
| Drag with physics on release | `drag` + `dragTransition: springs.release` |
| Value derived from another without re-rendering | `useMotionValue` + `useTransform` |
| Multi-step imperative sequence | `useAnimate` |

**`useSpring` vs a spring `transition`.** `useSpring` drives a value
continuously — cursor followers, pointer-tracked positions — and picks up
smoothly from current velocity when interrupted. A spring `transition` fires on
discrete state changes. Use `useSpring` only for live input tracking.

**Do not wrap static content in `layout` "for safety".** It costs measurement
work on every frame for nothing.

---

## AnimatePresence mode

Always set `mode` explicitly. The default, `"sync"`, runs enter and exit
simultaneously, which overlaps content in most UI — rarely what you want even
when it happens to look acceptable.

| `mode` | Use for |
|---|---|
| `"wait"` | Modals, sequential toasts, page transitions — exit finishes before enter starts |
| `"sync"` | Only when overlap is the point, such as a crossfade carousel |
| `"popLayout"` | Lists, tabs, dismissible cards — the exiting item leaves layout flow immediately so siblings reflow to fill the gap rather than animating around a ghost |

---

## Restraint

The common failure is not a broken animation. It is too many correct ones.

- **One motion language per surface.** Do not mix a bouncy spring on the modal
  with a linear ease on its buttons. Pick a feel and let everything on that
  surface share it.
- **Most UI feedback wants `fast` (0.18s), not `normal`.** A control reacting
  to a click should feel closer to instant than to an entrance.
- **Stagger small groups only.** Ten items at 0.08s each adds nearly a second
  before the last lands. Cap staggered groups around five or six visible items,
  or drop the stagger and let the rest arrive together.
- **A decorative loop needs a reason.** If it does not communicate progress or
  status, it competes with the content.
- **Do not layer motion on motion.** A cursor follower or particle field over
  an already-animated interface subtracts from it. If asked for one anyway,
  isolate it from interactive elements so it never masks their feedback.
- **Every animation is justifiable in one sentence** — it guides attention,
  communicates state, or preserves continuity. If you cannot say which, remove
  it and see whether anything got worse.

---

## Mobile and touch

The API does not change on mobile. What changes is which inputs exist and what
the platform already promises the user.

**Hover has no touch equivalent.** `whileHover` never fires from a tap. Never
make it the only feedback a control gives:

```tsx
// Wrong for a touch target — nothing happens on tap
<motion.button whileHover={{ scale: 1.02 }} />

// Correct — whileTap covers touch, whileHover is the desktop bonus
<motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} />
```

If a design depends on hover-revealed content, give it a tap-triggered path
rather than leaving it unreachable.

**Touch targets** at 44×44px minimum in hit area — pad an invisible area around
a small icon rather than growing the icon.

**Drag versus native scroll.** A `drag="y"` element inside a scrolling page
fights the page's own gesture. Set `touch-action` to the axis Motion is not
using (`style={{ touchAction: "pan-y" }}` for a horizontal drag), or — more
reliably for bottom sheets — mount the draggable outside the scroll container
entirely via a portal.

**Safe areas.** Anything fixed to the bottom sits under the home indicator or
gesture bar unless it accounts for the inset:

```css
.bottom-sheet { padding-bottom: max(1rem, env(safe-area-inset-bottom)); }
```

**Viewport height.** `100vh` includes space the address bar can occupy, so a
full-height sheet visibly resizes mid-animation. Use `100dvh`.

**Performance budget.** Mobile GPUs are weaker, so `isLowEnd()` is far more
likely to be true on a phone — design for that path actually being seen. Avoid
stacking more than one or two simultaneous transform animations on the same
element; each additional animated property compounds paint cost in a way that
is nearly invisible on a desktop GPU during testing.

**Test gestures on a real device.** Touch threshold, scroll interference, and
safe-area rendering are exactly the three things device emulation does not
reproduce faithfully.

---

## Debugging

**An exit animation does not fire.** The most common Motion bug, and it fails
silently. Check in order: is the conditional wrapped in `AnimatePresence` at
all; does the direct child have a stable `key`; does that child define `exit`.
All three must be true at once.

**A hydration warning appears.** Almost always `initial` not matching server
output. Then check for `window` or `navigator` at module scope, then for a
missing `"use client"`.

**Janky or dropped frames.** A layout property snuck into an `animate` call.

**`layout` feels slow on a large container.** It re-measures the whole subtree
every frame; past about five children or deep nesting, switch to explicit
transforms.

**Enter and exit overlap when they should not.** `AnimatePresence` defaulted to
`"sync"`. Set `mode="wait"`.

**Text reflows during a container resize.** Add `layout="position"` to the text
element so it tracks the container without re-animating its own content.

**An SVG path snaps instead of morphing.** The two `d` values have different
command counts. Normalize them first.

**A swipe misfires on a fast short flick.** Gate on both `offset` and
`velocity`; velocity alone misreads a flick as a full swipe.

**`useAnimate` throws on call.** The scope ref is not attached to a mounted
element. Only call `animate()` from an effect or an event handler, never during
render.

---

## Anti-patterns

| Anti-pattern | Rule | Fix |
|---|---|---|
| `framer-motion` and `motion/react` imports in one tree | 1 | One import path project-wide |
| `initial={{ opacity: 0 }}` on a component whose SSR output is visible | 2 | Mount guard |
| Skipping the `useReducedMotion` check | 3 | `useSafeMotion` |
| `animate={{ width: "100%" }}` | 4 | Animate `scaleX` |
| `transition={{ duration: 0.4 }}` inline | 5 | `motionTokens.duration.normal` |
| Missing `"use client"` | 6 | Add it at the top of the file |
| `navigator.hardwareConcurrency` at module level | 7 | `typeof navigator !== "undefined"` guard |
| `AnimatePresence` child with no `key` or no `exit` | 8 | Add both; it fails silently otherwise |
| `useState` tracking mouse or scroll position | 9 | `useMotionValue` + `useTransform` |
| `window.addEventListener("scroll", ...)` | 10 | `useScroll` / `IntersectionObserver` / CSS scroll timeline |
| `repeat: Infinity` with no visibility guard | 11 | Stop on `visibilitychange` |
| Listener added without cleanup | 12 | Return the matching removal |
| `const x = new MotionValue(0)` in render | — | `const x = useMotionValue(0)` |
| SVG morph between paths with different command counts | — | Normalize commands first |
