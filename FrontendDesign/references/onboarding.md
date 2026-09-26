# Onboarding and activation

Getting a new user to the moment that proves the product is worth their time,
and teaching the rest of the interface after that moment rather than before
it. `states-and-a11y.md` owns what an empty state must contain in general;
`mobile-web.md` owns the Peak-End rule for how a flow is remembered. This file
is the layer between them: the shapes onboarding takes, and where personality
and teaching belong across a user's first sessions.

**Contents:** [The job](#the-job) · [Principles](#principles) ·
[The shapes it takes](#the-shapes-it-takes) ·
[Five kinds of empty state](#five-kinds-of-empty-state) ·
[What breaks onboarding](#what-breaks-onboarding) ·
[Measuring it](#measuring-it)

---

## The job

Onboarding's job is not to teach the product. It is to get a person to the
moment that proves the product is worth their time, as fast as honestly
possible. Teaching everything up front optimizes for the wrong thing — a
person who has seen every feature explained but has not yet done anything real
has not been onboarded, they have sat through a demo.

## Principles

- **Show, don't tell.** Real functionality inside the flow, not a separate
  tutorial mode running parallel to the actual product. A sandboxed "practice
  version" that is not the real thing teaches a slightly wrong interface.
- **Make it skippable.** A returning-category user should be able to opt out
  entirely. Do not block access to the product behind a flow that a capable
  user does not need.
- **Front-load only what unlocks value.** Teach the 20% that gets someone to
  their first real result; save the rest for the moment it is actually needed.
- **Context over ceremony.** An empty state, a tooltip anchored to the exact
  control it explains, or a badge on an unused feature teaches more, at a
  lower cost, than a welcome-screen paragraph read once and never referenced
  again.

## The shapes it takes

| Shape | Use when | Keep it to |
|---|---|---|
| **Welcome + setup + first success** | A genuinely new product category, or an account that needs minimum real configuration before anything works | Minimal required fields, one to three core concepts, a guided path to one real, completed action |
| **Contextual teaching** | Ongoing feature discovery after the first session | A tooltip anchored to the control, shown once, dismissible, never repeated after dismissal |
| **Guided tour** | A genuinely complex interface, or a significant change to one users already knew | 3–7 steps, skippable, replayable from a help menu, framed around a workflow ("create a project") rather than a feature ("this is the project button") |
| **Interactive tutorial** | High-stakes or unfamiliar concepts that benefit from practice before real use | A sandbox with real sample data, a stated objective, and a clear graduation moment when it ends |

Welcome-screen setup should ask for the minimum needed to function, explain
briefly why anything non-obvious is being asked, and prefer a smart default
over a question wherever one exists. Every additional required field before
first value is a chance to lose someone who has not yet seen why the product
is worth the information.

## Five kinds of empty state

`states-and-a11y.md` already requires that an empty region say what belongs
there and offer the action that fills it. In practice an "empty" state is
rarely one thing — it is one of five, and each wants a different tone:

- **First use.** Never used this feature. Emphasize the value, offer a
  template or example to start from rather than a blank form.
- **User-cleared.** Intentionally emptied — everything was deleted on
  purpose. A light touch; this person already knows what belongs here and
  does not need it re-explained, just an easy way back in.
- **No results.** A search or filter matched nothing. Suggest a different
  query or offer to clear the filter; never present this identically to
  "nothing has ever been here."
- **No permission.** Present but inaccessible. Say why, and how to request
  access if that path exists.
- **Error.** Failed to load. Say what happened in plain language and offer a
  retry — see `states-and-a11y.md`'s Error entry for the full treatment.

Treating all five as one generic "nothing here" state is a common miss: a
no-results state that looks identical to a genuine first-use state tells a
searching user nothing about whether to adjust their query or give up.

## What breaks onboarding

- Forcing a long flow before any real product use is possible.
- Repeating a tooltip or hint after the user has already dismissed it.
- A tutorial mode disconnected from the real product, so what gets learned
  does not quite match what shipping the interface actually does.
- Showing first-time onboarding to a returning user — track completion and
  respect it.
- Patronizing explanation of a pattern the audience already knows from every
  other product in the category — see `ux-foundations.md`'s Jakob's law entry.

## Measuring it

Time-to-first-value, completion rate, and skip rate are the three signals
worth tracking. A low completion rate usually means the flow is too long or
the payoff is not obvious yet — the fix is almost always cutting steps, not
adding more explanation to the steps that remain. A high skip rate among
users who then struggle later is a sign the skipped content should have been
contextual instead of upfront, not that skipping should be harder to reach.
