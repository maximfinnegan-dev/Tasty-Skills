# Design direction

Choosing what an interface looks like: hierarchy, layout, typography, color,
density, and the greenfield fallback for deriving a token set when a project
has none.

**Contents:** [Working within an existing system](#working-within-an-existing-system) ·
[Greenfield token derivation](#greenfield-token-derivation) ·
[Hierarchy](#hierarchy) · [Layout](#layout) · [Typography](#typography) ·
[Color](#color) · [Density](#density) · [Materiality](#materiality) ·
[Copy](#copy) · [Surface-type calibration](#surface-type-calibration)

---

## Working within an existing system

The default case. The project has tokens; your job is to compose with them, not
to invent alongside them.

**Find the system before designing.** A theme file, `tailwind.config`, a CSS
custom property block, a tokens package, a Figma export, or a pointer in
`AGENTS.md`. Read it fully — knowing the whole scale is what lets you pick the
right step rather than the nearest one.

**Amplify, do not overwrite.** When editing one component inside an established
system, the strong move is coherence: find what the system does distinctively
and push that further. Imposing a new visual language on one screen makes the
product worse even when that screen looks better in isolation.

**Extend at the source.** If a genuinely new value is needed — a step the scale
lacks, a semantic color with no existing token — add it where the other tokens
live and say you added it. Values scattered into components are how a system
decays.

**Distinguish primitive from semantic.** A primitive token names a value
(`gray-700`, `space-4`). A semantic token names a role (`text-secondary`,
`surface-raised`, `border-subtle`). Components consume semantic tokens;
semantic tokens reference primitives. If the project makes this distinction,
follow it — reaching past a semantic token to a primitive breaks theming.

When there is no formal system to read but real, working components already
exist — the same values typed out by hand in a dozen slightly different ways —
consolidating them into one is `references56/system-extraction.md`.

### Four ideas worth borrowing from mature design systems

These are structural patterns, not anyone's visual identity. Adopt them with
your own values and your own names.

**Pair every fill with its foreground.** For each surface or accent role,
define the color that goes on top of it: an accent and its on-accent, a
danger fill and its on-danger, each surface level and its on-surface. Pairing
them means contrast is guaranteed by construction rather than checked case by
case, and it survives a theme change. The failure it prevents — white text on a
white button — is one of the most common contrast bugs there is.

**Build a surface ladder, not a shadow ladder.** Two to five surface levels,
each a slightly different value, expressing depth by tone: page background,
resting surface, raised surface, overlay. Layering by color works on dark
themes where shadows are invisible, survives high-contrast mode, and costs
nothing to paint. Add a shadow only when an element genuinely needs separating
from busy content beneath it.

**Separate structural borders from decorative ones.** A border that carries
meaning — an input outline, a selected state, a focus ring — needs 3:1
contrast against its surroundings. A divider between list rows does not, and
at 3:1 it will look heavy-handed. Two tokens, used deliberately.

**Define one interaction state treatment and reuse it.** A single overlay or
tint applied consistently for hover, focus, pressed, selected, and disabled,
rather than bespoke states per component. This is what makes twenty different
controls feel like one system, and it is usually the difference between an
interface that feels built and one that feels assembled.

---

## Greenfield token derivation

Only when there is genuinely no system: a fresh repo, a prototype, a Claude
Design canvas. Derive the set first, in one place, before building anything.

Six scales, each small:

| Scale | Size | Notes |
|---|---|---|
| **Spacing** | 6-7 steps | A consistent progression: 4 / 8 / 16 / 24 / 40 / 64 / 96. Every margin, padding, and gap maps to one. |
| **Type** | 5-6 steps | Size and weight together, with a clear jump between adjacent steps. Fluid `clamp()` for anything that must scale across viewports. |
| **Color** | 1 accent, 1-2 semantic (success, danger), 5-6 neutrals | Neutrals carry most of the interface. The accent is for emphasis and primary action only. |
| **Radius** | 1-2 values | Or a documented rule (pill buttons, 12px cards, 8px inputs) followed everywhere. |
| **Elevation** | 2-3 levels | Express depth as a surface ladder first, shadow second. Tint shadows to the background hue, never pure black on a light surface. On dark surfaces use lighter backgrounds or borders — shadows do not read on dark. |
| **Motion** | Durations, easings, springs | See `references56/motion-system.md`; `assets/motion-tokens.ts` is a drop-in. |

Write them as CSS custom properties or a theme config, in one file, then
consume them exclusively. Define both light and dark values from the start —
dark mode is a separate design, not an inversion. Accents usually need to
brighten on dark; shadows become borders or glows.

**Do not spend the freedom on defaults.** A brand-new palette that lands on
blue-to-purple, or a type system that lands on Inter at three sizes, has
skipped the work. Derive from the subject: what the product is, who uses it,
what its world looks like. `references56/ai-tells.md` lists the specific defaults
worth reaching past.

---

## Hierarchy

The single highest-leverage thing in interface design, and the most commonly
missing.

When every element has similar size, weight, and color intensity, nothing
guides the eye and users must read everything instead of scanning. Some things
must be loud — the primary metric, the main heading, the primary action — and
most things must be quiet: metadata, secondary navigation, captions, labels.

Build hierarchy with size and weight before reaching for boxes, borders, and
background colors. Typography does most of the structural work in
well-designed interfaces; containers are what you add when typography alone
genuinely cannot carry the grouping.

**Signs hierarchy is broken:**

- A flat type scale — headings, body, and labels within a few percent of each
  other.
- Primary and secondary buttons with identical visual weight.
- Uniform spacing everywhere, so section boundaries are invisible.
- Three or more calls to action at the same prominence in one region.
- Key data points that do not stand out from the labels next to them.

**One primary action per screen region.** If three buttons in a section look
alike, the user does not know what to do. One solid, one outlined, one text —
or remove the ones that do not matter.

**A quick self-test:** blur your eyes at a screenshot of the surface. If one
element still reads as the thing to look at first, hierarchy is doing its job.
If everything competes equally, or nothing stands out at all, fix that before
touching anything else — it is a cheaper diagnostic than reading the CSS.

---

## Layout

**Proximity encodes relationship.** Tight within a group (label to input),
open between groups (section to section). Uniform padding everywhere is the
opposite of design — it removes the only signal that says which things belong
together.

**Structure should encode something true.** Numbered markers, eyebrows,
dividers, and labels are meaningful when the content is actually a sequence, a
category, or a boundary. Applied decoratively they read as templating. Before
adding a structural device, name what it tells the reader; if there is no
answer, drop it.

**Vary layout families across a page.** Once a section uses a layout family —
three-column cards, full-width quote, split text-and-image — that family
appears at most once more. A page with eight sections should use at least four
different families. Alternating image-left and image-right for six sections in
a row is one family repeated, not variety.

**Grid over flex math.** `grid grid-cols-1 md:grid-cols-3 gap-6` rather than
`w-[calc(33%-1rem)]`. Percentage math with gap compensation breaks at edges and
is hard to read.

**Declare the mobile collapse explicitly** for every multi-column layout, in
the same component. "The framework will handle it" is where responsive bugs
come from.

**Contain page width** predictably, and increase horizontal gutters at larger
breakpoints rather than keeping a narrow inset at every size.

**Lay out for available space, not for a device.** Breakpoints are named for
where the content breaks; components respond to their container rather than
the viewport. `cross-platform.md` covers this, along with system chrome, safe
areas, and designing for a window you do not own.

**Write layout with logical properties** — `margin-inline-start` rather than
`margin-left` — so the same CSS works in both writing directions. See
`internationalization.md`.

**Full-height sections use `min-h-[100dvh]`, never `h-screen`.** On mobile,
`vh` includes space the address bar occupies, so a `100vh` section visibly
resizes as the bar shows and hides.

---

## Typography

**Two families at most**, and use the weight range within them aggressively.
Three families is almost always one too many; the variation you wanted is
usually available as weight and width within a good family.

**Pair deliberately.** A characterful display face used with restraint, a
complementary body face that stays out of the way, and optionally a utility
face for captions, data, and code. The display face carries personality; the
body face carries readability, and those are different jobs.

**Set a real scale.** Five to six steps with a clear jump between adjacent
ones. Fluid `clamp()` for headings that must work from phone to desktop. If two
steps are within a few percent of each other, one of them is unnecessary.

Reference proportions when the project has no scale to inherit:

| Level | Size | Weight | Job |
|---|---|---|---|
| Display / H1 | 1.5-2.5rem+ | 700 | Page or hero title |
| H2 | 1.2-1.5rem | 600-700 | Section heading |
| H3 | 1-1.2rem | 500-600 | Card or subsection title |
| Body | 0.875-1rem | 400 | Main content |
| Caption | 0.75-0.85rem | 400-500 | Metadata, labels |

**Body text at 1.4 line-height minimum**, measure capped around 65-75
characters. Long-form text running the full width of a wide screen is
unreadable regardless of how good the type is.

**Emphasis within a headline uses italic or bold of the same family.** Dropping
a serif word into a sans headline to add interest reads as amateur.

**Watch italic descenders.** An italic word containing `y g j p q` at
`leading-none` clips. Use 1.1 line-height minimum and reserve a little bottom
padding on the wrapping element.

**Avoid Thin and Ultralight weights below about 14px**, and on any surface
likely to be viewed on a phone in daylight or on a low-quality panel. A hairline
weight that looks elegant on a calibrated desktop monitor at 100% can disappear
entirely at a smaller size or a worse screen. Regular or Medium is the safer
floor; reserve the lightest weights for large display type.

**Load fonts properly** — the framework's font primitive or self-hosted
`@font-face` with `font-display: swap`. A render-blocking font link in
production is a first-paint problem, not a typography problem, but it lands in
the same place.

---

## Color

**One accent, locked for the whole surface.** A warm-neutral interface does not
acquire a blue button in section seven. A rose-accented product does not get a
teal badge in the footer. Pick one, use it only for emphasis and primary
action, and audit every component against it before shipping.

**Neutrals carry the interface.** Five or six of them, one temperature — do not
mix warm and cool grays in the same product. Avoid pure `#000` against pure
`#fff`; near-black and slightly-warm white are easier to look at and read as
considered.

**Color must mean something.** Status, priority, category, or emphasis. Color
used decoratively becomes noise that dilutes the color used meaningfully. More
than five or six colors in active use is a hierarchy problem wearing a palette.

**Derive from the content, not from a template.** What the product is about
should be visible in what it is colored. A palette that would fit any product
fits none of them.

**Dark mode is a separate design.** Re-select values rather than inverting:
accents usually brighten, shadows become borders or glows, image brightness may
need adjustment, and elevation is expressed with lighter surfaces rather than
darker shadows. Verify contrast in both modes — a pairing that passes in one
frequently fails in the other.

**Theme lock.** The page has one theme. Sections do not invert mid-scroll. A
single deliberate full-theme switch as a compositional device is allowed once;
random alternation is not.

Generating new tokens or extending a scale predictably, rather than eyeballing
values one at a time, is `references56/color-systems.md`.

---

## Density

Density is a decision, not a default, and it is set by what the surface is for:

| Surface | Density | Why |
|---|---|---|
| Marketing page | Low | One message at a time; whitespace is the argument |
| Form | Low-medium | Each field needs room; dense forms produce errors |
| Settings | Medium | Grouped sections with clear boundaries |
| Dashboard | Medium-high | Users scan metrics; compactness is expected |
| Data table | High | Power users want rows on screen |

**Long lists need a different component, not a longer list.** Past five or six
items, a plain list with a rule under every row is the lazy choice. Reach for
grouped chunks with sparse dividers, a card grid, tabs or an accordion if the
items are categorizable, horizontal scroll-snap, or a featured-few plus a
disclosure for the rest.

**Cut content before compressing it.** A section whose headline runs past eight
words and whose supporting paragraph runs past twenty-five usually has more
than one job. Split it or cut it.

---

## Materiality

**Cards are earned.** Use one when the content genuinely represents a discrete,
browsable object. Otherwise group with a rule, a background shift, or space.
Wrapping every group in a bordered, shadowed, rounded container is the fastest
way to make an interface look generic.

**One radius language.** All-sharp, all-soft, or all-pill — or a documented
rule per element type, applied everywhere. Round buttons in a square layout
reads as unfinished.

**Shadows sparingly and tinted** to the background hue. Consider a border, a
background-color shift, or nothing at all before reaching for elevation.

**Glass effects on at most one element class**, usually a fixed navigation bar
where content actually scrolls beneath it. Glass only reads as glass when
something visually rich sits behind it, and it needs a solid fallback under
`prefers-reduced-transparency`.

**Texture over gradient.** A subtle grain or noise overlay on a solid
background does more for a surface than a linear gradient, and it does not
carry the same generic association. Apply it to a fixed, `pointer-events-none`
pseudo-element — never to a scrolling container, where it forces continuous
repaints.

---

## Copy

Words in an interface exist to make it easier to use. They are design material,
and the same intentionality applies to them as to spacing.

**Write from the user's side of the screen.** Name things by what people
control and recognize, not by how the system is built. A person manages
notifications, not webhook configuration.

**Active voice, specific verbs.** A control says what happens when it is used:
"Save changes", not "Submit". An action keeps its name through the whole flow —
the button that says "Publish" produces a toast that says "Published".

**One label per intent.** "Get in touch", "Contact us", and "Let's talk" on the
same page are three names for one thing. Pick one and use it in the navigation,
the body, and the footer.

**Primary button labels are one to three words** and must fit on one line at
desktop. A wrapped call to action is a broken button — shorten the label or
widen the button.

**Errors and empty states are direction, not mood.** Say what happened and how
to fix it. An empty screen is an invitation to act, not a shrug.

**Never ship lorem ipsum.** Placeholder text hides hierarchy problems. Write
specific, plausible copy for the actual subject — and reread every visible
string before shipping, cutting anything grammatically broken, anything with an
unclear referent, and any clever phrasing that does not survive being read
literally. Plain copy beats clever-but-wrong copy.

---

## Surface-type calibration

For the Dashboard and Product/app rows, `references56/product-surfaces.md`
carries the depth this table only states in one line — type scale ratios,
state vocabulary, and the overlay-clipping gotcha.

| Type | Character | Key moves |
|---|---|---|
| **Marketing / landing** | Bold, focused, conversion-oriented | One message per section, one dominant action, generous section spacing, real visual assets, footer designed as a destination |
| **Dashboard** | Dense, scannable, data-first | Big numbers with small labels, subtle separators over cards, color reserved for status, typography carries structure |
| **Product / app** | Guided, structured, reassuring | Clear grouping, inline validation, visible progress, calm palette, restrained motion on state change only |
| **E-commerce** | Browsable, trustworthy | Product imagery is the hero and the UI is the frame; consistent cards, clear price hierarchy, prominent primary action |
| **Portfolio / creative** | Expressive, memorable | This is where boldness belongs — the artifact demonstrates the skill; fewer items per viewport, memorable transitions |
| **Form-heavy / regulated** | Plain, forgiving, accessible | Labels above inputs, generous field spacing, error prevention over error recovery, motion at dial 2-3 |
