# Template — Code review

Pattern: Coverage-First Review. The counterintuitive one: do not ask for filtered findings.

```
Review [target: diff / PR / paths] for [bug classes: correctness, concurrency,
error handling, security, resource leaks, API misuse].

Context: [what this code does, what changed and why, the invariants it must
preserve]

Report every issue you find, including ones you are uncertain about or consider
low-severity. Do not filter for importance or confidence at this stage — a
separate pass will do that. Your goal here is coverage: it is better to surface
a finding that later gets filtered out than to silently drop a real bug.

For each finding, give:
- File and line
- What breaks, and under what conditions
- Estimated severity
- Your confidence level

Do not fix anything. Report only.
```

## Why not to ask for filtered findings

The Claude models and Sol follow filtering instructions literally, and OpenAI's Astra guide does not test it; its stronger instruction following makes the same precaution sensible. "Only report high-severity issues", "be conservative", "don't nitpick" — the model still investigates just as deeply, then declines to report anything below the stated bar. Precision rises and measured recall falls, and the dropped findings include real bugs. This shows up as an apparent capability regression when a review harness tuned for an older model is pointed at a newer one; it is a harness effect.

If a single pass must self-filter, set the bar concretely rather than qualitatively:

```
Report any bug that could cause incorrect behavior, a test failure, or a
misleading result. Omit pure style and naming preferences.
```

## Reviewing against a specification

When there is a plan or requirements list to check against, that is a different and often more valuable review:

```
Review the [target] diff against [PLAN.md / the requirements]. Check that every
requirement is implemented, that the listed edge cases have tests, and that
nothing outside the task's scope changed. Report gaps that affect correctness or
the stated requirements — not style preferences.
```

Run this in a fresh context or subagent. On GPT-6 Astra, which may delegate less than the workflow wants, say so explicitly. A reviewer that sees only the diff and the criteria evaluates the result on its own terms, rather than re-confirming the reasoning that produced it.

## A caution

A reviewer asked to find gaps will usually report some, because that is what it was asked to do. Chasing every finding produces over-engineering — extra abstraction layers, defensive code, tests for cases that cannot happen. Treat correctness findings as required and the rest as optional.

Note also that no completion gate appears in this template. The deliverable is findings, not code. If the review is followed by a fix pass, the gate belongs on the fix prompt.
