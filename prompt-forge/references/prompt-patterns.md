# Pattern library

Eight patterns for coding and planning prompts, plus two layers that stack onto any of them. Read the entry for the pattern selected in SKILL.md step 4.

These are distilled from the broader prompt-engineering framework literature (CO-STAR, RISEN, BAB, RACE, TIDD-EC, Plan-and-Solve, Self-Refine, Chain-of-Verification, RPEF, Reverse Role, and others). The general-purpose set assumes a model that needs procedural hand-holding; the 2026 coding models do not. What survives is the part that carries information the model cannot derive on its own: goal, grounding, boundaries, and the definition of done.

**Contents**
- [1. Spec-and-Verify](#1-spec-and-verify) — default for implementation
- [2. Explore-Plan-Confirm](#2-explore-plan-confirm) — planning before code
- [3. Symptom-Root-Cause](#3-symptom-root-cause) — debugging
- [4. Invariant-Preserving Refactor](#4-invariant-preserving-refactor)
- [5. Coverage-First Review](#5-coverage-first-review)
- [6. Interview-First](#6-interview-first) — requirements are unclear
- [7. Grounded Inquiry](#7-grounded-inquiry) — codebase questions
- [8. Stateful Long-Horizon](#8-stateful-long-horizon) — multi-window work
- [Layer: Few-shot examples](#layer-few-shot-examples)
- [Layer: Adversarial review](#layer-adversarial-review)
- [Choosing between similar patterns](#choosing-between-similar-patterns)

---

## 1. Spec-and-Verify

**Use when** the change is understood and the job is to build it. This is the default for implementation work and the pattern you will reach for most.

**Why it works.** These models complete what they are given and stop when the work looks done. A specification tells them what "done" contains; a runnable check tells them when they have reached it. Without the check, "looks done" is the only available signal and the user becomes the verification loop, catching every mistake by hand.

**Shape**

```
[Objective — the end state, one or two sentences]

[Context — file paths, current behavior, the existing pattern to follow,
versions, error text. Long material goes above everything else.]

Requirements:
- [discrete, individually checkable]

Constraints:
- Do not [explicit prohibition]

Scope: change only [paths]. Do not modify [paths].

Verification: [command that returns pass/fail]. Run it after implementing,
iterate until it passes, and show the output rather than asserting success.

Output: [diff / files changed / commit]

[completion gate]
```

**Failure modes.** Requirements written as a paragraph rather than a list — the model satisfies the ones it parsed and silently drops the rest, and the completion gate has nothing discrete to score against. Verification stated as "make sure it works" — not runnable, so not a check. Scope left open — Opus 5 in particular will widen it.

---

## 2. Explore-Plan-Confirm

**Use when** the approach is not settled: multi-file changes, unfamiliar code, or several plausible designs. Separating research from execution is what prevents a well-implemented solution to the wrong problem.

Skip it when you could describe the diff in one sentence. Planning has real overhead.

**Shape**

```
Read [paths] and understand [the specific mechanism in question].

Do not write or modify any code in this task.

Produce an implementation plan covering:
- files that change and what changes in each
- the approach, and the alternatives you rejected with one line on why
- edge cases and how each is handled
- what is explicitly out of scope
- how the finished work will be verified end to end

Write the plan to [PLAN.md]. Stop there for review.
```

**The two-session pattern.** Plan in one session, implement in a fresh one that starts from the written plan. The implementing session gets clean context focused entirely on execution, and the plan is a durable artifact to check the result against. This works better than one long session, and it makes the [adversarial review layer](#layer-adversarial-review) trivially easy — the reviewer checks the diff against `PLAN.md`.

On GPT-6 Astra, keep the plan's "Stop there for review", which is a real decision, but add no second stop to the implementing prompt: a stop-for-review after the first implementation pulls Astra toward finishing early. Put the completion condition there instead.

The most useful plans are self-contained: they name the files and interfaces involved, state what is out of scope, and end with an end-to-end verification step. Time spent making the plan precise pays back more than time spent watching the implementation.

---

## 3. Symptom-Root-Cause

**Use when** something is failing. The defect in most debugging prompts is that the user states their *diagnosis* instead of the *symptom* — which anchors the model to a theory that may be wrong.

**Shape**

```
[Symptom: what the user observes, verbatim — the actual error text, the
failing input, the reproduction steps]

[Where it probably lives, if known — but as a starting point, not a verdict]

Write a failing test that reproduces this first. Then fix the root cause and
show the test passing.

Do not suppress the error, catch-and-ignore it, or special-case the failing
input. If the real fix is larger than expected, say so before making it.
```

**Why the failing test comes first.** It converts "I think it's fixed" into a signal that can be read, and it guards against a fix that addresses a symptom while leaving the cause. It also gives the completion gate something objective to score.

**The prohibition matters.** Without it, a model under pressure to make a check pass may hardcode around it. Add this when the task is test-driven:

```
Implement a solution that works for all valid inputs, not just the test cases.
Do not hard-code values or write logic that only satisfies specific test inputs.
Tests verify correctness; they do not define the solution. If a test is itself
wrong, or the task is infeasible, say so rather than working around it.
```

---

## 4. Invariant-Preserving Refactor

**Use when** structure changes and behavior must not. The whole prompt hangs on making the invariant explicit and checkable.

**Shape**

```
Refactor [target] from [current structure] to [target structure].

Behavior must not change. Specifically, these must hold: [named invariants —
public API signatures, output format, side effects, performance
characteristics].

Constraints:
- Do not change [public interfaces / DB schema / config format]
- Do not add features, abstractions, or "improvements" alongside the refactor

Verification: the existing test suite passes unchanged. Do not modify or
delete tests — a modified test no longer proves the behavior it was written
to prove. If a test must change to accommodate the refactor, stop and explain
why before changing it.

[completion gate]
```

**The anti-overengineering clause.** Opus 5 and its predecessors tend to overengineer — extra files, unnecessary abstractions, unrequested flexibility. Refactors are where this does the most damage, since the model is already restructuring. Add:

```
Only make changes directly requested or clearly necessary. Do not add
docstrings, comments, or type annotations to code you did not change. Do not
add error handling for scenarios that cannot happen. Do not create helpers or
abstractions for one-time operations, or design for hypothetical future
requirements. The right amount of complexity is the minimum needed for the
current task.
```

---

## 5. Coverage-First Review

**Use when** the job is to find problems in existing code. The counterintuitive rule: **do not ask for filtered findings.**

The Claude models and Sol follow filtering instructions literally. "Only report high-severity issues", "be conservative", "don't nitpick" — the model still investigates just as deeply, then declines to report findings below the stated bar. Precision rises, recall falls, and real bugs are silently dropped. OpenAI's Astra guide does not test filtering; its stronger instruction following makes the same precaution sensible.

**Shape**

```
Review [target] for [bug classes: correctness, concurrency, error handling,
security, resource leaks].

Report every issue you find, including ones you are uncertain about or consider
low-severity. Do not filter for importance or confidence at this stage. Your
goal here is coverage: it is better to surface a finding that later gets
filtered out than to silently drop a real bug.

For each finding: file and line, what breaks and under what conditions, an
estimated severity, and your confidence level.

Do not fix anything. Report only.
```

Filter in a second pass. If you must self-filter in one pass, set the bar concretely — "report any bug that could cause incorrect behavior, a test failure, or a misleading result; omit pure style and naming preferences" — rather than using words like "important".

**A caution.** A reviewer asked to find gaps will usually report some, because that is what it was asked to do. Chasing every finding produces over-engineering: extra abstraction layers, defensive code, tests for cases that cannot happen. Treat correctness findings as required and the rest as optional.

---

## 6. Interview-First

**Use when** the user knows roughly what they want but cannot specify it, and guessing would be expensive. Invert the flow: the model asks, the user answers, then the model writes the spec.

**Shape**

```
I want to build [one-line description].

Interview me in detail before writing anything. Ask about technical
implementation, UI/UX, edge cases, failure modes, and tradeoffs. Do not ask
obvious questions — dig into the hard parts I might not have considered.

Keep interviewing until we have covered everything, then write a complete
spec to SPEC.md covering the files and interfaces involved, what is out of
scope, and an end-to-end verification step that proves the feature works.
```

If the target harness has a structured question tool, name it — the user tapping options beats the user typing paragraphs.

Then start a fresh session to execute the spec.

**When to reach for this instead of just asking questions yourself:** when the unknowns are domain unknowns the user holds and you cannot enumerate them from outside. If you can name the three questions, ask them (SKILL.md step 3) and skip this pattern.

---

## 7. Grounded Inquiry

**Use when** the deliverable is an answer about a codebase, not a change. The risk here is confident speculation about code the model never opened.

**Shape**

```
[Question]

Read [specific paths / git history / the relevant tests] before answering.

Answer from what the code actually does. Quote the specific lines your answer
rests on. If something is unclear from the code, say so rather than inferring
what it probably does.

Do not modify any files.
```

For a stronger grounding constraint, or when the model has already speculated once:

```
<investigate_before_answering>
Never speculate about code you have not opened. If the user references a
specific file, you must read the file before answering. Investigate and read
relevant files before answering questions about the codebase. Never make
claims about code before investigating unless you are certain of the answer.
</investigate_before_answering>
```

The "do not modify any files" line is doing real work — the Claude models and Sol default toward action, and a question phrased near a problem often gets answered with a fix. Astra leans toward asking instead, but keep the line: it costs nothing, and a stated boundary is honored.

---

## 8. Stateful Long-Horizon

**A layer, not a standalone pattern.** Add it to any of the above when the task will outlive one context window.

**What to include**

```
This is a long task. Work incrementally and keep state on disk so a fresh
session can resume from it:
- Track task status in [tests.json / TODO.md] in a structured format
- Keep freeform progress notes in [progress.txt]: what was done, what is next,
  what was tried and failed
- Commit at each working checkpoint with a descriptive message

Do not remove or edit tests to make progress — that hides missing or broken
functionality.
```

**Structured for state, unstructured for notes.** JSON for anything with a schema — test status, task lists, counts. Freeform text for progress narrative. Git for checkpoints; these models are strong at reconstructing state from git history.

**Starting a fresh window.** Prefer a clean session over compaction where you can — these models are effective at discovering state from the filesystem. Be prescriptive about the restart:

```
Call pwd; you can only read and write files in this directory.
Review progress.txt, tests.json, and the git log.
Run the integration test suite before implementing anything new.
```

**If the harness compacts context,** say so, or the model will try to wrap up work as it approaches the limit:

```
Your context window will be automatically compacted as it approaches its
limit, so you can continue working from where you left off. Do not stop tasks
early due to token budget concerns. As you approach the limit, save your
progress and state before the context refreshes.
```

---

## Layer: Few-shot examples

Stacks onto any pattern. The highest-leverage single technique in prompting, and underused in coding prompts because people think of examples as a writing-task device.

**Add examples when** format matters more than description: structured extraction, strict output schemas, commit-message conventions, matching an existing code style, classification into a fixed label set, error-message formats. When you find yourself writing a long paragraph describing a shape, stop and show the shape instead.

**Rules**

- Two to five. More has diminishing returns; one risks the model over-fitting to its incidentals.
- Cover the edge cases and vary enough that the model does not latch onto an unintended pattern shared by all of them.
- Write them in the exact target output format.
- Place them after the instructions and before the actual task, so the real task is last.
- For Claude targets, wrap in `<example>` tags (multiple in `<examples>`) so they are unambiguously not instructions.
- **Only use examples the user or their material actually supplied.** An invented example is a fabricated requirement that will be implemented faithfully.

---

## Layer: Adversarial review

Stacks onto any implementation pattern. The longer a model works unattended, the more an independent check matters before the work counts as done.

A reviewer running in a fresh context sees the diff and the criteria, not the reasoning that produced the change, so it evaluates the result on its own terms rather than re-confirming its own conclusions.

```
Use a subagent to review the [target] diff against [PLAN.md / the requirements
above]. Check that every requirement is implemented, that the listed edge cases
have tests, and that nothing outside the task's scope changed. Report gaps that
affect correctness or the stated requirements — not style preferences.
```

**This is distinct from the completion gate**, and they are not substitutes. The gate is the implementer scoring itself against the request, catching missing requirements cheaply. Adversarial review is a fresh context catching what the implementer cannot see about its own work. Use the gate always; add adversarial review for long unattended runs and high-stakes changes.

**Do not use it on Opus 5 as generic verification.** Opus 5 verifies its own work natively, and "use a subagent to verify" is one of the specific instructions its docs say to remove. Adversarial review earns its place when there is a *specification* to check against — a plan, a ticket, a requirements list — not as a second opinion on correctness the model already established. On GPT-6 Astra the explicit "use a subagent" instruction is what makes this layer happen, since it may delegate less than the workflow wants.

---

## Choosing between similar patterns

| If you are torn between | Choose | Because |
|---|---|---|
| Spec-and-Verify vs. Explore-Plan-Confirm | Plan first if you cannot name the files that will change | If you can describe the diff in a sentence, planning is overhead |
| Explore-Plan-Confirm vs. Interview-First | Interview if the unknowns are the *user's* domain knowledge | Exploration reads code; interviewing reads the user |
| Symptom-Root-Cause vs. Coverage-First Review | Symptom if there is a known failure | Review is for finding unknown problems |
| Refactor vs. Spec-and-Verify | Refactor if behavior must be identical afterward | The invariant is the whole job |
| Grounded Inquiry vs. anything | Inquiry if the deliverable is an answer, not a change | And say "do not modify files" explicitly |

When two patterns would produce the same prompt, say so and pick the simpler one. The pattern name never appears in the emitted prompt, so a confident rationale for an invisible distinction is exactly the overstatement this skill exists to remove.
