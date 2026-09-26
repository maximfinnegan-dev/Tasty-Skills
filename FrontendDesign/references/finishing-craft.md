# Finishing craft

`ai-tells.md` catalogues generic patterns to avoid. This file catalogues the
opposite: specific, concrete details that are easy to skip and that
reliably separate a competently built interface from one that feels finished.
None of these are visible in a wireframe or a component list — they only show
up in the built, running result, which is exactly why they get missed.

**Contents:** [Browser surfaces](#browser-surfaces) ·
[Dark-mode type compensation](#dark-mode-type-compensation) ·
[Font loading without reflow](#font-loading-without-reflow) ·
[Light or dark by scene](#light-or-dark-by-scene) ·
[Imagery cutouts](#imagery-cutouts) ·
[A few more tells](#a-few-more-tells) ·
[Content at its real length](#content-at-its-real-length)

---

## Browser surfaces

The parts of a page a component library does not draw still carry the design:
text selection, the text-input caret, scrollbars, the focus-ring's offset, and
the numeral style in tabular data. Left alone, these render in whatever the
browser's own default is, which belongs to no design system — and theming them
is one of the cheapest, most reliable signals that a page was actually
finished rather than assembled from a component kit.

```css
::selection { background: var(--color-accent-200); color: var(--color-accent-900); }
input, textarea { caret-color: var(--color-accent-500); }
* { scrollbar-color: var(--color-border) transparent; } /* where a custom scrollbar is genuinely warranted */
:focus-visible { outline-offset: 2px; }
.data-table td { font-variant-numeric: tabular-nums; }
```

Reach for a custom scrollbar only where it is genuinely warranted — a scroll
container with real visual weight, not every `overflow: auto` on the page. A
custom scrollbar everywhere is its own tell.

## Dark-mode type compensation

The same weight and size of type reads visibly lighter and thinner on a dark
surface than on a light one — an optical effect of light text on a dark
ground, not a rendering bug. Shipping identical type settings with only the
colors inverted is why dark themes routinely look thinner and harder to read
than their light counterpart, even when the hex values are correct.
Compensate on three axes together, not just one: slightly more line-height, a
touch more letter-spacing, and one step more weight where the face allows it.
`design-direction.md`'s "dark mode is a separate design" principle for color
extends to type as well.

## Font loading without reflow

Pick a fallback font sized to match the primary face's metrics — cap height,
x-height, average character width — so that when the real font finishes
loading, text does not visibly shift size or reflow. The framework's own font
primitive (or a metrics-matching tool) usually generates this automatically;
verify it is actually configured rather than assuming a default `font-display`
setting alone solves it. `design-direction.md`'s "load fonts properly" already
names `font-display: swap` as the floor — a metric-matched fallback is what
makes the swap invisible instead of just non-blocking.

## Light or dark by scene

Default theme choice is often picked by product category — dashboards default
light, entertainment apps default dark — rather than by the actual scene the
product is used in. A dashboard someone checks at a desk in daylight and a
dashboard someone monitors at night both being called "a dashboard" does not
make the same default correct for both. Ask who is actually looking at this,
where, and under what ambient light, and let that answer the default rather
than the category habit.

## Imagery cutouts

When a subject needs to be isolated from its background — a product shot, a
portrait, a figure — derive the cutout from the image itself: an alpha matte,
or a produced cutout asset with real edge detail. A CSS `clip-path` polygon or
a geometric mask (a circle, a simple curve) approximating the subject's actual
organic edge is the cheap version of the effect, and it reads as a
placeholder even when it is technically "finished" — the eye catches the
mismatch between the geometric edge and the organic shape behind it
immediately.

## A few more tells

Additions to `ai-tells.md`'s catalogue, worth checking alongside it:

- **A card nested inside another card.** Reliably a sign the layout needed a
  different primitive — grouping through spacing or a rule, not a second
  container.
- **The hero-metric template** — a big number, a small label, a row of
  supporting stats, an accent — reached for because it is available, not
  because the content is actually shaped that way.
- **A colored left or right border above 1px** used as decoration on a card
  or callout, rather than as a real state indicator (selected, active,
  flagged). If it carries no state, it is decoration wearing the costume of
  meaning.
- **A hard-offset, zero-blur shadow** (`box-shadow: 4px 4px 0`) outside a
  world that has actually committed to a neobrutalist language elsewhere. It
  is a specific costume, not a general depth technique, and it looks foreign
  bolted onto anything else.
- **Monospace type as a costume for "technical"** rather than for genuine
  code, data, or measurement content.
- **A modal reached for by default** rather than because the task actually
  needs interruption or protected focus — see `cross-platform.md`'s
  feedback-weight table for when a modal is actually the right call.

## Content at its real length

Two CSS problems worth checking specifically, because they only appear once
real (not placeholder) content is in place:

**The flex and grid overflow trap.** A flex or grid item does not shrink below
its content's intrinsic size by default, which is why one long, unbroken
string — a URL, an email address, a name with no spaces — blows out a card in
a flex row even though every layout rule looks correct. Set `min-width: 0` on
the shrinking item (`min-height: 0` for a column direction) to let it actually
respect the container instead of the content's natural size.

```css
.flex-item { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
```

**Choosing the right overflow tool.** Three options for text of unknown
length, and the choice should depend on whether truncating ever hides
information the user actually needs:

- Single-line ellipsis (`overflow: hidden; text-overflow: ellipsis; white-space: nowrap;`)
  when the full value is available elsewhere (a tooltip, a detail view).
- Multi-line clamp (`-webkit-line-clamp`) when a few lines of preview are
  useful and the rest is genuinely optional.
- Wrap with `overflow-wrap: break-word` and, for long unbroken tokens,
  `word-break: break-word` when nothing may be silently hidden — a form
  value, an error message, anything the user needs to read in full.

An ellipsis on something the user needs to act on — a button label, a price,
an error — is a broken control, not a space-saving technique.
