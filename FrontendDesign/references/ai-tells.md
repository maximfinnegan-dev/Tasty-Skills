# AI tells

The patterns that mark an interface as machine-generated, and what to do
instead. Read this before finalizing any design, and whenever output starts to
feel templated.

These are not banned because they are ugly. Most are individually defensible.
They are listed because they appear regardless of the brief — which means they
are defaults rather than choices, and an interface assembled from defaults has
no point of view.

**A default becomes a choice when you can say why it fits this brief
specifically.** Where the brief explicitly asks for one of these, follow the
brief; the brief's own words always win.

This file is about what to avoid. `references56/finishing-craft.md` is the
companion concern — specific details worth adding on the way to a finished
result, like themed browser chrome and dark-mode type compensation, that
rarely show up in a wireframe and are easy to skip even in careful work.

**Contents:** [Visual](#visual) · [Typography](#typography) ·
[Layout](#layout) · [Content and copy](#content-and-copy) ·
[Motion](#motion) · [Decoration](#decoration) · [The litmus test](#the-litmus-test)

---

## Visual

| Default | Instead |
|---|---|
| Blue-to-purple gradient backgrounds | A solid ground with grain or texture; imagery; a palette derived from the subject. If a gradient is right, make it unexpected — warm, radial, duotone within one hue, or very subtle. |
| Gradient-clipped headline text | Solid type at dramatic scale. Outlined or stroked type. One word in the accent color. Scale and weight create impact; gradients dilute it. |
| Neon outer glows | Inner borders, tinted shadows, or contrast against a quieter surround. |
| Uniform 12px radius on everything | One deliberate radius language. Sharp corners can be elegant. See "Materiality" in `design-direction.md`. |
| `box-shadow: 0 4px 6px rgba(0,0,0,0.1)` on every card | Borders, background shifts, or no elevation at all. Shadows sparingly and tinted. |
| Glassmorphism on every surface | Glass on at most one element class, where content actually scrolls beneath. |
| Pure `#000` on pure `#fff` | Near-black and a slightly warm white. |
| A dark mode produced by inverting the light one | Re-select values for dark: brighter accents, borders instead of shadows, verified contrast. |
| Emoji as a feature-icon system (🚀 ✨ 💡 ⚡) | Vector icons from one library at a consistent stroke weight and size, large numerals in the display face, geometric accent shapes, or nothing — type can carry a feature list. |
| Mixed icon sources in one product | One library throughout, one stroke weight, one fill style per hierarchy level. Mixed icon styles are among the most visible signs of an unpolished interface. |
| Hand-drawn SVG icon paths | Install a library. Hand-rolling icon geometry produces inconsistent optical weight. |
| A web interface dressed as an operating system — iOS grouped lists and toggles, a Material FAB and ripple, translucent frosted system bars, SF Symbols or Material Symbols as the icon set | Your product's own component language. Borrowing a platform's visual signature makes a product look like a clone of a system app. Take the practices, not the appearance — `cross-platform.md` draws the line. |

## Typography

| Default | Instead |
|---|---|
| Inter / Roboto / Open Sans on everything by default | A face chosen for this product's personality. Inter is fine when the brief asks for neutral, system-native, or accessibility-first — as a decision, not a fallback. |
| A platform system font as the brand face — SF Pro, Roboto, Google Sans, Segoe | A typeface chosen for the product. `system-ui` in a stack for genuine performance reasons is a different decision and is fine. |
| Serif display because the brief said "creative" or "premium" | Sans display is the default for creative, modern, premium-consumer, and portfolio work. Reach for serif when the aesthetic is genuinely editorial, publication, heritage, or luxury *and* you can say why this serif fits this brand. |
| Three or more font families | Two at most, using the weight and width range aggressively. |
| Oversized H1 doing all the work | Control hierarchy with weight, color, and spacing. Scale alone is shouting. |
| A random serif word dropped into a sans headline for interest | Italic or bold of the same family. |
| Body text under 14px, or line-height under 1.4 | 0.875-1rem at 1.4+ line-height, measure capped around 65-75 characters. |

## Layout

| Default | Instead |
|---|---|
| Three identical feature cards in a row | Asymmetric grid, two-column alternation, a numbered sequence when the content is genuinely sequential, or horizontal scroll. |
| Everything centered inside a fixed max-width | Left-aligned hero with an asset opposite, full-bleed sections, asymmetric composition. Centered is right for manifesto and announcement surfaces where the message is the design. |
| Uniform card grid with identical spacing | Let elements span differently, vary treatment across cells, break the grid deliberately once. |
| The same padding on every section | Vary section rhythm dramatically. Generous at the hero, tighter in dense content. Asymmetric where it creates interest. |
| Six alternating image-left / image-right rows | Two consecutive at most, then break the pattern with a full-width section, a vertical stack, a grid, or a different family entirely. |
| A grid with a blank tile at the end | Shape the grid to the content count. Three items get a three-cell composition, not a four-cell grid with a hole. |
| A bento of white-on-white text cards | At least two or three cells carry real visual variation — an image, a pattern, a tinted ground. |
| "Left big headline, right small explainer paragraph" as a section header | Stack them: headline, then body beneath at a capped measure. Use the split only when the right column carries a real visual or interactive element. |
| A 10-row spec table with a rule under every row | Group into two or three clusters with sparse dividers, or a card per spec, or a featured few plus a disclosure. |
| Trust logos stuffed into the hero row | The hero carries the value proposition and the primary action. The logo wall is the section directly below it. |
| A two-line navigation bar at desktop | Condense labels, drop secondary items, or collapse to a menu. Keep the bar under 80px. |

## Content and copy

| Default | Instead |
|---|---|
| "John Doe", "Jane Smith", "Acme Corp", "Nexus", "SmartFlow" | Specific, plausible, locale-appropriate names that sound like they belong to a real product. |
| Invented social proof — avatar rows, "Trusted by 10,000+ developers", ghost logos, a 4.9 rating | Real proof or no proof. Fabricated proof reads as machine-generated immediately, and the design itself can do the trust work. |
| Fake-precise numbers (`92%`, `4.1×`, `5.8 mm`) invented to sound engineered | Real figures from the brief, or figures explicitly marked as sample data, or no figures. |
| Suspiciously round numbers (`50%`, `99.99%`, `1,000,000`) | Organic values. |
| "Elevate", "Seamless", "Unleash", "Next-gen", "Revolutionize" | Concrete verbs that name what actually happens. |
| A `<div>`-built fake product screenshot — fake task list, fake terminal, fake dashboard | A real screenshot, a generated image, an actual working mini-version of the UI, or editorial imagery instead. |
| Lorem ipsum | Written copy for the real subject. Placeholder text conceals hierarchy problems. |
| Version labels in the hero (`V0.6`, `BETA`, `EARLY ACCESS`) | Only when the brief is genuinely about launch status. |
| Poetic section labels — "From the field", "Field notes", "Currently on the bench" | Plain functional labels, or no label. |
| Micro-meta sentences under a section heading explaining the section | Heading and body are enough. |

## Motion

| Default | Instead |
|---|---|
| An infinite loop on every card | Loops only where they communicate live state or progress. See `motion-system.md`. |
| `transition: all 0.3s ease` | Named easing curves from the token set, applied to specific properties. |
| One duration reused for every transition | Duration scaled to distance and role — feedback fast, entrances slower. |
| Two or more horizontal marquees on one surface | One at most, on the section where breadth genuinely matters. |
| Custom cursor followers over interactive content | Skip them, or isolate them entirely from controls so they never mask a control's own feedback. Desktop-only, always. |
| Scroll cues (`Scroll`, `↓ scroll`, animated mouse icons) | Nothing. The user is looking at the top of a page; they know. |
| Scroll hijacking as a default | Only when the content is genuinely a linear narrative, and never without a working reduced-motion path. |

## Decoration

Small marks that appear on machine-generated work far more often than on
designed work. Each is fine occasionally and a tell in aggregate.

- **The eyebrow above every section heading.** The small uppercase wide-tracked
  label. Cap it at roughly one per three sections; the heading alone is usually
  enough, and a section's position on the page already categorizes it.
- **Section-number eyebrows** — `00 / INDEX`, `001 · Capabilities`,
  `06 · how it works`. Name the topic in plain language or say nothing.
- **Generic step labels** — "Stage 1 / Stage 2", "Phase 01 / Phase 02". Use the
  verb: "Install", "Configure", "Ship".
- **`01 / 4` pagination overlaid on images or tiles.** If the user can count,
  the label adds nothing.
- **The middle dot as universal separator** — "foo · bar · baz · qux". One per
  metadata line at most; otherwise use columns, line breaks, or hairlines.
- **Decorative colored status dots** before nav items, list rows, and badges.
  Only when the dot carries real semantic state.
- **Pills and tags overlaid on photographs.** Let the image speak, or caption it
  beneath.
- **Invented photo credits** — "Frame XII · 35mm", "Plate 03 · House archive".
  Credit real photographers for real photos; otherwise nothing.
- **Version footers on a marketing page** — `v1.4.2`, `Build 0048`, "last sync
  4s ago". Devtool fixtures, not marketing content.
- **Locale, time, and weather strips** — "LIS 14:23 · 18°C". Only for genuinely
  place-bound or timezone-distributed subjects.
- **A mono-caps decoration strip at the bottom of the hero** — "BRAND. MOTION.
  SPATIAL." Only when it carries real navigation or real status.
- **Crosshairs and hairline grid overlays** drawn to make a page "feel
  designed". Rules are for organizing real content.
- **Rotated vertical text.** A portfolio cliché unless the brief is explicitly
  experimental and the composition genuinely needs it.

## The em-dash

Avoid the em-dash (`—`) in interface copy: headlines, labels, buttons, body,
captions, quotes, attribution, and alt text. It is the most recognizable
stylistic marker of generated text, and interface copy is short enough that
there is always a better construction — a period, a comma, a colon,
parentheses, or two sentences. Use a plain hyphen for ranges and compounds.

This applies to visible interface copy. It is not a rule about code, comments,
or the messages you write to the user.

## The litmus test

Before shipping, answer honestly:

1. **Strip the brand name out. Could this belong to any product?** If yes, it
   has no point of view yet.
2. **Which element here is the most generic?** Redesign that one now.
3. **Did the signature move survive implementation,** or did it get lost
   somewhere between the plan and the code?
4. **Does the page have rhythm** — real variation between sections — or does it
   repeat one composition?
5. **Is there tension?** Large against small, dense against open, loud against
   quiet. Uniformity is the absence of design.

When you catch yourself reaching for a default: stop, name the pattern, ask
what the opposite would be, and take the more committed option. The goal is not
difference for its own sake. It is that every choice is a choice.
