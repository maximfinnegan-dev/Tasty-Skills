# Template — Planning and spec

Pattern: Explore-Plan-Confirm. Use when the approach is not settled.

Skip this entirely if you could describe the diff in one sentence.

```
Read [paths] and understand [the specific mechanism in question].

Do not write or modify any code in this task.

Produce an implementation plan covering:
- Files that change, and what changes in each
- The approach, and the alternatives you rejected with one line each on why
- Edge cases, and how each is handled
- Dependencies or migrations required
- What is explicitly out of scope
- How the finished work will be verified end to end

Constraints the plan must respect:
- [existing architecture / interfaces that cannot change / performance budget]

Write the plan to [PLAN.md] and stop for review. Do not begin implementing.
```

## The second prompt

Run this in a **fresh session** so the implementing context is clean and focused, with the plan as a durable artifact to check against.

```
Implement the plan in [PLAN.md].

Follow it as written. If you find something the plan got wrong, stop and say so
before deviating.

Verification: [command]. Run it, iterate until it passes, and show the output.

When you have finished implementing, run this gate once before reporting back:
1. Re-read [PLAN.md] and list its requirements as discrete items.
2. Score your implementation out of 10 on how completely it delivers those
   requirements — not on how good the code is in the abstract.
3. If the score is below 8, state what is missing or wrong, fix it, and re-score
   once.
4. Report the final score, one line of justification, and any requirement you
   deliberately did not meet and why.
Run this gate once, at the end. Do not re-verify work you have already verified.
```

## Notes

"Do not write or modify any code" is load-bearing. The Claude models and Sol default toward action, and a planning request that sits near a problem often gets answered with a fix. Astra leans toward asking instead, but keep the line.

The plan gated against a fresh implementing session also makes adversarial review trivial: the reviewer checks the diff against PLAN.md, which is a specification rather than a matter of opinion.

The most useful plans are self-contained — they name the files and interfaces, state what is out of scope, and end with an end-to-end verification step.

On GPT-6 Astra, keep the stop in the first prompt, since it is a real decision, but add none to the second: put the completion condition there instead.
