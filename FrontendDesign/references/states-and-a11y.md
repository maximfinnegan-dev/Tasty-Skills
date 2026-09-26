# States and accessibility

Every state a component has, and the accessibility work that makes it usable.
These are one file because they are one problem: an interface that only exists
in its happy path, for one kind of user, is half-built.

**Contents:** [The four states](#the-four-states) ·
[Interactive states](#interactive-states) · [Focus](#focus) ·
[Keyboard](#keyboard) · [Contrast](#contrast) ·
[Touch targets](#touch-targets) · [System preferences](#system-preferences) ·
[Gesture alternatives](#gesture-alternatives) ·
[Accessible names](#accessible-names) · [Component patterns](#component-patterns) ·
[Announcing change](#announcing-change) · [Semantic-visual sync](#semantic-visual-sync) ·
[Testing](#testing)

---

## The four states

Build all four with the component, not afterward.

**Loading.** A skeleton matching the final layout's shape, not a spinner
floating in empty space — the skeleton reserves the room, so nothing jumps when
content arrives. Set `aria-busy` on the region. For operations under about
200ms, no indicator at all is better than a flash.

**Empty.** Never a blank region. Say what would be here and give the action
that fills it. An empty state is the best onboarding surface a product has and
the most commonly skipped one. A missing empty state is a real finding in
review, not a nitpick. `references56/onboarding.md` breaks this into the five
distinct kinds of empty state — first use, user-cleared, no results, no
permission, error — each of which wants different treatment, and covers
activation design more broadly.

**Error.** Say what happened and how to fix it, near the thing that failed, in
the interface's own voice. No status codes, no exception names, no stack
traces. Never auto-dismiss an error — the user has not finished reading it.
Offer the retry. Handle network loss and timeout explicitly; a fetch that fails
silently is indistinguishable from a broken app.

**Disabled.** Visibly different, and not just lower opacity — a control that
looks tappable and does nothing is worse than one that is clearly unavailable.
Where practical, say why it is disabled rather than leaving the user to guess.

---

## Interactive states

Every interactive element needs `:hover`, `:focus-visible`, `:active`, and
`:disabled`, and the same set on every element of the same kind. A card that
lifts on hover next to a card that does nothing tells the user the second one
is broken.

- **Hover feedback must be visible.** A change so subtle it reads as a
  rendering artifact is worse than none. Wrap hover-only effects in
  `@media (hover: hover)` so touch devices do not inherit a stuck state.
- **Active states should feel physical** — a small scale-down or 1px shift.
  Never a layout-shifting transform that moves surrounding content.
- **Selected must be clearly distinct from unselected**, not a few percent
  darker.
- **State changes get a transition**, 150-300ms. Instant swaps read as glitches.
  Never a transition so slow the interface feels unresponsive.
- **Never use color alone** to convey state. Pair it with an icon, a weight
  change, text, or a border.

---

## Focus

**Never remove a focus ring without replacing it** with something at least as
visible. `outline: none` with nothing after it makes the interface unusable by
keyboard, and it is the single most common accessibility failure in styled
components.

Use `:focus-visible` rather than `:focus` so pointer users do not see rings on
click while keyboard users still do.

**Focus must be visible against every background it can appear on.** A ring
tuned for the light surface disappears on the dark one.

**Manage focus on every state change that moves the user:**

- Opening a dialog moves focus into it; closing returns focus to the trigger.
- A dialog traps Tab so focus cannot escape to the page behind it.
- Submitting a form with errors moves focus to the first invalid field.
- Removing an item moves focus to a sensible neighbor, not to the document body.
- Route changes move focus to the main heading or the main landmark.

**Focus must not be obscured** by sticky headers or footers. Check by tabbing
through a scrolled page, not by reading the code.

---

## Keyboard

Everything reachable by pointer is reachable by keyboard, and the tab order
matches the visual order. When DOM order and visual order diverge — a CSS
`order` or `grid-area` reshuffle — the tab order follows the DOM and confuses
everyone.

- Escape closes any dismissible layer: dialog, menu, popover, drawer.
- Arrow keys move within a composite widget: menu items, tab lists, listbox
  options, radio groups.
- Enter and Space activate. `<button>` gives you this free; a `<div>` with an
  `onClick` does not.
- Provide a skip link to the main content when there is significant navigation
  before it.
- Never trap focus anywhere except an open modal.
- Anything driven only by drag needs a non-drag path — reorder buttons,
  arrow-key handling, or a menu action.

---

## Contrast

| Content | AA minimum |
|---|---|
| Body text (under 18px, or under 14px bold) | 4.5:1 |
| Large text (18px+, or 14px+ bold) | 3:1 |
| UI component boundaries, icons carrying meaning, focus indicators | 3:1 |

The five places contrast usually fails, worth checking every time:

1. **Button label against button background** — including ghost buttons over
   images, which need a scrim or a border.
2. **Placeholder, helper, and error text** — habitually set too light.
3. **Secondary and muted text.** Gray on white below roughly `#767676` fails.
4. **Borders and dividers in the theme they were not designed in.**
5. **Disabled states** — genuinely exempt from the ratio, but if a disabled
   label is unreadable the control is still a problem.

Verify with a contrast checker on the composed result, not by eye and not from
the token name.

---

## Touch targets

At least 44×44px in hit area, with at least 24px between the centers of
adjacent targets. WCAG sets 24×24px as the AA floor and 44×44px at AAA; 44px is
what actually works under a thumb, so treat it as the target and 24px as the
absolute minimum for a dense pointer-driven surface.

Pad an invisible area around a small icon rather than enlarging the icon:

```tsx
<button className="p-3"> {/* 12px padding brings a 24px icon to a 48px target */}
  <Icon className="w-6 h-6" />
</button>
```

Fixed bottom elements must clear the home indicator and gesture bar:
`padding-bottom: max(1rem, env(safe-area-inset-bottom))`. Full-height sections
use `100dvh`, not `100vh`. See `cross-platform.md` for the full treatment of
system chrome.

---

## System preferences

Every platform lets people tune the interface to their needs, and honoring
those settings is the highest-leverage accessibility work available — it serves
users who have already told the system exactly what they need.

| Preference | Web signal | What to do |
|---|---|---|
| Reduced motion | `prefers-reduced-motion: reduce` | Disable transforms, parallax, autoplay, and loops. An opacity fade at ≤0.2s is the only fallback. |
| Increased contrast | `prefers-contrast: more` | Strengthen borders, darken secondary text, make focus rings heavier. |
| Reduced transparency | `prefers-reduced-transparency: reduce` | Replace blur and translucency with solid fills. |
| Forced colors / high contrast mode | `forced-colors: active` | Stop fighting it. Use system color keywords, keep `forced-color-adjust` alone unless a specific element genuinely breaks, and verify focus stays visible. |
| Larger text | Root font size, browser zoom | Size in `rem`, never fixed `px`, so text scales. Layout must hold to 200% zoom without clipping or overlap. |
| Bold text | No direct web signal | Do not rely on weight alone to carry meaning; pair it with size or color. |
| Color scheme | `prefers-color-scheme` | Honor it by default. Set `color-scheme` so form controls and scrollbars follow. |
| Data saving | `prefers-reduced-data: reduce` | Skip decorative imagery and heavy video where the feature is available. |

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

A blanket override like this is a safety net, not the design. Handle reduced
motion deliberately in components — see `motion-system.md` — and keep this as
the backstop for anything missed.

**Not everything needs to grow at the same rate.** When someone sets a larger
text size, they want the content they came for to be easier to read — not
necessarily every tab label and timestamp to inflate along with it. Let
primary content scale fully; chrome like tab bars, badges, and metadata can
scale more conservatively as long as it stays legible, so the layout does not
break before the content does.

---

## Gesture alternatives

**Any action driven by a path, a multipoint gesture, or a drag must also be
achievable with a single tap or click.** Swipe-to-delete needs a delete
control. Pinch-to-zoom needs zoom buttons. Drag-to-reorder needs move
controls or keyboard handling. Long-press needs a visible menu.

This is a WCAG requirement (2.5.1 and 2.5.7), and it is also what makes the
feature discoverable — a gesture with no visible counterpart is invisible to
most users, not only to those who cannot perform it.

**Actions must complete on release, not on press**, so a user who begins a
gesture by mistake can move away and abort it. **Never override a
system-reserved gesture** — edge swipes, browser back and forward, pull to
refresh where the platform owns it.

---

## Accessible names

Every interactive element needs a name that says what it does.

- **The name describes purpose, not appearance.** "Search" beats "magnifying
  glass". "Close dialog" beats "X".
- **The visible label must be contained in the accessible name** so that voice
  control works — a user saying "click Save" cannot activate a button whose
  visible text is "Save" but whose `aria-label` is "Submit form". If you
  override the name, keep the visible words inside it.
- **Do not double up.** An icon beside visible text gets `aria-hidden="true"`,
  or the name gets announced twice.
- **Group related elements** so assistive technology reads a card as one item
  rather than five disconnected fragments.
- **Traversal order matches visual order.** When they diverge, the DOM is
  wrong; fix the DOM rather than patching with positive `tabindex` values.

---

## Component patterns

The requirements below are what makes each pattern work; they are also exactly
what audits find missing.

**Dialog / modal.** `role="dialog"`, `aria-modal="true"`,
`aria-labelledby` pointing at its title. Escape closes. Focus trapped inside,
returned to the trigger on close. Background scroll locked. Overlay click
closes, unless the content is destructive or unsaved.

**Menu / dropdown.** Trigger carries `aria-haspopup` and `aria-expanded`.
Arrow keys move between items, Escape closes and returns focus, click outside
closes. Items are `<button>` or `<a>`, not divs.

**Tabs.** `role="tablist"` / `role="tab"` / `role="tabpanel"`, `aria-selected`
on the active tab, `aria-controls` linking tab to panel. Arrow keys move
between tabs; only the active tab is in the tab order.

**Accordion / disclosure.** Trigger is a `<button>` with `aria-expanded` and
`aria-controls`. The visible chevron or indicator must actually change state.

**Drawer / off-canvas panel.** Same trap, Escape, and return-focus rules as a
dialog. Check what it does at mobile width — drawers are frequently designed at
desktop and broken below it.

**Tooltip.** Reachable on focus, not hover alone. Never the only source of
information a user needs — hover-dependent content is invisible on touch. Give
it `role="tooltip"` and reference it with `aria-describedby`.

**Toast.** `role="status"` for informational, `role="alert"` for errors.
Dismissible. Informational toasts may auto-dismiss after enough time to read
them; errors never do.

**Form field.** A real `<label>` with `htmlFor`. Help text linked with
`aria-describedby`. On error: `aria-invalid="true"`, the message linked by
`aria-describedby`, and the message visible next to the field.

**Icon-only control.** An accessible name via `aria-label` or visually hidden
text. Decorative icons beside visible text get `aria-hidden="true"` so they are
not announced twice.

**Image.** Meaningful images get `alt` describing what matters about them.
Decorative images get `alt=""`. Never `alt="image"` or a filename.

**Destructive action.** A confirmation step or an undo path. Undo is usually
better — it does not tax the many correct actions to protect against the rare
wrong one.

---

## Announcing change

Sighted users see a toast appear, a list update, a filter apply. Screen reader
users only learn about it if it is announced.

- `aria-live="polite"` for status updates that can wait for a pause.
- `aria-live="assertive"` or `role="alert"` for errors that interrupt.
- The live region must exist in the DOM before the content changes — a region
  inserted along with its message is not announced.
- Announce the result, not the mechanism: "3 results" rather than "filter
  applied".

---

## Semantic-visual sync

Every ARIA attribute needs a visible counterpart. This is where accessibility
fixes are most often left half-done:

| Attribute | Requires visually |
|---|---|
| `aria-current="page"` | A distinctly styled active nav item |
| `aria-expanded` | A visible open/closed indicator |
| `aria-selected` | A clearly distinct selected style |
| `aria-invalid` | A visible error treatment on the field |
| `aria-busy` | A visible loading state |
| `aria-disabled` | A visibly unavailable control |

Adding the attribute without the style helps one group of users and leaves the
other with a state they cannot see. Check that the new rule actually applies —
a generic `[aria-current="page"]` selector is easily overridden by an existing
class selector.

---

## Testing

Automated tools catch roughly a third of real issues. Run them, then do the
manual pass — the manual pass is where the findings are.

**Automated:** an accessibility linter in the editor, plus axe or Lighthouse in
CI.

**Manual, in this order:**

1. **Tab through the whole interface.** Can you reach everything? Is the order
   sensible? Is focus always visible? Can you escape everything you enter?
2. **Operate the primary flow with the keyboard only.** No pointer at all.
3. **Toggle the OS reduced-motion setting** and reload. Does anything still
   move that should not?
4. **Zoom to 200%.** Does the layout hold, or does content clip and overlap?
5. **Check both themes.** Contrast, borders, focus rings, and shadows in each.
6. **Test on a real touch device.** Target size, gesture conflict with page
   scroll, and safe-area rendering are what emulation does not reproduce.
7. **Run a screen reader through one full flow.** Even a few minutes surfaces
   unlabeled controls and unannounced changes that nothing else catches.
