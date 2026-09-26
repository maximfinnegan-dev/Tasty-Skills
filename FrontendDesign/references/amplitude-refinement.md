# Amplitude refinement

Technique for a specific, common request: an interface already exists, and the
ask is to turn its expressive intensity up or down without rebuilding it —
"make this feel more polished," "why does this feel cheap," "this section falls
flat," "tone this down," "clean up the hero." This is different work from
[setting the three dials](../SKILL.md#2-set-the-three-dials), which calibrates
intensity *before* anything is built. Here, something real already exists, has
a system, and has conventions; the job is to move one axis of it deliberately
without disturbing the rest.

**Contents:** [Scope discipline](#scope-discipline) ·
[Turning it up](#turning-it-up) · [Turning it down](#turning-it-down) ·
[What holds regardless of direction](#what-holds-regardless-of-direction)

---

## Scope discipline

"Bolder" or "quieter" almost always names a target — a section, a component, a
page — and everything outside it is implicitly "leave alone." Treat that as
literal. Do not restyle neighboring sections, migrate the page to a new
direction, or introduce a color, font, radius, or shadow the surface does not
already own to make the target's new intensity work. If the existing system
genuinely cannot express the requested change, say so and ask what to add,
rather than quietly extending the system on the target's behalf — an unasked
addition here is exactly how a coherent system drifts one exception at a time.

## Turning it up

A section usually reads flat for a specific, diagnosable reason: it is quietly
opting out of a move the rest of the page already makes. Look at what the
surface's other sections do that this one does not — display type at full
scale, the structural device that carries meaning elsewhere, the signature
motif, the pacing. The most reliable fix brings the flat section up to the
expressive level its neighbors already reach, in the system's existing
vocabulary, rather than inventing a new one for it.

**The skeleton test.** Strip the copy out of the section you are about to change
and look at the bare structure. Does it still communicate what the section is
and why it matters, through hierarchy and the system's own devices alone? If it
only works once the words come back, the intended boldness is living in font
size, not in the design — go back and give the structure the job.

**Commit, then let everything else go quiet.** Half-measures read as noise: if
every element in the section got a little louder, the section reads flatter
than before, not bolder. Make one decisive move completely — a real scale jump,
a real material change, a real break in the page's rhythm — and let the rest of
the section recede so that move is legible. A section that is unmistakably
still the same product, just more sure of itself, is the target; a section that
looks like a different brand pasted in is scope creep.

## Turning it down

Quiet is the harder direction, because subtlety without precision collapses
into generic — "tone this down" does not mean "make this boring," it means
sophistication through restraint, and restraint still has to be deliberate.

**Color.**
- Pull saturation back toward roughly 70–85% of where it was rather than to
  zero; a fully desaturated accent has stopped doing its job.
- Shift toward tinted, not pure, grays — a warm or cool tint reads as
  considered where flat gray reads as an afterthought.
- **Never set gray text on a colored surface.** Use a darker or lighter shade of
  that surface's own hue, or a translucent version of the foreground color,
  instead — gray dropped onto a hue looks like a mistake, not restraint.

**Type and weight.** Step weights down rather than eliminating hierarchy — 900
to 600, 700 to 500 is usually enough to lower the temperature while keeping the
scale legible. Removing all weight contrast is a different failure: everything
reading as the same importance.

**Motion.** Shorten travel distances (40px down to 10–20px) and lean on a
gentler deceleration curve; drop bounce or elastic easing entirely in this
direction. Cut any animation that is purely decorative rather than reducing
every animation's amplitude equally — a quieter interface can still afford
motion that communicates state.

**Surface decoration.** Remove gradients, layered shadows, and heavy borders
that are not doing hierarchy or functional work before touching anything else;
this alone resolves most "too loud" complaints. A single well-placed shadow or
border that does carry meaning should survive the pass.

**What quieter does not mean:** flattening all hierarchy so nothing stands out,
removing color entirely, or making every element small and light with no anchor
left. A quiet interface still needs one element the eye lands on first — see
`design-direction.md`'s Hierarchy section for the underlying principle. The
result should read as restrained on purpose, not as an earlier draft.

## What holds regardless of direction

- **Existing factual claims and copy are in scope only if the user supplied
  replacements.** Amplitude work is not a license to rewrite content.
- **Every non-negotiable in `SKILL.md` still applies** — contrast, focus
  visibility, touch targets, and the rest do not get relaxed in either
  direction.
- **The result should read as the same product at a different volume**, never
  as a generic version of "bold" or "quiet" borrowed from nowhere in particular.
  Run the finished target back through `ai-tells.md`'s litmus test before
  calling it done.
