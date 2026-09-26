# Audit lenses

Two techniques that layer onto `audit.md`'s workflow rather than replace it —
useful when a straightforward pass through the 15 principles is not surfacing
what is actually wrong, or when the interface has a sharply distinct intended
audience worth walking through deliberately. Findings from either technique
still fold into the same severity scale and report format `audit.md` already
defines; this file is not a second scoring system.

**Contents:** [Cognitive load](#cognitive-load) ·
[Persona walkthroughs](#persona-walkthroughs)

---

## Cognitive load

`ux-foundations.md` already covers Miller's law and cognitive load as named
principles. This is the operational version: three types of load, and where
each one should be spent or cut.

**Intrinsic load** is complexity inherent to the task itself — it cannot be
eliminated, only structured. Break a complex task into discrete steps, supply
scaffolding (templates, sensible defaults, examples), and group related
decisions together rather than scattering them.

**Extraneous load** is mental effort caused by the interface, not the task —
confusing navigation that forces a mental map, unclear labels that force a
guess, visual clutter competing for attention, inconsistent patterns that
prevent learning. This is pure waste and the first thing to cut.

**Germane load** is the effort of building understanding — genuinely good
load, the kind that leads to mastery rather than confusion. Support it with
progressive disclosure, consistent patterns that reward having learned them
once, and feedback that confirms the user understood correctly.

### A quick read

At any single decision point, count the distinct options, actions, or pieces
of information a user must weigh at once:

| Count | Read |
|---|---|
| ≤4 | Within comfortable working-memory limits |
| 5–7 | Pushing the boundary — consider grouping or progressive disclosure |
| 8+ | Overloaded — expect users to skip, misclick, or abandon |

In practice: one primary action plus one or two secondary ones visible, the
rest behind a menu; roughly five top-level navigation items before grouping
is warranted; one decision surfaced per screen in a gallery or portfolio index
rather than filter, sort, and tag controls all competing at once.

### Violations worth naming directly

- **The wall of options** — ten or more choices presented with no hierarchy.
  Group into categories, highlight a recommended option, or disclose
  progressively.
- **The memory bridge** — the user must recall something from an earlier step
  to complete a later one. Keep the relevant context visible, or repeat it
  where it is needed.
- **The hidden navigation** — no sense of current location, forcing a mental
  map. Show it directly: breadcrumbs, an active state, a progress indicator.
- **The context switch** — gathering the information needed for one decision
  requires jumping between screens, tabs, or modals. Co-locate what a single
  decision needs.

## Persona walkthroughs

Select two or three personas relevant to the interface under review and walk
the primary task as each one, reporting specific red flags rather than
generic concerns. Different archetypes expose different failure modes that a
single pass rarely catches on its own.

| Persona | Profile | Watch for |
|---|---|---|
| **The impatient expert** | Knows this category of product well; wants efficiency, not guidance | Forced tutorials with no skip, no keyboard path for common actions, redundant confirmations on low-risk actions |
| **The confused first-timer** | New to this category entirely; will abandon rather than puzzle it out | Icon-only controls with no label, unexplained jargon, no confirmation that an action succeeded |
| **The assistive-technology user** | Screen reader, keyboard-only, possibly low vision — see `states-and-a11y.md`'s Testing section for the full manual pass | Click-only interactions with no keyboard path, meaning carried by color alone, unlabeled controls |
| **The deliberate stress-tester** | Probes edge cases on purpose: empty states, very long input, refresh mid-flow, unexpected characters | Features that appear to work but silently fail, state lost on refresh, inconsistent behavior between similar interactions in different places |
| **The distracted, one-handed mobile user** | On a phone, interrupted often, low patience — see `mobile-web.md`'s ergonomics section | Primary actions outside the thumb zone, no state persistence across an interruption, tap targets too small or too close |

### Choosing which ones matter

| Interface type | Personas worth prioritizing |
|---|---|
| Landing page / marketing | Confused first-timer, stress-tester, mobile user |
| Dashboard / admin | Impatient expert, assistive-technology user |
| Checkout / transactional | Mobile user, stress-tester, first-timer |
| Onboarding flow | Confused first-timer, mobile user |
| Data-heavy / analytics | Impatient expert, assistive-technology user |

A real, project-specific persona beats a generic one whenever the audience is
actually known — derive one from whatever the project already says about who
uses it, rather than inventing audience details that were not given.
