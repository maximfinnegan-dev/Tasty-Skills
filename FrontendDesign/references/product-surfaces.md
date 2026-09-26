# Product surface depth

Extra depth for the surfaces `design-direction.md`'s surface-type table calls
Product/app and Dashboard: authenticated tools, admin panels, settings,
data-dense screens — anywhere the visitor is mid-task rather than being
persuaded or exploring. Read this alongside that table, not instead of it; this
file is what to do once you know the surface is one of those two rows.

## The product slop test

A brand surface is judged on whether it makes a distinct impression. A product
surface is judged on whether a person who already knows this category of tool
can trust it immediately, or has to pause at every control that is subtly off.
The failure mode here is not flatness — restraint is often correct on a product
surface — it is *strangeness without purpose*: an over-decorated button, a form
control that does not match its neighbors, motion with no state behind it, a
display face where a label belongs. The bar is earned familiarity. Judge product
work by whether the tool disappears into the task, not by how much it stands out.

## Typography

- **One family is frequently the right answer.** Product UI rarely needs a
  display/body pairing the way a marketing surface does — a single well-chosen
  sans can carry headings, labels, body, and data without feeling thin.
- **A fixed `rem` scale usually beats a fluid one.** Product screens are viewed
  at consistent zoom and window size far more than marketing pages are; a
  `clamp()`-sized heading that shrinks because a sidebar opened looks like a bug,
  not responsiveness.
- **Use a tighter scale ratio**, roughly 1.125–1.2 between steps rather than the
  wider jumps that suit a hero. Product interfaces carry more distinct type
  roles on screen at once — label, value, helper text, table header, badge — and
  exaggerated contrast between them reads as noise instead of hierarchy.
- **Prose measure (65–75ch) still applies to anything meant to be read.** Tables
  and compact UI are the exception: a data table can comfortably run past 120ch,
  because it is scanned by column, not read left to right.

## Color

Product color defaults to restrained — see `design-direction.md`'s Color
section for the general case. What a product surface adds:

- **A full, standardized state vocabulary**: hover, focus, active, disabled,
  selected, loading, error, warning, success, info. Build it once and reuse it;
  a product with three different "selected" treatments across its screens reads
  as three different products.
- **The accent is spent on primary actions, current selection, and state
  indicators — never decoration.** A saturated accent used for both "this is
  the button to press" and "this label looks nice here" teaches the user to
  ignore it in the first role.
- **A second, quieter neutral layer for chrome** — sidebars, toolbars, panel
  backgrounds — set slightly cooler or warmer than the main content surface, so
  the workspace and the content inside it read as distinct without a border
  doing all the work.

A single region can still earn a committed, expressive palette — an onboarding
welcome screen, a report a dashboard exists to showcase — but that is the
exception granted deliberately, not the surface's baseline.

## Components and overlays

- Every interactive component ships with default, hover, focus, active,
  disabled, loading, and error treatments before it ships at all — see
  `states-and-a11y.md`'s "The four states" for the general requirement; a
  product surface is where the gap is most visible, because users hit every
  state daily.
- **Skeletons for loading, not spinners floating in otherwise-empty content.**
  A skeleton reserves the shape of what is coming; a spinner reserves nothing
  and the layout jumps the moment content arrives.
- **Empty states teach the interface**, not just announce absence — see
  `onboarding.md` for the fuller treatment of what a good one contains.
- **Overlays must actually escape their container.** A dropdown, popover, or
  menu that is absolutely positioned inside an ancestor with `overflow: hidden`
  or `overflow: auto` gets silently clipped the moment it would extend past that
  ancestor's edge — a bug that only appears once real content pushes it there,
  which is why it survives so many reviews. Reach for the native `<dialog>`
  element, the Popover API, `position: fixed`, or a portal that renders outside
  the clipped ancestor entirely.

## Motion

- Most transitions want 150–250ms — see the `fast` and `normal` steps in
  `motion-system.md`'s token set. A user mid-task is not watching for
  choreography; motion here should confirm and then get out of the way.
- Motion communicates state and nothing else on this kind of surface: a change,
  a load, feedback, a reveal. Decorative motion competes with the task.
- **No orchestrated page-load sequences.** A marketing hero can earn a rehearsed
  entrance; a tool that staggers its own toolbar into view every time it loads
  is asking the user to wait for a show they did not come to see.

## What product surfaces are allowed that brand surfaces are not

`ai-tells.md` flags a platform system font or a platform icon set as a brand
signature to avoid — that guidance is about surfaces trying to establish an
identity. An internal tool or admin panel is not trying to establish one; the
familiar system sans and standard navigation shapes (top bar plus side nav,
breadcrumbs, tabs, a command palette) are the correct default here, because
consistency with every other tool the user already knows beats distinctiveness.
Density is also earned more readily: tables with real row counts and panels with
real label counts are appropriate the moment the user actually needs that much
information visible at once. Save delight for the moments that warrant it, not
every screen — see `onboarding.md`'s guidance on where personality belongs.
