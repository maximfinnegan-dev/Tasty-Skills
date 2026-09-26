# System extraction

`design-direction.md` covers two cases: a project with an established system
(use its tokens) and a project with none (derive one from scratch). This file
covers the case between them — a codebase with real, working components that
were never formalized into a system, where the same spacing value, the same
button shape, or the same card pattern is written out by hand in a dozen
places, each slightly different. Read this when asked to "extract," "clean up,"
"consolidate," or "systematize" styling, or during an audit's foundation phase
on a project that has no formal tokens to read but does have a working UI to
learn from.

## The rule of three

Extract a value or pattern into a token or shared component once it recurs
three or more times with the same intent — not on the first occurrence, and not
"eventually, once it feels reusable." Extracting too early produces an
abstraction nobody else uses yet, built on a guess about what the second and
third use sites will need; extracting too late leaves drift to keep
compounding. Three real occurrences is enough evidence that the pattern is
real rather than coincidental, without waiting so long that undoing the
duplication becomes its own project.

## What to look for

- **Repeated hard-coded values that share intent**: the same spacing number,
  color, shadow, radius, or animation duration typed out independently in
  multiple components rather than referencing one source.
- **Repeated component shapes**: a card, a button, an input rendered slightly
  differently in three or more places, none of them wrong exactly, all of them
  drifting from each other.
- **Repeated composition patterns**: a form-row layout, a toolbar group, an
  empty-state shape that keeps getting rebuilt rather than reused.
- **Repeated type-style combinations**: the same size, weight, and line-height
  triplet appearing together often enough to be a role (a "card title" style)
  rather than a coincidence.

## Intent before appearance

Two components that look alike are not automatically the same component. A
primary call-to-action button and a settings toggle that happens to be styled
similarly are serving different jobs; merging them into one component with a
growing prop list to cover both intents is the failure
`react-architecture.md`'s Composition section already warns about — a
component whose configuration surface keeps expanding wants to be two
components, not one flexible one. Extract what shares a genuine purpose;
leave what merely looks similar alone.

## Migration is part of the job, not a follow-up

An extraction that leaves the old, duplicated implementations sitting next to
the new shared one is not finished — it has just added a second way to do the
same thing, which is worse than the original drift. Once a token or component
exists:

1. Find every instance of the pattern it replaces.
2. Replace each one, in place, with the shared version.
3. Verify visual and functional parity at each site before moving to the next.
4. Delete the old implementation once nothing references it.

Do this systematically rather than opportunistically — a partial migration
that stops after the first few sites leaves the codebase with three ways to
build a card instead of one, which is a worse state than before the extraction
started.

## Naming

Name the extracted tokens and components after the project's own existing
conventions — prefix style, casing, the vocabulary already used elsewhere in
the codebase — rather than importing a naming scheme from a different system
or framework default. The whole point of extracting from the project's own
code is that the result belongs to this project; a token set that reads like
it was copied in from somewhere else undercuts that immediately, however
well-organized it is internally.
