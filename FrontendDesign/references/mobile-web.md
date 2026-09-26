# Mobile web design

Designing for a phone-class touchscreen inside a browser: a mobile site, a
mobile web app, a PWA, or a responsive product where most sessions happen on
a phone.

Read `cross-platform.md` first — safe areas, input parity, adaptive layout,
and installable-web-app guidance all apply here unchanged, and this file does
not repeat them. This file is the layer specific to a phone held in one hand,
inside a browser, with a virtual keyboard and no hover. For animation on
touch — drag versus scroll, safe-area-aware transitions, mobile GPU budget —
see `motion-system.md`'s "Mobile and touch" section, also not repeated here.

**Contents:** [Ergonomics and thumb reach](#ergonomics-and-thumb-reach) ·
[Navigation patterns](#navigation-patterns) ·
[Forms and the virtual keyboard](#forms-and-the-virtual-keyboard) ·
[Content and interaction cost](#content-and-interaction-cost) ·
[Emotional design and the Peak-End Rule](#emotional-design-and-the-peak-end-rule) ·
[Common pitfalls](#common-pitfalls)

---

## Ergonomics and thumb reach

A phone is usually held in one hand, at a viewing distance of a foot or two,
with the other hand free or occupied — and the person switches apps and
tasks far more often and for shorter bursts than they would at a desk. Design
for short, interruptible sessions rather than assuming sustained attention.

**The thumb zone is the bottom third of the screen**, roughly a thumb's arc
from wherever the phone is being held. Primary actions belong there —
sticky bottom bars, primary buttons anchored low — because that is what's
comfortable to reach repeatedly without adjusting grip. Content that only
needs to be *seen*, not tapped often — page titles, back navigation, status —
tolerates the top of the screen, since a glance costs nothing but a reach
does.

**Scanning still tends to follow reading order** (top to bottom, leading to
trailing edge), so hierarchy and F-pattern reasoning from
`design-direction.md` still apply to how content is laid out. What changes
on mobile is where the *action* goes, not where the *eye* goes first — a
screen can be read top-down and still put its primary button at the bottom.

---

## Navigation patterns

**A bottom tab bar suits three to five top-level destinations.** It is the
convention people already carry in from every other app (Jakob's Law — see
`ux-foundations.md`), it sits inside the thumb zone, and it keeps every
top-level destination one tap away. If the product needs more than about
five top-level sections, that's a sign the information architecture needs
revisiting, not a reason to add a sixth tab.

**Treat a hamburger menu as a last resort for primary navigation, not a
default.** It hides every destination behind one extra tap and gives no
visual hint of what's inside, which costs more than the header space it
saves. Reach for it for genuinely secondary, low-frequency items — not for
the two or three things people actually came to do.

**Headers stay minimal:** a title, a back or close action, and at most one
primary action. A header crowded with icons is also the part of the screen
farthest from the thumb, so every icon added there is one the user has to
stretch or re-grip for.

**Choose the right weight of interruption for a secondary action** — a
bottom sheet keeps the user oriented on the current screen for a choice that
doesn't need full attention; a full modal is for something that genuinely
needs it, like confirming a payment or an irreversible action. This is the
mobile-specific case of the feedback-weight table in `cross-platform.md`;
default to the lighter option and reserve the modal.

---

## Forms and the virtual keyboard

A phone's on-screen keyboard is chrome that a desktop form never has to
account for, and it changes what "usable" means for an input field.

- **Set `type` and `inputmode` to match the data** — `email`, `tel`, `url`,
  `numeric` — so the OS shows the right keyboard layout instead of the
  general-purpose one. This is free correctness that most forms skip.
- **Use real `autocomplete` values** (`name`, `email`, `tel`,
  `street-address`, `cc-number`, and so on) so the browser or password
  manager can fill the field without the user typing at all.
- **Keep input font size at 16px or larger.** Below that, iOS Safari
  auto-zooms the page on focus, which then has to be manually zoomed back
  out — a jarring, avoidable interruption in the middle of filling out a
  form.
- **Never disable pinch-to-zoom** (`user-scalable=no`, or a `maximum-scale`
  that blocks zooming). Some people need it to read or target accurately, and
  removing it is a genuine accessibility regression, not a polish choice.
- **Keep the field and its submit action visible above the keyboard.** A
  submit button that scrolls out of view the moment the keyboard opens is a
  dead end; see `cross-platform.md`'s "the keyboard is chrome too."
- **Put the error next to the field it belongs to**, not collected at the
  top of a long form the keyboard is currently covering half of.

---

## Content and interaction cost

**Expose before you hide, when there's room.** Every tap, menu, or
disclosure step between a user and the content they want is a small cost
that a longer, more scrollable screen often avoids entirely. Hiding content
behind an interaction makes sense when the screen genuinely doesn't have
room, not as a default tidiness move.

**Match the input control to the input, not the trend.** A slider or a
wheel picker suits a coarse, one-time choice (an age range, a rating); a
text field suits anything precise or anything entered repeatedly. A slider
used for exact or frequent data entry is slower and less accurate than
typing, however clean it looks.

**An empty state is the best onboarding surface a product has** — see
`states-and-a11y.md`'s "The four states" for the general version. On mobile
specifically, it's often the *first* screen a new user sees in a given
section, so treat it as a chance to explain what belongs there and offer the
action that fills it, not as a placeholder to fill in later.

**Search should never open blank.** Recent searches, popular or trending
items, or personalized suggestions all give a new search screen something
useful to show before the user has typed anything.

**Personalize by how much the person has used the product**, not just who
they are: a first-time flow should ask for and show less than a returning
user's, and a frequent user benefits from density and shortcuts that would
overwhelm someone on their first visit.

---

## Emotional design and the Peak-End Rule

None of this is exclusive to mobile — it applies to any product experience
with a beginning, a middle, and an end. It's grouped here because mobile
flows tend to have unusually clear edges (open the app, do the one thing,
close the app), which makes the effect easy to design for deliberately.

**The Peak-End Rule** (from Daniel Kahneman's research on remembered
experience): people don't judge an experience by its average moment, they
judge it by its most intense point and its final moment. Two consequences
worth designing for directly:

- **Pick one peak deliberately.** After a real accomplishment — completing
  the core task, hitting a milestone, finishing a first-time setup — a
  small, well-timed moment of feedback (a personalized summary, a bit of
  motion, a specific piece of copy rather than a generic confirmation) does
  more for how the whole flow is remembered than evenly distributing that
  effort across every screen.
- **Design the ending on purpose.** Don't let a flow just stop. Close it
  with a summary of what happened, an affirmation of progress, or a clear
  next step — an abrupt or silent ending is what a user remembers even when
  everything before it went well. This also applies in reverse: a wait
  screen, an error, or a long form is a *negative* peak, so put real design
  effort into those moments specifically rather than treating them as
  afterthoughts.

**Emotional feedback costs little and reads as considered.** The functional
information in "success" and "here's your personalized weekly summary, you
did most of your work after 9pm" is nearly identical; the second version
treats the achievement as belonging to the person rather than the system,
and that reframing is often the entire difference between a notification
that feels earned and one that feels generic.

**Consistency compounds into habit.** Every screen that follows the same
interaction logic as the last one makes the product feel more predictable
and lowers the effort of using it again — which matters more, over time,
than any single polished moment. A product that is delightful once but
inconsistent everywhere else loses to one that is merely consistent.

---

## Common pitfalls

- **Primary call to action placed outside the thumb zone** — technically
  reachable, consistently avoided in practice.
- **A header crowded with secondary actions** — the hardest part of the
  screen to reach one-handed, used for the things people need least.
- **Only the happy path is designed.** The screen looks finished in a static
  mockup and ships visibly broken the first time a request is slow or a list
  is empty.
- **Hamburger menu as the default answer** to "where does navigation go,"
  rather than a considered choice for genuinely secondary items.
- **Content hidden behind more taps than the screen actually required,**
  when there was room to show it directly.
- **A generic empty state** with no explanation and no next action.
- **A slider or wheel picker standing in for precise or frequent input,**
  because it looked simpler in the design file than a text field did.
- **A layout approved after testing on exactly one screen size.** Edge
  crowding, text wrap, and bottom-safe-area collisions show up on the
  screens that weren't tested, not the one that was.
- **Every element carrying the same visual weight,** so nothing leads and
  the user has to read the whole screen to find the one thing that matters.
