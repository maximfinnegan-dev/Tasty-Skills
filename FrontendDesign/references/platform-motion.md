# Platform motion APIs

`motion-system.md` and `motion-patterns.md` own Motion for React. This file
covers browser-native CSS and Web Platform capabilities that sit alongside it —
useful when a specific moment has earned more ambition than a component
library alone expresses, or when the motion needs to live outside a mounted
React tree entirely (a server-rendered page, a vanilla-JS widget). This is an
addition to the existing motion discipline, not a replacement for it: the
non-negotiables in `SKILL.md` and the rules in `motion-system.md` still govern
anything built with these tools.

Canvas, WebGL, and WASM remain out of scope for this skill — see `SKILL.md`'s
Out of scope section. Nothing here reaches for them.

## Calibrate ambition to the surface

What counts as an earned "wow" differs by what the surface is for:

- **Marketing and visual surfaces** — a hero, a portfolio piece — can carry a
  genuinely sensory moment: a scroll-driven reveal, a cinematic transition
  between states.
- **Functional UI** — tables, forms, dialogs — earns its impression through how
  *instant and physical* it feels, not through spectacle: a dialog that
  visibly morphs from the control that opened it, a list item that expands in
  place rather than jumping to a new screen.
- **Performance-critical surfaces** — search, large data views — earn it by
  never hesitating. The technique here is invisible; the interface simply does
  not stutter.

Match the technique to which of these the surface actually is; see
`product-surfaces.md` for the Operate-mode version of this same calibration.

## The toolkit

**View Transitions API (same-document).** Shared-element morphing between two
states of a page — a card expanding into a detail view, a button becoming a
dialog — without hand-rolling FLIP measurements. Broadly supported for
same-document transitions; cross-document transitions (a full navigation) lack
Firefox support, so treat that case as progressive enhancement.

```css
::view-transition-old(card),
::view-transition-new(card) {
  animation-duration: 0.35s;
}
```

**`@starting-style`.** Animates an element's entrance from `display: none` or
`content-visibility: hidden` in CSS alone, including the very first paint —
useful for a popover or a newly-inserted element that needs an entrance
without a JS mount-guard.

**`animation-timeline: scroll()`.** CSS-only scroll-driven animation — a
progress bar, a parallax layer, a reveal sequence tied to scroll position
without touching `window.addEventListener("scroll")`, which `motion-system.md`
already rules out for exactly this reason. This is the CSS-native option that
rule was pointing at. No Firefox support without a flag; ship a static
fallback behind an `@supports` check.

**`@property`.** Registers a custom CSS property with a type, which is what
lets otherwise non-interpolable values — a gradient's angle, a multi-stop
color — animate smoothly instead of snapping between states.

**Web Animations API.** JavaScript-driven animation at CSS-level performance,
for imperative sequencing outside a mounted Motion tree: a vanilla-JS widget
embedded in the page, a sequence that needs to be composed, interrupted, or
reversed programmatically without a component managing it.

## Progressive enhancement is not optional

Every technique above needs a working fallback. The unenhanced experience must
be complete on its own, not degraded-but-functional:

```css
@supports (animation-timeline: scroll()) {
  .progress { animation-timeline: scroll(); }
}
```

```js
if (document.startViewTransition) {
  document.startViewTransition(() => updateDOM());
} else {
  updateDOM();
}
```

## Verify before shipping the effect

- **The removal test.** Take the effect away. Is it missed, or does no one
  notice? If no one notices, it was not earning its place.
- **The device test.** Still smooth on a mid-range phone, not just the
  development machine. Target 60fps; simplify anything that drops below 50.
- **The context test.** Does this fit this specific product and audience, or
  would it fit any product that wanted to look impressive? The same question
  `ai-tells.md`'s litmus test asks about visual direction applies to motion
  ambition too.
