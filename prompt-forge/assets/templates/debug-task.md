# Template — Debugging

Pattern: Symptom-Root-Cause. Use when something is failing.

```
[SYMPTOM — what is observed, verbatim. Paste the actual error text, the failing
input, and the steps to reproduce. State what you expected instead.]

[Where it probably lives, if known — as a starting point, not a verdict.]

Reproduce it first: write a failing test that demonstrates this bug. Then fix
the root cause and show the test passing.

Constraints:
- Do not suppress the error, catch-and-ignore it, or special-case the failing
  input
- Address the root cause, not the symptom
- If the real fix is larger than it appears, say so before making it

Scope: [paths]. Do not modify [paths].

Verification: run [full test command]. The new test passes and no existing test
breaks. Show the output.

When you have finished implementing, run this gate once before reporting back:
1. Re-read the original request and list its requirements as discrete items.
2. Score your implementation out of 10 on how completely it delivers those
   requirements — not on how good the code is in the abstract.
3. If the score is below 8, state what is missing or wrong, fix it, and re-score
   once.
4. Report the final score, one line of justification, and any requirement you
   deliberately did not meet and why.
Run this gate once, at the end. Do not re-verify work you have already verified.
```

## If the task is test-driven

When the prompt says "make the failing tests pass", add the general-solution clause. Without it, a model under pressure to turn a check green may satisfy it rather than solve the problem:

```
Implement a solution that works correctly for all valid inputs, not just the
test cases. Do not hard-code values or write logic that only satisfies specific
test inputs. Tests verify correctness; they do not define the solution. If a
test is itself incorrect, or the task is infeasible, say so rather than working
around it.
```

## Notes

The most common defect in a debugging prompt is the user stating a **diagnosis** instead of a **symptom** — "fix the race condition in the cache" when a race condition is a hypothesis. That anchors the model to a theory that may be wrong, and it will find a way to make that theory fit. State what is observed; offer the theory separately as a hypothesis.

The failing test comes first because it converts "I think it's fixed" into a readable signal, and it gives the completion gate something objective to score.

Ask what has already been tried. It usually earns one of your three questions — without it the model often retraces the user's failed path.

On GPT-6 Astra, "say so before making it" is a stop-and-ask. Keep it when a larger fix would cross the scope or risk boundary; otherwise "note it in your report and continue" avoids an early stop.
