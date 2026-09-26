---
name: frontend-design
description: >-
  React frontend design and Motion: visual direction, layout, typography,
  components, motion, interaction states, accessibility, and UI audits. Use
  when building or restyling an interface, adding interaction or animation,
  refining a design system, improving responsive or accessible UX, or auditing
  an existing UI.
compatibility: >-
  Targets Claude Opus 5, Claude Sonnet 5, GPT-5.6 Sol, and GPT-6 Astra.
  Pairs with the frontend skill when a task crosses a trust boundary.
metadata:
  version: "1.1.0"
---

# Frontend Design

One system for designing and building interfaces in React with Motion for React
(`motion/react`, formerly Framer Motion), and for auditing interfaces that
already exist.

A request to "improve" existing UI is an audit that ends in a build. Run the
audit first — you cannot fix what you have not diagnosed, and jumping straight
to restyling is how a coherent interface becomes an inconsistent one.

## Design system first

**This project has a design system. It is the source of truth for every visual
value.** Before choosing any color, size, spacing, radius, shadow, or duration,
find the existing tokens and use them.

1. Locate the token source — a theme file, `tailwind.config`, a CSS custom
   property block, a tokens package, or `AGENTS.md` pointing at one.
2. Build from those tokens. Never introduce a raw hex value, a raw pixel
   spacing, or an inline duration when a token exists for it.
3. If a needed value genuinely has no token, extend the scale in the same place
   the other tokens live and say that you added it. Do not scatter one-off
   values through components.

The reason this outranks taste: an interface reads as designed when its values
come from one small set, and reads as assembled when they come from forty. A
beautiful component built with off-system values makes the whole product worse.

When a project genuinely has no design system — a new repo, a prototype, a
Claude Design canvas — derive one first, before building anything. The
derivation method is in `references/design-direction.md`. Deriving a small
token set takes a few minutes and is what makes everything after it coherent.

## The build workflow

### 1. Read the brief

State a one-line design read before generating anything:

> Reading this as: `<what kind of surface>` for `<audience>`, with a `<vibe>`
> language, working within `<the project's design system>`.

This is not ceremony. Stating the read is what prevents silent drift into a
default aesthetic — skip it and the output regresses toward generic regardless
of the brief.

Read these signals to form it: what kind of surface this is (marketing page,
product screen, dashboard, form, portfolio); who uses it; vibe words the user
actually said; references they linked; and quiet constraints — accessibility-
critical audiences, regulated industries, trust-first commerce — which override
aesthetic preference entirely.

If the brief is genuinely ambiguous on an axis that changes the work, ask **one**
question, not a list. If you can infer it from the repo or the conversation,
infer it and say what you assumed.

### 2. Set the three dials

Every layout, motion, and density decision is gated by these. State the values
and the reasoning; do not silently use the baseline.

- **VARIANCE** 1-10 — 1 is perfect symmetry, 10 is deliberate asymmetry.
- **MOTION** 1-10 — 1 is static, 10 is choreographed.
- **DENSITY** 1-10 — 1 is airy, 10 is packed with data.

Baseline `7 / 5 / 4`. Shift from the design read: minimal/editorial briefs pull
variance and motion down; agency and creative work pushes them up; dashboards
and data tools push density up and variance down; accessibility-critical and
public-sector work pulls motion to 2-3.

Two dial rules that catch real failures:

- **Motion claimed is motion shown.** If MOTION is above 4, the interface must
  actually move — entry transitions, scroll reveals, real feedback on
  interaction. A static page claiming MOTION 7 is broken work. If you cannot
  ship working motion in the available scope, set the dial to 3 and ship a
  clean static interface. Half-built motion is worse than none.
- **Density drives layout primitives, not just spacing.** Above 7, generic card
  containers stop working; data needs to breathe in plain layout with rules and
  alignment instead of boxes.

### 3. Plan before coding

Write a short plan and check it against the brief before you write components:

- **Structure** — the section or screen sequence, and what each one's single
  job is.
- **Hierarchy** — what is loud, what is quiet. Most elements should be quiet.
- **Signature** — the one thing this interface will be remembered by. Every
  designed interface has one; spend your boldness there and keep everything
  around it disciplined.
- **Motion plan** — which elements move and what each movement communicates.

Then reread that plan and ask: is any part of this what I would produce for any
similar brief rather than a choice made for this one? Revise those parts and say
what changed. `references/ai-tells.md` names the specific defaults to check
against.

### 4. Build

Follow the plan. Read `references/react-architecture.md` for component and
state structure, `references/motion-system.md` before any animation, and
`references/states-and-a11y.md` while building anything interactive.

Build every state, not just the successful one. Loading, empty, error, and
disabled are part of the component, not a follow-up task. An interface that
only exists in its happy path is half-built.

### 5. Run the pre-flight check

Before reporting the work done, run the [pre-flight check](#pre-flight-check)
below. It is mechanical and it catches the failures that survive a careful
build.

## The audit workflow

Read `references/audit.md` and follow it. In outline:

1. **Discover** — read the interface, including the app shell and every page,
   not just the obvious component. Cross-page inconsistency only appears when
   you have seen everything.
2. **Evaluate** — walk all 15 usability principles deliberately. Check the
   hidden UI too: modals, dropdowns, drawers, toasts, tooltips, validation
   states, empty states, confirmation dialogs. These get the least design
   attention and hold the worst problems.
3. **Report** — group findings by severity (0-4), each naming the principle,
   the location, the concrete user impact, and the specific fix. Include a
   strengths section; a report that is only negative is less useful and tells
   the user nothing about what to leave alone.
4. **Implement** — establish the design foundation first, then apply fixes
   through it, then run a coherence pass across the whole interface.
5. **Re-review** — a focused second look at what you changed, for problems the
   fixes introduced. This reliably finds a few more.

Do not fabricate findings to look thorough, and do not inflate severity. Rate on
user impact, never on how easy the fix is.

## Non-negotiables

These hold in every mode, for every interface. They are short because the list
is short — everything else is judgment.

1. **Animate only `transform` and `opacity`.** `width`, `height`, `top`,
   `left`, `margin`, and `padding` trigger layout recalculation on every frame.
   Both `transform` and `opacity` are composited off the main thread and stay
   smooth under load.
2. **`prefers-reduced-motion` overrides everything.** When it is set, disable
   transforms; an opacity fade at 0.2s or less is the only permitted fallback.
   This outranks the dials, the device tier, and the design.
3. **Every interactive element has visible `:hover`, `:focus-visible`,
   `:active`, and `:disabled` states.** Never remove a focus ring without
   replacing it with something at least as visible.
4. **Body text meets WCAG AA contrast (4.5:1); UI components and large text
   meet 3:1.** Bold design is not a reason to ship unreadable text. Check
   button labels against button backgrounds, and placeholder and helper text
   against form backgrounds — these are the two that slip through.
5. **Touch targets are at least 44×44px in hit area**, padded rather than
   grown, and `whileHover`-only feedback always has a tap counterpart. Hover
   does not exist on touch.
6. **Semantic HTML.** Real `<button>`, `<nav>`, `<main>`, correct heading
   order. A `<div>` with an `onClick` is unreachable by keyboard and invisible
   to assistive technology.
7. **No values off the design system.** See [Design system
   first](#design-system-first).
8. **Build the product's own visual language, not a platform's.** Take
   practices, ergonomics, and accessibility guidelines from platform design
   systems freely; do not reproduce their appearance. No system typefaces or
   system icon sets as brand elements, no Material color roles, ripple, or
   FAB, no Cupertino grouped lists, toggles, or frosted system bars — unless
   the user explicitly asks for a native app on that platform. Honoring a
   platform *convention* is different and always correct: back means back,
   system text-size and reduced-motion settings are obeyed, reserved gestures
   and shortcuts are never overridden. `references/cross-platform.md` draws
   the line.
9. **`"use client"` on every file importing `motion/react`,** and never read
   `window` or `navigator` at module scope.

## Motion in brief

Full detail in `references/motion-system.md`; this is what you need before
opening it.

Motion must do one of three things or it should not exist: **guide attention**
toward what changed, **communicate state**, or **preserve spatial continuity**
so the user knows where something came from. Decorative motion with none of
these is the first thing to cut.

Responsiveness outranks smoothness. An animation that delays input is worse
than no animation, however good it looks.

Import from `motion/react`. If the project already depends on the older
`framer-motion` package, keep using that path consistently — never both in one
tree, since they run separate schedulers and `AnimatePresence` will not
coordinate exits across them.

Three failures account for most broken motion in review:

- An exit animation that never fires. `AnimatePresence` must wrap the
  conditional, its direct child must have a stable `key`, and that child must
  define `exit`. Miss any one and it fails silently.
- An inline `duration` or spring config in a component file. Values come from
  the motion token file (`assets/motion-tokens.ts` is a drop-in starting
  point, mapped onto the project's existing tokens where they overlap).
- An infinite animation with no visibility guard, burning GPU in a background
  tab.

## Autonomy boundary

Without being asked, you may: read any file; create and edit components,
styles, and token files; add motion; install a dependency the work genuinely
requires after checking `package.json`; and run non-destructive checks — build,
typecheck, lint, tests.

Ask before: changing route structure or URL slugs; renaming form fields,
section IDs, or nav labels that analytics may depend on; replacing an existing
design system or component library with a different one; deleting components
that appear used elsewhere; or restyling surfaces outside the ones the request
named.

On a redesign of something that already exists, information architecture, copy
voice, brand marks, and existing accessibility wins do not change silently.
Modernize the visual layer; propose anything structural.

## Working in Claude Design

Claude Design's canvas produces static `.dc.html` artboards, not a React app.
Everything about direction, hierarchy, typography, color, density, states, and
the AI-tells catalogue applies unchanged. What changes:

- There is no `motion/react`. Express motion intent as CSS transitions and
  keyframes, or as annotation on the artboard describing the intended behavior
  for whoever implements it.
- Design every state as its own artboard — the loading, empty, and error
  screens are the ones that get skipped and then get built badly.
- Token derivation still comes first. Put the palette, type scale, and spacing
  scale on the canvas as a visible foundation artboard so the rest of the
  design demonstrably comes from it.

## Repository map

Before changing code in a repository, read `AGENTS.md` at its root. It maps the
codebase and records the commands, conventions, and decisions for the project.
Read it before searching, then search within the area it points you to — this
replaces most of the exploratory globbing and grepping that would otherwise
open every task. For frontend work specifically, it is where the design system
location, the component conventions, and the build and check commands should
already be written down.

If it contradicts what you find in the code, the code is right. Fix the file as
part of your change and say what you corrected.

### Maintaining it

Update `AGENTS.md` whenever your change makes part of it wrong or incomplete:
a moved boundary, an added or removed directory, a changed command, a changed
convention, a deprecation, or a gotcha that would have saved you time. Edit only
the affected lines — do not restructure the file, and do not add anything an
agent could work out by reading the code.

### Creating it, if the repository has none

Explore before writing: read the build and test configuration, the CI config,
the entry points, and enough source to be accurate. Do not infer a directory's
purpose from its name.

Write it at the repository root (`./AGENTS.md`, committed to git — never in a
tool's config directory), covering: the map at directory level (what each area
is for and what deliberately does not belong in it, entry points, deprecated
areas, generated do-not-edit paths); the exact build, test, lint, typecheck,
and dev-server commands plus how to run a single test; which command proves a
change is good; conventions that differ from the framework default; where the
design system and its tokens live; architecture decisions that look arbitrary
from outside and what they protect; environment requirements; repository
etiquette; and gotchas. Close it with a note that agents read it before
changing code and update it after any change that makes part of it wrong.

Write it as a router, not an index — something that narrows where to look, then
hands off to search. Do not list individual files or anything that changes
weekly. Target 150-250 lines.

## Pre-flight check

Run this before reporting any interface work complete. Most items are
mechanical — count them, do not eyeball them.

**Direction**
- [ ] Design read stated, and dial values stated with reasoning?
- [ ] Every visual value traceable to the design system (no raw hex, no
      off-scale spacing, no inline durations)?
- [ ] One accent, one radius system, one theme across the whole surface — no
      section flipping to an inverted theme or a different corner language?
- [ ] The signature element actually present in the built output, not lost
      during implementation?
- [ ] Checked against `references/ai-tells.md`?

**Layout and content**
- [ ] Hero or primary content fits the initial viewport, with the primary
      action visible without scrolling?
- [ ] No two sections sharing the same layout family; no three consecutive
      image-plus-text splits?
- [ ] Grid cell count matches the content count — no empty tiles?
- [ ] Mobile collapse declared explicitly for every multi-column layout,
      not assumed?
- [ ] `min-h-[100dvh]` rather than `h-screen` for full-height sections?
- [ ] Breakpoints named for where content breaks, not for devices; layout
      survives a slow drag across every one?
- [ ] Nothing fixed to an edge sits under system chrome — safe-area insets
      applied to bars, sheets, toasts, and floating actions?
- [ ] No platform visual signatures borrowed (system fonts or icon sets as
      brand, Material or Cupertino component chrome)?
- [ ] Every visible string reread: no broken grammar, no unclear referents, no
      invented precision presented as fact, no filler verbs?

**States and accessibility**
- [ ] Loading, empty, error, and disabled states built?
- [ ] Every interactive element has hover, focus-visible, active, and disabled
      styling?
- [ ] Keyboard-operable end to end; focus trapped in open modals and returned
      on close?
- [ ] Contrast verified on body text, button labels, placeholders, helper text,
      and error text?
- [ ] Touch targets ≥44px with ≥24px between centers; no hover-only feedback?
- [ ] Every gesture-driven action also reachable by a single tap, click, or
      keyboard command?
- [ ] System preferences honored — reduced motion, contrast, reduced
      transparency, color scheme, and text scaling to 200% without clipping?
- [ ] Every ARIA attribute added has a visible counterpart — `aria-current`
      needs a highlighted style, `aria-expanded` needs a visible indicator?

**Motion**
- [ ] Every animation justifiable in one sentence (attention, state, or
      continuity)?
- [ ] Only `transform` and `opacity` animated?
- [ ] `prefers-reduced-motion` honored and verified by toggling the OS setting?
- [ ] Every `AnimatePresence` has an explicit `mode`, and every child a `key`
      and an `exit`?
- [ ] No `window.addEventListener("scroll")` — using `useScroll`,
      `IntersectionObserver`, or CSS scroll-driven animation?
- [ ] Every infinite animation pauses on tab hide and cleans up on unmount?
- [ ] Every effect that adds a listener removes it?

**Code**
- [ ] `"use client"` on every file importing `motion/react`; no `window` or
      `navigator` at module scope?
- [ ] No hydration warnings on a fresh load?
- [ ] Build, typecheck, and lint pass?

If an item cannot be honestly ticked, the work is not done. Fix it first.

## Completion gate

When you have finished implementing, run this gate once before reporting back:

1. Re-read the original request and list its requirements as discrete items.
2. Score your implementation out of 10 on how completely it delivers those
   requirements — not on how good the code is in the abstract.
3. If the score is below 8, state what is missing or wrong, fix it, and re-score
   once.
4. Report the final score, one line of justification, and any requirement you
   deliberately did not meet and why.

Run this gate once, at the end. Do not re-verify work you have already verified.

## Out of scope

- Canvas and WebGL work (Three.js, Pixi) — different performance model entirely.
- Implementing native apps — SwiftUI, Jetpack Compose, React Native.
  Everything in this skill above the implementation layer still applies
  (direction, hierarchy, states, accessibility, motion principles, and all of
  `cross-platform.md`), but component behavior, system integration, and store
  requirements come from that platform's own guidelines. "Mobile" elsewhere in
  this skill means mobile web and touch interfaces.
- Full drag-and-drop systems with external state managers (dnd-kit and similar).
  `references/motion-patterns.md` covers Motion's own `drag` and `Reorder`.
- Data visualization specifics — chart type selection, categorical palettes,
  axis and legend design.
- Backend and security review.
- Render performance, bundle size, memoization, and virtualization — the
  `frontend` skill owns these; see its matching
  `references/render-performance.md` or `references6/render-performance.md`.
- SEO, meta tags, structured data, sitemaps, robots.txt, and crawler access —
  the `frontend` skill owns these as output/markup concerns, not design ones.

When a request is mostly one of these, say so and point at the right tool
rather than applying this skill to a problem it does not fit.
