# UX foundations

Named principles from psychology and perception that explain *why* the moves
elsewhere in this skill work. Nothing here is mobile-specific — it applies to
any surface, on any device, at any density.

Read this when a brief is ambiguous and you need a principle to decide by,
when an audit finding needs more grounding than "this feels off," or when
someone asks you to justify a call in terms they'll accept from a design
system rather than from taste. The rest of this skill already operationalizes
most of these as concrete rules; where it does, the entry below points at the
file that carries the number.

**Contents:** [Attention and emphasis](#attention-and-emphasis) ·
[Grouping and structure](#grouping-and-structure) ·
[Decisions and choice](#decisions-and-choice) ·
[Memory and cognitive load](#memory-and-cognitive-load) ·
[Motivation and completion](#motivation-and-completion) ·
[Familiarity, expectation, and trust](#familiarity-expectation-and-trust)

---

## Attention and emphasis

**The aesthetic-usability effect.** People perceive a visually pleasing
interface as *more usable* than it actually is, and forgive minor friction in
it that would sink an ugly equivalent. This is not license to skip usability
work — a beautiful shell around a broken flow still fails, just later and more
expensively, when the honeymoon wears off. It does mean that visual polish and
usability compound rather than trade off, which is the whole argument for
spending real effort on both.

**The Von Restorff effect (isolation effect).** The one item that looks
different from its neighbors is the one people remember and notice. Use this
deliberately — a single differentiated element per group draws the eye — and
sparingly, because the effect disappears the moment two things compete for
being the exception. See `design-direction.md`'s Hierarchy section for how
this becomes "one primary action per region."

**Selective attention.** People filter out anything that doesn't look
relevant to their current goal, which is why banner-shaped content gets
ignored regardless of what it says ("banner blindness") and why a change that
happens outside the area someone is looking at can go completely unnoticed
("change blindness"). Consequence: don't style anything you need seen like an
ad, and don't rely on a peripheral or simultaneous visual change to
communicate something important — pair it with a location the user is already
looking at, or move their attention there first.

---

## Grouping and structure

The classical Gestalt grouping principles. `design-direction.md`'s Layout
section already states the practical version of most of these as "proximity
encodes relationship" and "structure should encode something true" — this is
the perceptual reasoning underneath.

**Proximity.** Elements placed close together read as related, regardless of
whether they actually are. This is the single most load-bearing grouping tool
available: correct spacing communicates structure before a user reads a word
of the content.

**Common region.** A shared visual boundary — a border, a background tint, a
card — reads as stronger grouping than proximity alone, because it makes the
boundary of the group explicit rather than inferred. Reach for it when
proximity alone leaves the grouping ambiguous, not as a default container for
everything (see "Cards are earned" in `design-direction.md`).

**Similarity.** Elements that share color, shape, size, or style read as
belonging to the same category or having the same function, even when spaced
apart. This is why every link needs to look different from every non-link,
consistently, everywhere it appears — inconsistent styling of a functional
category is read as multiple categories.

**Uniform connectedness.** A literal connector — a line, a shared background,
a bounding shape — creates a stronger perceived relationship than color or
shape similarity alone. Useful for showing that a label belongs to a specific
data point, or that a control operates on a specific piece of content, without
adding another sentence of explanation.

**The law of prägnanz (simplicity).** People resolve ambiguous or complex
visual information into the simplest interpretation available, automatically.
An interface that presents a genuinely simple structure gets read correctly at
a glance; one that is simple in principle but visually cluttered gets
misread, because the eye simplifies what it's given rather than what was
intended.

**The serial position effect.** People recall the first and last items in a
sequence far better than anything in the middle. Put the option you most want
noticed, or the action you most want taken, at one of the two ends of a list
or a navigation bar — not buried in the middle where memory is weakest.

---

## Decisions and choice

**Hick's law.** The time it takes to decide grows with the number and
complexity of the options presented, not linearly but sharply. Cutting choices
is almost always faster than helping people compare more of them: break a
complex decision into a short sequence of simpler ones, surface a sensible
default or a "recommended" option, and hide advanced choices behind
progressive disclosure rather than presenting everything at once.

**Choice overload.** A large option set doesn't just slow the decision down
(Hick's Law) — past a point it degrades satisfaction with whatever gets
chosen, because people can't stop wondering about what they didn't pick.
Curated shortlists, comparison views for the options that most need
comparing, and filtering tools that narrow before the user has to scan beat
presenting the full catalog up front.

**Occam's razor (as a design heuristic).** Between two designs that solve the
problem equally well, prefer the one with fewer moving parts, not the one
with more features. Every element you keep should be justified by something
it does for the user; if two elements do the same job, one of them is
overhead.

---

## Memory and cognitive load

**Miller's law and chunking.** Working memory holds a small number of items
at once — commonly cited as seven, plus or minus two, though the real number
is lower and context-dependent. The practical move isn't to obey "seven" as a
magic ceiling; it's chunking: group related pieces of information into
labeled clusters so the user tracks a handful of categories instead of a long
flat list of facts.

**Cognitive load.** Every piece of information a user has to hold, compare, or
remember while using an interface taxes a limited resource. Load that's
intrinsic to the task (remembering their own goal) is unavoidable; load that
comes from the interface itself — unclear labels, inconsistent patterns,
decorative noise — is pure overhead and the first thing to cut when a flow
feels effortful for no clear reason.

**Working memory in practice.** People recognize something they've seen
before far more reliably than they can recall it unprompted. Put the burden
of memory on the interface, not the user: keep information visible across
steps instead of asking someone to hold it in their head between screens
(comparison tables, order summaries, a visible running total), and visually
distinguish what's already been seen or done from what hasn't.

**Mental models.** People carry an internal, often-wrong model of how a
system works, built from every similar thing they've used before, and they
apply it to anything that looks similar. Closing the gap between the
interface's actual behavior and the model a user brings to it — through
familiar patterns and interactions that behave the way they look like they
should — is most of what "intuitive" means. See `ai-tells.md` and
`design-direction.md` for what happens when a design fights this instead.

**Cognitive bias, generally.** People don't evaluate an interface from
neutral first principles; they bring existing shortcuts and blind spots,
including confirmation bias toward whatever they already expected to see.
This mostly matters for how you *test* a design rather than how you build it:
don't trust your own read of your own work, and treat surprising negative
feedback as more informative than confirming feedback, not less.

---

## Motivation and completion

**The goal-gradient effect.** Motivation to finish a task increases the
closer someone gets to the end — real or perceived. A visible, moving
progress indicator (even a slightly generous one) increases completion rates
because it makes the remaining distance feel shorter, which is also why
giving someone a small head start on a multi-step task (two of ten steps
already checked off) measurably improves follow-through.

**The Zeigarnik effect.** An unfinished task stays in mind more persistently
than a finished one. This cuts two ways: a visible "continue where you left
off" affordance uses that persistence productively, while a flow that never
gives a clear sense of completion leaves the user mildly unsettled even after
they've technically finished — which is the underlying reason a flow needs a
deliberate, designed ending (see the Peak-End Rule in `mobile-web.md`'s
emotional design section — it isn't a mobile-only idea, but that's where this
skill's worked example of it lives).

**Tesler's law (conservation of complexity).** Every process has an
irreducible core of complexity that has to be handled by either the system or
the user — it can be moved, but not designed away entirely. The job is making
sure the system absorbs as much of that complexity as it can, rather than
building for an idealized user who will read the documentation and never make
a mistake.

**The Pareto principle.** A small fraction of an interface's features or
paths accounts for most real usage. Spend disproportionate design effort
there — the primary flow deserves more iteration than the settings page — and
resist the pull to give every feature equal polish.

**Parkinson's law, applied to tasks.** A task expands to fill however much
time is available for it. If a flow feels slower than it needs to, look for
places where the interface itself is setting the pace unnecessarily — an
animation gating input, a multi-page form that could be one page, a
confirmation step that doesn't need to exist — rather than assuming users are
simply being deliberate.

---

## Familiarity, expectation, and trust

**Jakob's law.** People spend most of their time on other products, and they
bring those products' conventions with them. A checkout flow, a settings
screen, or a search bar that matches the shape of ones people already know
gets used correctly on the first try; deviating from convention has to buy
something real, because it costs relearning every time. This is the reasoning
behind `cross-platform.md`'s aesthetic-neutrality rule — borrow the
convention, not the appearance.

**The Doherty threshold.** Below roughly 400ms of response latency, an
interface feels like it's keeping pace with the person using it; above it,
attention starts to drift and perceived quality drops sharply, largely
independent of whether the delay is really necessary. Where a real wait can't
be avoided, perceived performance — a skeleton, a progress indicator, an
optimistic UI update — closes most of the gap. See the four-state coverage in
`states-and-a11y.md` for the concrete version of this.

**Fitts's law.** The time it takes to reach and hit a target is a function of
its size and its distance from the current point of focus — bigger and closer
is faster and more accurate, smaller and farther is slower and more
error-prone. This is the reasoning behind every touch-target and
click-target minimum in this skill; see `states-and-a11y.md`'s Touch targets
section and `cross-platform.md`'s Input parity section for the actual
numbers.

**Flow.** People do their best work in a state of energized focus that
requires the task's difficulty to roughly match their skill — too hard and
they disengage from frustration, too easy and they disengage from boredom.
An interface supports flow by giving clear, immediate feedback on every
action and clearing away friction that has nothing to do with the task
itself, so the difficulty a user experiences is the task's, not the
interface's.

**Postel's law (the robustness principle).** Be liberal in what you accept
from a user and conservative in what you commit to sending back. Accept
messy, varied input — phone numbers with or without punctuation, dates in
more than one format — normalize it quietly, and give clear, well-formed
feedback in return. See "tolerance and forgiveness" in `audit.md`'s
usability-principle table for the audit-time version of this.

**The paradox of the active user.** People consistently start using
something immediately rather than reading instructions first, even when
reading first would save them time overall — and this isn't a user failure to
design around, it's close to universal behavior. Guidance that only exists in
a manual or an onboarding carousel someone can skip past will be missed by
most people who'd benefit from it; put it in context, at the moment it's
needed, instead.
