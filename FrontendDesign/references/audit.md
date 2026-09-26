# Auditing an interface

Evaluating an interface that already exists, rating what you find, and fixing
it without making the product less coherent than you found it.

**Contents:** [The workflow](#the-workflow) · [Discover](#1-discover) ·
[Evaluate](#2-evaluate) · [The 15 principles](#the-15-principles) ·
[Severity](#severity) · [Report](#3-report) · [Implement](#4-implement) ·
[Coherence pass](#5-coherence-pass) · [Re-review](#6-re-review) ·
[Communicating findings](#communicating-findings)

---

## The workflow

1. **Discover** — read everything, not just the component named.
2. **Evaluate** — walk all 15 principles deliberately.
3. **Report** — findings by severity, each with a principle, a location, a user
   impact, and a fix.
4. **Implement** — foundation first, then fixes through it.
5. **Coherence pass** — make the fixes read as one system.
6. **Re-review** — catch what the fixes introduced.

For a review-only request, stop after step 3. For "audit a live URL", the audit
is report-only and you must state what you could not evaluate from served
markup: JavaScript behavior, computed styles, hover and focus states,
client-side routing, and actual rendered layout.

---

## 1. Discover

Read the front-end code thoroughly. You need to know what the interface is,
who uses it, what the primary flows are, and what design system is in use — and
whether it is applied consistently.

Read the **application shell** as well as the components: the document head
(language attribute, viewport, title, meta), global styles, and layout
components. Cross-page problems only surface once you have seen everything.

**Read every page.** Different pages hold different problems: a settings screen
missing the validation the main form handles well, a 404 that breaks the visual
language entirely. If a project has more than about 20 UI files, ask which
flows to focus on, but still read the shared layout and sample each distinct
section.

**Find the hidden UI.** These get the least design attention and hold the worst
problems. Search for and evaluate each: modals, dropdowns, menus, popovers,
drawers, tooltips, toasts, accordions, tabs, form validation states, empty
states, loading states, error states, and confirmation dialogs.

---

## 2. Evaluate

Walk **every** principle, one at a time, against the code. Do not skip one
because it seems unlikely — systematic coverage is where the value is.

Evaluate at three levels:

**Component level** — semantics and structure, styling and hierarchy,
behavior (loading, error handling, validation, feedback), accessibility
attributes, responsive behavior.

**Visual level** — the layer most often missed. Typography hierarchy, spacing
and proximity, visual weight and emphasis, purposeful color, information
density, alignment, and the visibility of interactive states. If every finding
you have is an ARIA attribute, you have not looked at the design yet.

**System level** — where the deepest value is. Cross-page consistency of tokens
and patterns, consistency of interaction behavior, design-system coherence,
navigation and wayfinding, and whether clickable is distinguishable from
non-clickable throughout.

Before writing the report, confirm you consciously assessed all 15. If a
principle has neither a finding nor a noted strength, you skimmed it — go back.

**Do not fabricate findings.** If a principle is well handled, record it as a
strength. But do not self-limit either: a real interface usually has issues
under most principles. If you have fewer than about ten findings, look harder
at the visual layer, the hidden UI, cross-page patterns, edge cases, and the
app shell.

If a careful pass through all 15 still isn't surfacing what's actually wrong,
or the interface has a sharply distinct intended audience worth walking
through deliberately, `references56/audit-lenses.md` has two more techniques —
a cognitive-load breakdown and persona walkthroughs — that feed into this same
report rather than replacing it.

---

## The 15 principles

| # | Principle | Look for |
|---|---|---|
| 1 | **Visibility of system status** | Async operations with no loading state; buttons that do not disable during a request; no success or error confirmation; navigation with no active state; multi-step flows with no progress; hover and selected states too subtle to perceive; content jumping as images load |
| 2 | **Match to the real world** | Developer jargon in labels ("Execute", "Payload", "Submit"); raw error codes and stack traces shown to users; unformatted dates and numbers; information ordered by database or module structure rather than by task; controls placed far from what they affect |
| 3 | **User control and freedom** | Destructive actions with no confirmation or undo; dialogs with no Escape, close button, or overlay dismiss; multi-step flows with no back; forms that lose data on accidental navigation; autoplaying media with no control |
| 4 | **Consistency and standards** | The same action styled differently across pages; one concept under several names ("Delete" / "Remove" / "Trash"); several implementations of the same component; hardcoded values where tokens exist; links behaving as buttons; navigation in a non-standard place |
| 5 | **Error prevention** | Validation only on submit; free text where a constrained control belongs; double submission possible; missing `type`, `inputmode`, `pattern`, `min`, `max`, `autocomplete`; invalid combinations permitted (end date before start); tiny tap targets on form controls |
| 6 | **Recognition over recall** | Empty states with no guidance; fields with no label or example; requiring users to carry an ID between screens; no search or autocomplete on a large set; missing breadcrumbs in a deep hierarchy; critical information available only on hover |
| 7 | **Flexibility and efficiency** | No keyboard path for common actions; no bulk operations on repetitive work; no saved preferences; `prefers-reduced-motion`, `prefers-color-scheme`, and `prefers-contrast` ignored; fixed `px` font sizes overriding the user's browser setting |
| 8 | **Aesthetic and minimalist design** | Flat type scale; too many competing elements at equal weight; no progressive disclosure on a complex form; several equally prominent calls to action; uniform spacing with no proximity grouping; more than five or six colors in active use; cramped card padding |
| 9 | **Error recovery** | Generic messages ("Something went wrong"); technical detail surfaced to users; errors shown far from their cause; no `role="alert"` or `aria-invalid`; errors that auto-dismiss; errors that clear the user's input; no retry; unhandled network loss |
| 10 | **Help and documentation** | No guidance on a complex feature; specialized fields with no explanation; help only available off-site; no examples or templates for complex input |
| 11 | **Affordances and signifiers** | Clickable elements that do not look clickable, and static ones that do; no visual hierarchy between primary and secondary actions; icon-only controls with no label; touch targets under 44px; external links not marked as external |
| 12 | **Structure** | Related items not grouped; no visual section boundaries; navigation that breaks below the desktop breakpoint; missing landmarks (`<main>`, `<nav>`); broken heading order |
| 13 | **Accessibility** | Missing or useless alt text; contrast failures; removed focus rings; unreachable-by-keyboard controls; `<div>` acting as a button; missing form labels; ARIA that contradicts the semantics; no page language |
| 14 | **Perceptibility** | State changes users cannot perceive; hierarchy that does not survive scanning; meaning carried by color alone; text too small to read comfortably; low-contrast secondary text |
| 15 | **Tolerance and forgiveness** | Input rejected for formatting the system could normalize (spaces in a card number); data lost on error or navigation; no undo; no draft or autosave on long forms |

---

## Severity

| Rating | Label | Meaning |
|---|---|---|
| 0 | Not a problem | No usability issue |
| 1 | Cosmetic | Aesthetic only; fix if time allows |
| 2 | Minor | Users notice and work around it |
| 3 | Major | Users struggle significantly |
| 4 | Catastrophe | Users cannot complete the task, or make serious errors |

Three factors set it: **frequency** (how many users hit it), **impact** (how
hard it is to overcome), and **persistence** (whether users learn to avoid it
or hit it every time). Frequent, high-impact, recurring is a 4.

**Rate on user impact, never on how easy the fix is.** A one-line fix for a
blocking problem is still a 4. Do not inflate severity to look thorough — it
destroys the ranking that makes the report useful.

---

## 3. Report

```markdown
## Design audit

**Scope:** [what was evaluated]
**Source:** [every file reviewed, or every URL fetched]
**Interface type:** [dashboard / form / marketing / e-commerce / …]
**Limitations:** [URL audits only: what could not be evaluated]

### How to read this
Findings are rated 0-4 (4 = users cannot complete tasks, 1 = cosmetic).
Each references a usability principle. The most impactful are first.

### Summary

| Severity | Count |
|---|---|
| 4 - Catastrophe | X |
| 3 - Major | X |
| 2 - Minor | X |
| 1 - Cosmetic | X |
| **Total** | **X** |

### Quick wins
The highest-impact issues that are also straightforward:
1. [Title] (Severity X) - [one-line fix]
2. …

### Findings

#### [Severity 4] Title
- **Principle:** [which one]
- **Location:** `file.tsx:42`
- **Issue:** [what is wrong]
- **User impact:** [what real users experience — concrete]
- **Fix:** [specific and actionable, at code level]

[…grouped by severity, descending…]

### Strengths
[At least three specific things the interface does well, with the principle
each satisfies. This tells the user what not to change, and a report that is
only negative is less useful and less trusted.]
```

---

## 4. Implement

Fix in three phases. Do not skip to individual fixes — the foundation comes
first, or you produce a pile of patches instead of an improved interface.

### Phase 1: establish the foundation

If the project has a design system, this phase is reading it and identifying
where components have drifted off it. If it does not, extract the implicit one:
scan the CSS, see what values are actually in use, and consolidate them into a
spacing scale, a type scale with real weight differentiation, a palette (one
accent, one or two semantic colors, a neutral ramp), two or three elevation
levels, one or two radii, and one transition duration and easing.

Consolidate icon usage to one source at one stroke weight. Mixed icon styles
are among the most visible signs of an unpolished interface.

### Phase 2: apply fixes through the foundation

**Code-level fixes** — ARIA, semantics, handlers, meta: make the minimum change
and preserve the surrounding style.

**Visual fixes** — use the tokens from Phase 1 and be confidently visible. If
the type scale is flat, establish a real hierarchy. If every button looks alike,
make the primary action dominant. A timid change — a hex shifted by a digit, a
font size by 0.05rem — does not solve the problem it was meant to solve, and
the audit finding stays true.

Preserve the existing visual identity while improving clarity within it. You
are improving this product, not replacing it with your own taste.

**Flow fixes** — consistent transition timing everywhere, visual continuity on
state change, a smooth path from loading through success.

---

## 5. Coherence pass

After the individual fixes, review the interface as a whole. This is what turns
scattered fixes into a polished result.

- **Spacing** — same card padding, section gaps, and field spacing everywhere,
  all from the scale?
- **Typography** — one scale across all pages, no orphan sizes?
- **Color** — accent used sparingly, neutral foundation clear, no values off
  the palette?
- **Icons** — one library, consistent size per context, one fill style per
  hierarchy level?
- **Components** — all cards alike, all buttons at a given level alike, all
  section containers alike?
- **Interactive states** — the same hover, focus, active, and disabled
  treatment on every element of a kind, with none missing?
- **Transitions** — one duration and easing family, no jarring mismatch?
- **Alignment** — a consistent grid, content areas aligned across sections?
- **Semantic-visual sync** — every ARIA attribute added has a visible
  counterpart, and the new CSS rule actually applies rather than being
  overridden by an existing class selector?

---

## 6. Re-review

Re-read the modified files with fresh eyes. This is not a second full audit —
it is a focused check for what fixes commonly introduce, and it typically finds
several more issues.

**Introduced by the fixes:**

- ARIA attributes added without a corresponding visible style.
- New CSS rules that never apply because an existing selector wins on
  specificity.
- Hardcoded values that slipped in during Phase 2 instead of using tokens.
- Newly exposed imbalance — making one heading bolder can leave its neighbors
  looking under-styled.

**Missed by the first pass:**

- Complex composites: grouped table rows, multi-level navigation, comparison
  matrices, nested accordions. Their alignment problems only appear once the
  data is styled.
- State combinations: active plus hover, selected plus disabled, expanded plus
  focused.
- Content edge cases: text that wraps, empty cells, single-item lists,
  maximum-length values.

Fix what you find and report the additional changes. If this pass surfaces more
than three findings at severity 2 or above, say a further round may be
worthwhile — but do not start one automatically.

---

## Communicating findings

**Open with the outcome, not the process.** "I'll look through the interface,
find what is tripping users up, and fix it" — not a narration of which files
you are about to read.

**Explain why, briefly.** Connect each finding to real behavior. "This form
submits with no loading indicator, so users cannot tell whether it worked and
may click again, causing duplicate submissions" beats a citation of the
underlying heuristic. Adjust to the audience: name principles directly for
someone who uses the vocabulary, explain plainly for someone who does not.

**Be concrete.** Exact file and line, the specific principle, the real user
consequence, and an actual fix — never "improve this".

**Be honest.** Acknowledge what is well built, note when a finding is
debatable or context-dependent, and say clearly when something is a matter of
taste rather than usability.
