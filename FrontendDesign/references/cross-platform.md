# Cross-platform design

Interfaces run on phones, tablets, laptops, desktops, TVs, watches, headsets,
and inside other people's windows. This file carries what transfers across all
of them — and the rule that keeps your work looking like your product rather
than like someone else's operating system.

**Contents:** [Aesthetic neutrality](#aesthetic-neutrality) ·
[Adaptive layout](#adaptive-layout) · [System chrome and safe areas](#system-chrome-and-safe-areas) ·
[Input parity](#input-parity) · [Focus and directional navigation](#focus-and-directional-navigation) ·
[Viewing distance and glanceability](#viewing-distance-and-glanceability) ·
[Navigation and state](#navigation-and-state) ·
[Permissions](#permissions) · [Feedback weight](#feedback-weight) ·
[Installable web apps](#installable-web-apps) ·
[When you are genuinely building native](#when-you-are-genuinely-building-native)

---

## Aesthetic neutrality

**Take the practices, never the appearance.** Platform design systems encode
decades of research into how people perceive, reach, and recover from mistakes.
That research transfers. Their visual identity does not — it belongs to Apple
and Google, and borrowing it makes your product look like a clone of a system
app rather than like itself.

Do not reproduce these unless the user explicitly asks for a native app on that
platform:

| Do not reach for | Because |
|---|---|
| System typefaces as a design choice (SF Pro, New York, Roboto, Roboto Flex, Google Sans, Segoe) | These read as "an OS made this". Choose a typeface for your product. `system-ui` in a font stack for genuine performance reasons is a different thing and is fine. |
| System icon sets as a brand element (SF Symbols, Material Symbols/Icons) | Same. One icon library chosen for your product, at a consistent stroke weight. |
| Material color role names and dynamic-color/seed extraction | Your design system defines your palette. Wallpaper-derived theming is a platform feature, not a design method. |
| The Material shape scale, elevation dp ladder, ripple, FAB, snackbar look, navigation rail or drawer chrome, top app bar chrome | These are Material's signature marks. The underlying ideas — layering, state feedback, a persistent primary action — transfer; the look does not. |
| Cupertino signatures: inset grouped lists, large-title collapsing headers, translucent frosted bars, the iOS toggle and segmented control, iOS alert styling, traffic-light window buttons | Same reasoning. |
| Platform blur and vibrancy materials as a default surface treatment | Glass is a deliberate choice for at most one element class. See "Materiality" in `design-direction.md`. |
| Platform-shaped navigation as the automatic answer — a bottom tab bar because phone, a hamburger because Android, a sidebar because desktop | Pick navigation from the information architecture and the input methods available, not from a platform idiom. |

**What this leaves you.** Every rule in the rest of this file, every
accessibility guideline, every ergonomic minimum, and every interaction
convention users have genuinely learned — back means back, Escape closes,
a destructive action confirms. Those are not Apple's or Google's. They are how
people work.

**Conventions users have learned are not aesthetics.** Honoring the platform
back gesture, the system text-size setting, or the reduced-motion preference
does not make your interface look like that platform. It makes it work there.
Never skip those in the name of neutrality.

---

## Adaptive layout

**Lay out for the space you have, never for the device you guess you are on.**
Device-named breakpoints are wrong the moment a window is resized, a tablet
enters split view, a phone unfolds, a browser opens a side panel, or someone
puts two windows side by side.

- **Name breakpoints for what changes**, not for hardware: the width where a
  single column gets cramped, where a second column fits, where a sidebar and
  content coexist. Content decides the number; the device never does.
- **Prefer container queries to viewport queries** for components. A card
  should respond to the space it is in, so the same card works in a wide main
  column and a narrow sidebar without a variant prop.
- **Prefer fluid sizing to breakpoints** where it works. `clamp()`, `min()`,
  and `max()` remove whole classes of breakpoint bugs.
- **Never assume you own the viewport.** Your interface may be running in half
  a screen, in a resized window, in an embedded frame, or beside another app.
  Handle a resize mid-session without losing state or scroll position.
- **Constrain measure on wide screens.** Content stretched to 2000px is
  unreadable. Cap the text column and let the surrounding space be space.
- **Reflow, do not scroll sideways.** Content must work at 320px wide without
  horizontal scrolling. Long words and URLs wrap; wide tables scroll inside
  their own container, never taking the page with them.
- **Layout must survive an unexpected resize.** Test by dragging the window
  slowly across every breakpoint — that is where the jumps and clipped
  elements are.

The multi-pane instinct is the one worth borrowing from tablet and desktop
guidelines: when there is room for a list and a detail together, show both
rather than making the user navigate back and forth. When there is not, the
same content becomes a stack. One information architecture, two presentations.

---

## System chrome and safe areas

Every platform reserves parts of the screen you do not control: notches and
camera housings, home indicators and gesture bars, status bars, browser
address bars that appear and disappear, on-screen keyboards, TV overscan
margins, and window controls.

- **Inset for it rather than guessing.** On the web that is
  `env(safe-area-inset-*)`; use `max()` against your own padding so you never
  end up with less spacing than you designed:
  `padding-bottom: max(1rem, env(safe-area-inset-bottom))`.
- **Anything fixed to an edge needs this.** Bottom bars, sheets, toasts,
  floating actions, and sticky headers are exactly the elements that land under
  system chrome.
- **Use dynamic viewport units** (`dvh`) for full-height surfaces, so a sheet
  does not resize as a browser address bar hides.
- **Keep interactive content out of physical discontinuities** — a fold, a
  hinge, a display seam.
- **Assume an edge margin on TV-class displays.** Overscan is still real;
  content at the literal edge can be cut off.
- **The keyboard is chrome too.** When it opens, the focused field must remain
  visible and the submit action must remain reachable.

---

## Input parity

The single most transferable idea across every platform guideline: **every
action must be reachable by every input the surface supports.** One input
method is never a prerequisite for using the product.

| Input | Requires |
|---|---|
| Touch | Targets at 44px, adequate spacing, no hover dependency |
| Mouse / trackpad | Hover states, right-click where a context menu is expected, precise targets can be smaller but not below 24px |
| Keyboard | Everything reachable and operable, visible focus, logical order, Escape and Enter behaving conventionally |
| Directional pad / remote | Predictable focus movement, unmistakable focus indicator, no reliance on pointing |
| Assistive technology | Accessible names, roles, states, and announced changes |
| Voice control | Visible labels that match accessible names, so "click Save" works |

Practical consequences:

- **Hover is an enhancement, never a carrier.** Nothing essential may live
  behind hover alone. Pair every hover affordance with focus, and give
  hover-revealed content a tap or click path.
- **Wrap hover-only effects** in `@media (hover: hover)` so touch devices do
  not inherit a stuck state after a tap.
- **Gestures need alternatives.** Anything driven by drag, swipe, pinch, long
  press, or a path must also be doable with a plain single tap or click — a
  visible button, a menu item, or a keyboard command. This is a WCAG
  requirement, and it is also what makes a feature discoverable at all.
- **Never override reserved system gestures or shortcuts.** Back swipes, edge
  swipes, browser back and forward, the platform's own keyboard shortcuts.
  Users will use them; you will lose.
- **Desktop-class surfaces deserve keyboard shortcuts** for genuinely frequent
  actions — and those shortcuts have to be discoverable, in a menu or a help
  overlay, or they may as well not exist.
- **Detect capability, not device.** A tablet may have a keyboard and trackpad
  attached; a laptop may have a touchscreen. Support what is present rather
  than what the form factor implies.

---

## Focus and directional navigation

On keyboards, remotes, and D-pads, focus *is* the pointer. Everything the user
knows about where they are comes from it.

- **Exactly one thing is focused**, and it is unmistakable — not a subtle tint.
  On a distant display it must be visible across the room.
- **Movement is predictable and spatial.** Pressing right moves to the thing
  visually to the right. When DOM order and visual order diverge, focus
  order follows the DOM and the user gets lost; fix the DOM rather than
  patching with `tabindex` numbers.
- **Focus never gets trapped** anywhere except an open modal, and never
  vanishes. Removing the focused element moves focus somewhere sensible
  nearby, not to the document body.
- **Scrolling follows focus.** Moving focus to an off-screen element brings it
  into view, clear of any sticky header or footer that would obscure it.
- **Focus survives navigation.** Entering a view moves focus somewhere
  meaningful; going back returns it to where the user left.

---

## Viewing distance and glanceability

The same interface is read at arm's length on a phone, at a metre on a laptop,
across a room on a TV, and in a two-second glance on a watch. Sizing is a
function of distance, and density is a function of attention.

- **Scale type and targets with distance.** What is comfortable at 40cm is
  unreadable at 3m. On a distant display, raise minimum text size and target
  size well above the desktop floor and increase contrast.
- **Some surfaces are glanced at, not read.** A watch face, a notification, a
  status widget, a dashboard tile on a wall display: one primary datum,
  large, with everything else clearly secondary or absent. If it cannot be
  understood in about two seconds, it is the wrong content for that surface.
- **Do not port density between distances.** A dense desktop table shown on a
  TV is unusable; a phone layout stretched to a desktop is empty. Same
  information, different composition.

---

## Navigation and state

- **Back must be predictable.** It goes to where the user came from, never
  somewhere clever. On the web, that means real URLs and working browser
  back and forward.
- **The URL reflects the state** worth returning to: the open tab, the active
  filter, the current page of results. If a state is worth sharing or
  bookmarking, it belongs in the URL.
- **Preserve state across navigation.** Returning to a list restores scroll
  position and any filters that were applied. Losing them is one of the most
  common and most irritating failures in app-like interfaces.
- **Say where the user is.** An active navigation state, and breadcrumbs in a
  deep hierarchy.
- **Cap navigation depth.** If reaching a common task takes more than about
  three levels, the architecture is wrong, not the navigation component.
- **Onboarding is at most a few screens and always skippable.** Better still,
  teach in context at the moment the feature is first used.

---

## Permissions

Applies equally to a web app asking for location, camera, or notifications and
to a native app asking for anything.

- **Ask at the point of need**, not on launch. A permission request with no
  visible context is denied, and denials are hard to reverse.
- **Explain before the system prompt.** Say what the feature does with the
  access and what the user gets. The system dialog cannot be customized, so
  the explanation has to come first, in your own UI.
- **Degrade gracefully on denial.** The product keeps working with that feature
  unavailable, and there is a clear path to enable it later. Never block the
  app behind a permission that is not genuinely essential.
- **Ask for the least you need**, and prefer an API that does not require a
  permission at all where one exists.
- **Do not require an account** for functionality that does not need one.

---

## Feedback weight

Match the interruption to the cost of the thing that happened. Platform
guidelines converge hard on this, and interfaces get it wrong in both
directions.

| Weight | Use for | Form |
|---|---|---|
| None | Routine, obviously successful actions | The result itself is the feedback |
| Inline | Validation, per-item status, contextual results | Text or an icon beside the thing |
| Transient | Completed background work, undoable actions | A toast, dismissible, with the undo |
| Persistent | Something that needs a decision or blocks progress | A banner or inline block that stays |
| Modal | Genuinely destructive, irreversible, or safety-critical | A dialog, used rarely |

A modal dialog for a routine confirmation trains users to dismiss dialogs
without reading them, which is exactly the habit you need them not to have
when a real one appears. Prefer undo over confirmation wherever the action can
be reversed — it does not tax the many correct actions to guard against the
rare wrong one.

Where the platform offers haptics, pair them with visual feedback rather than
using them alone, and keep them for meaningful moments.

---

## Installable web apps

When a web app is meant to be installed and used like a native one:

- **A complete manifest**, linked from the document head, with name, short
  name, start URL, scope, display mode, theme and background colors, and icons
  at the required sizes including a maskable variant. Missing fields silently
  prevent the install prompt rather than erroring.
- **`theme_color` and `background_color`** matched to your design system's
  values for both themes, so the launch and system chrome do not flash a color
  from someone else's palette.
- **A service worker** with a deliberate caching strategy, an offline fallback
  page, and a story for how updates reach an already-installed client.
- **Display mode chosen honestly.** `standalone` removes browser chrome, which
  also removes the back button — so in-app navigation must be complete before
  you claim it.
- **Everything above still applies.** Installed does not mean it should
  imitate a platform's native look; it means it should work when launched
  from a home screen.

---

## When you are genuinely building native

If the request really is a native app for one platform — SwiftUI, Jetpack
Compose, or similar — then platform conventions stop being borrowed practice
and become requirements, and this skill is the wrong tool for the
platform-specific layer. Say so, and go to the platform's own guidelines for
component behavior, system integration, and store requirements.

What still applies from here: the design direction work, the hierarchy and
typography discipline, the state coverage, the accessibility floor, and the
motion principles. What does not: the React and web-specific implementation
throughout the rest of this skill.
